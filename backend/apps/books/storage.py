import json
import os
import uuid
from functools import lru_cache
from pathlib import Path
from typing import Optional
from urllib import error, parse, request

from django.conf import settings
from django.core.files.storage import default_storage


def _get_fitz():
    try:
        import fitz  # type: ignore
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "PyMuPDF is not installed in the backend environment. Install it with `pip install PyMuPDF`."
        ) from exc
    return fitz


def _supabase_configured() -> bool:
    return bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY)


def _supabase_headers(content_type: Optional[str] = None) -> dict:
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
    }
    if content_type:
        headers["Content-Type"] = content_type
    return headers


def _ext_from_name(name: str) -> str:
    return Path(name).suffix.lower() or ".bin"


def _build_storage_key(prefix: str, filename: str) -> str:
    return f"{prefix}/{uuid.uuid4().hex}{_ext_from_name(filename)}"


def _upload_to_supabase(bucket: str, storage_key: str, file_obj) -> None:
    url = f"{settings.SUPABASE_URL}/storage/v1/object/{bucket}/{parse.quote(storage_key, safe='/')}"
    content = file_obj.read()
    req = request.Request(url=url, data=content, method="POST")
    req.add_header("apikey", settings.SUPABASE_SERVICE_ROLE_KEY)
    req.add_header("Authorization", f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}")
    req.add_header("x-upsert", "true")
    req.add_header("Content-Type", getattr(file_obj, "content_type", "application/octet-stream"))

    try:
        request.urlopen(req, timeout=30)
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Supabase upload failed ({exc.code}): {body}")
    finally:
        file_obj.seek(0)


def _public_object_url(bucket: str, storage_key: str) -> str:
    return f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket}/{storage_key}"


def _save_upload_local(file_obj, subfolder: str) -> str:
    ext = file_obj.name.rsplit(".", 1)[-1] if "." in file_obj.name else "bin"
    filename = f"{subfolder}/{uuid.uuid4().hex}.{ext}"
    path = default_storage.save(filename, file_obj)
    return f"{settings.MEDIA_URL}{path}"


def save_cover_image(file_obj) -> str:
    """
    Save a cover image and return a URL suitable for direct client rendering.
    Uses Supabase public bucket when configured, else local media URL.
    """
    if not _supabase_configured():
        return _save_upload_local(file_obj, "covers")

    storage_key = _build_storage_key("covers", file_obj.name)
    _upload_to_supabase(settings.SUPABASE_STORAGE_COVER_BUCKET, storage_key, file_obj)
    return _public_object_url(settings.SUPABASE_STORAGE_COVER_BUCKET, storage_key)


def save_pdf_file(file_obj) -> str:
    """
    Save a PDF file and return a storage reference.
    - Supabase mode: returns the storage object key (private bucket).
    - Local mode: returns /media/... URL for backward compatibility.
    """
    if not _supabase_configured():
        return _save_upload_local(file_obj, "pdfs")

    storage_key = _build_storage_key("pdfs", file_obj.name)
    _upload_to_supabase(settings.SUPABASE_STORAGE_PDF_BUCKET, storage_key, file_obj)
    return storage_key


def build_signed_pdf_url(file_ref: str) -> str:
    """
    Convert stored PDF reference to an accessible URL.
    - Supabase mode: signs a private object key and returns full signed URL.
    - Local mode: returns an absolute URL for local media paths.
    """
    if not file_ref:
        return ""

    # Already absolute
    if file_ref.startswith("http://") or file_ref.startswith("https://"):
        return file_ref

    # Local media path fallback
    if file_ref.startswith(settings.MEDIA_URL):
        backend_origin = os.getenv("BACKEND_PUBLIC_ORIGIN", "http://localhost:8000")
        return f"{backend_origin}{file_ref}"

    # Supabase private object key
    if not _supabase_configured():
        return file_ref

    sign_url = (
        f"{settings.SUPABASE_URL}/storage/v1/object/sign/"
        f"{settings.SUPABASE_STORAGE_PDF_BUCKET}/{parse.quote(file_ref, safe='/')}"
    )
    payload = json.dumps({"expiresIn": settings.SUPABASE_SIGNED_URL_EXPIRES_IN}).encode("utf-8")
    req = request.Request(url=sign_url, data=payload, method="POST")
    for key, value in _supabase_headers("application/json").items():
        req.add_header(key, value)

    try:
        with request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Supabase sign URL failed ({exc.code}): {body}")

    signed_path = data.get("signedURL") or data.get("signedUrl")
    if not signed_path:
        raise RuntimeError("Supabase sign URL response missing signedURL")

    if signed_path.startswith("http://") or signed_path.startswith("https://"):
        return signed_path
    if signed_path.startswith("/storage/v1/"):
        return f"{settings.SUPABASE_URL}{signed_path}"
    if signed_path.startswith("/"):
        return f"{settings.SUPABASE_URL}/storage/v1{signed_path}"
    return f"{settings.SUPABASE_URL}/storage/v1/{signed_path}"


def fetch_pdf_bytes(file_ref: str) -> bytes:
    if not file_ref:
        raise RuntimeError("Missing PDF file reference")

    if file_ref.startswith(settings.MEDIA_URL):
        relative_path = file_ref[len(settings.MEDIA_URL):].lstrip("/")
        full_path = settings.MEDIA_ROOT / relative_path
        with open(full_path, "rb") as handle:
            return handle.read()

    source_url = build_signed_pdf_url(file_ref)
    with request.urlopen(source_url, timeout=30) as resp:
        return resp.read()


@lru_cache(maxsize=128)
def get_pdf_page_count(file_ref: str) -> int:
    fitz = _get_fitz()
    pdf_bytes = fetch_pdf_bytes(file_ref)
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        return doc.page_count


@lru_cache(maxsize=256)
def render_pdf_page_png(file_ref: str, page_number: int, scale: float = 1.7) -> bytes:
    fitz = _get_fitz()
    pdf_bytes = fetch_pdf_bytes(file_ref)
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        if page_number < 1 or page_number > doc.page_count:
            raise RuntimeError("Requested page is out of range")
        page = doc.load_page(page_number - 1)
        matrix = fitz.Matrix(scale, scale)
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        return pix.tobytes("png")
