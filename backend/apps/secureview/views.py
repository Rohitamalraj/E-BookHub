from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.authentication import JWTAuthentication
from apps.books.models import EBook
from apps.transactions.models import UserLibrary


class ReaderView(APIView):
    """
    Returns the PDF file_url for a book only if the requesting user
    has purchased it (or is an admin).  This is the only endpoint that
    ever exposes file_url to a client.
    """

    def get(self, request, book_id):
        auth = JWTAuthentication()
        user, _ = auth.authenticate(request)

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
        if user.role != "admin":
            if not UserLibrary.objects.filter(user=user, book=book).exists():
                return Response(
                    {"error": "Access denied. Purchase this book to read it."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        return Response(
            {
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "file_url": book.file_url,
            }
        )
