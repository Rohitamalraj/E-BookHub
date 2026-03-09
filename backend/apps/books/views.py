import uuid

from django.core.files.storage import default_storage
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.authentication import JWTAuthentication
from .models import EBook
from .serializers import EBookSerializer, EBookPublicSerializer


def _save_upload(file, subfolder: str) -> str:
    """Save an uploaded file to MEDIA_ROOT/<subfolder>/ and return its media URL."""
    ext = file.name.rsplit(".", 1)[-1] if "." in file.name else "bin"
    filename = f"{subfolder}/{uuid.uuid4().hex}.{ext}"
    path = default_storage.save(filename, file)
    # Build an absolute-ish URL that Django's dev server can serve
    from django.conf import settings
    return f"{settings.MEDIA_URL}{path}"


def _require_admin(request):
    """Return (user, error_response).  error_response is None when auth passes."""
    auth = JWTAuthentication()
    user, _ = auth.authenticate(request)
    if not user or user.role != "admin":
        return None, Response(
            {"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN
        )
    return user, None


class BookListView(APIView):

    def get(self, request):
        books = EBook.objects.all()
        genre = request.query_params.get("genre", "")
        search = request.query_params.get("search", "")

        if genre and genre.lower() != "all":
            books = books.filter(genre__iexact=genre)
        if search:
            books = books.filter(
                Q(title__icontains=search) | Q(author__icontains=search)
            )

        serializer = EBookPublicSerializer(books, many=True)
        return Response(serializer.data)

    def post(self, request):
        _, err = _require_admin(request)
        if err:
            return err

        data = {
            "title": request.data.get("title", ""),
            "author": request.data.get("author", ""),
            "isbn": request.data.get("isbn", ""),
            "genre": request.data.get("genre", ""),
            "price": request.data.get("price", 0),
            "description": request.data.get("description", ""),
            "cover_image": request.data.get("cover_image", ""),
            "file_url": request.data.get("file_url", ""),
        }

        cover_file = request.FILES.get("cover_image")
        pdf_file = request.FILES.get("pdf_file")

        if cover_file:
            data["cover_image"] = _save_upload(cover_file, "covers")
        if pdf_file:
            data["file_url"] = _save_upload(pdf_file, "pdfs")

        serializer = EBookSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookDetailView(APIView):

    def _get_book(self, pk):
        try:
            return EBook.objects.get(pk=pk)
        except EBook.DoesNotExist:
            return None

    def get(self, request, pk):
        book = self._get_book(pk)
        if not book:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        # Admins see file_url; everyone else sees the public fields only
        auth = JWTAuthentication()
        user, _ = auth.authenticate(request)
        if user and user.role == "admin":
            return Response(EBookSerializer(book).data)
        return Response(EBookPublicSerializer(book).data)

    def put(self, request, pk):
        _, err = _require_admin(request)
        if err:
            return err

        book = self._get_book(pk)
        if not book:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        data = {
            "title": request.data.get("title", book.title),
            "author": request.data.get("author", book.author),
            "isbn": request.data.get("isbn", book.isbn),
            "genre": request.data.get("genre", book.genre),
            "price": request.data.get("price", book.price),
            "description": request.data.get("description", book.description),
            "cover_image": request.data.get("cover_image", book.cover_image),
            "file_url": request.data.get("file_url", book.file_url),
        }

        cover_file = request.FILES.get("cover_image")
        pdf_file = request.FILES.get("pdf_file")

        if cover_file:
            data["cover_image"] = _save_upload(cover_file, "covers")
        if pdf_file:
            data["file_url"] = _save_upload(pdf_file, "pdfs")

        serializer = EBookSerializer(book, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        _, err = _require_admin(request)
        if err:
            return err

        book = self._get_book(pk)
        if not book:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        book.delete()
        return Response({"message": "Book deleted"}, status=status.HTTP_204_NO_CONTENT)
