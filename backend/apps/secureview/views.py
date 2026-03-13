from urllib import error, request as urlrequest

import jwt
from django.conf import settings
from django.http import HttpResponse
from django.utils.text import slugify
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.authentication import JWTAuthentication
from apps.books.models import EBook
from apps.books.storage import build_signed_pdf_url, get_pdf_page_count, render_pdf_page_png
from apps.transactions.models import UserLibrary
from apps.users.models import User


def _authenticate_reader_user(request):
    """Authenticate from Authorization header first, then token query param for iframe usage."""
    auth = JWTAuthentication()
    user, _ = auth.authenticate(request)
    if user:
        return user

    query_token = request.GET.get("token", "")
    if not query_token:
        return None

    try:
        payload = jwt.decode(query_token, settings.SECRET_KEY, algorithms=["HS256"])
        return User.objects.get(id=payload["user_id"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist, KeyError):
        return None


def _can_read_book(user, book):
    if user.role == "admin":
        return True
    return UserLibrary.objects.filter(user=user, book=book).exists()


class ReaderView(APIView):
    """
    Returns the PDF file_url for a book only if the requesting user
    has purchased it (or is an admin).  This is the only endpoint that
    ever exposes file_url to a client.
    """

    def get(self, request, book_id):
        user = _authenticate_reader_user(request)

        if not user:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            book = EBook.objects.get(id=book_id)
        except EBook.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        # Admins can always read; customers need a UserLibrary entry
        if not _can_read_book(user, book):
            return Response(
                {"error": "Access denied. Purchase this book to read it."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            {
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "file_url": build_signed_pdf_url(book.file_url),
                "page_count": get_pdf_page_count(book.file_url),
            }
        )


@method_decorator(xframe_options_exempt, name="dispatch")
class ReaderStreamView(APIView):
    """Proxy PDF bytes from storage with auth checks and range support for progressive rendering."""

    def get(self, request, book_id):
        user = _authenticate_reader_user(request)
        if not user:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            book = EBook.objects.get(id=book_id)
        except EBook.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        if not _can_read_book(user, book):
            return Response(
                {"error": "Access denied. Purchase this book to read it."},
                status=status.HTTP_403_FORBIDDEN,
            )

        source_url = build_signed_pdf_url(book.file_url)
        upstream_request = urlrequest.Request(source_url, method="GET")

        range_header = request.META.get("HTTP_RANGE")
        if range_header:
            upstream_request.add_header("Range", range_header)

        try:
            with urlrequest.urlopen(upstream_request, timeout=30) as upstream:
                content = upstream.read()
                content_type = upstream.headers.get("Content-Type", "application/pdf")
                content_range = upstream.headers.get("Content-Range")
                status_code = 206 if content_range else 200

                response = HttpResponse(content, status=status_code, content_type=content_type)
                response["Accept-Ranges"] = "bytes"
                # Allow short-lived private caching to speed page flips in the embedded viewer.
                response["Cache-Control"] = "private, max-age=600"
                response["X-Content-Type-Options"] = "nosniff"
                response["Content-Disposition"] = (
                    f'inline; filename="{slugify(book.title) or "book"}.pdf"'
                )
                if content_range:
                    response["Content-Range"] = content_range
                return response
        except error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="ignore")
            return Response(
                {"error": f"Unable to stream file: {body or exc.reason}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class ReaderPageImageView(APIView):
    """Render exactly one PDF page as an image for strict page-by-page reading."""

    def get(self, request, book_id):
        user = _authenticate_reader_user(request)
        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            book = EBook.objects.get(id=book_id)
        except EBook.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        if not _can_read_book(user, book):
            return Response(
                {"error": "Access denied. Purchase this book to read it."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            page_number = int(request.GET.get("page", "1"))
        except ValueError:
            return Response({"error": "Invalid page number"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            image_bytes = render_pdf_page_png(book.file_url, page_number)
            response = HttpResponse(image_bytes, content_type="image/png")
            response["Cache-Control"] = "private, max-age=300"
            response["X-Content-Type-Options"] = "nosniff"
            return response
        except RuntimeError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
