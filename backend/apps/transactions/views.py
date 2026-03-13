from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.users.authentication import JWTAuthentication
from apps.books.models import EBook
from .models import Cart, Transaction, TransactionItem, UserLibrary
from .serializers import CartSerializer, UserLibrarySerializer


def _require_auth(request):
    """Return (user, error_response).  error_response is None on success."""
    auth = JWTAuthentication()
    user, _ = auth.authenticate(request)
    if not user:
        return None, Response(
            {"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED
        )
    return user, None


class CartView(APIView):

    def get(self, request):
        user, err = _require_auth(request)
        if err:
            return err
        items = Cart.objects.filter(user=user).select_related("book")
        return Response(CartSerializer(items, many=True).data)


class LibraryView(APIView):

    def get(self, request):
        user, err = _require_auth(request)
        if err:
            return err
        owned = UserLibrary.objects.filter(user=user).select_related("book").order_by("-purchased_at")
        return Response(UserLibrarySerializer(owned, many=True).data)


class CartAddView(APIView):

    def post(self, request):
        user, err = _require_auth(request)
        if err:
            return err

        book_id = request.data.get("book_id")
        if not book_id:
            return Response({"error": "book_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            book = EBook.objects.get(id=book_id)
        except EBook.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        # Prevent adding an already-purchased book
        if UserLibrary.objects.filter(user=user, book=book).exists():
            return Response({"error": "You already own this book"}, status=status.HTTP_400_BAD_REQUEST)

        _, created = Cart.objects.get_or_create(user=user, book=book)
        if not created:
            return Response({"message": "Book is already in your cart"})
        return Response({"message": "Added to cart"}, status=status.HTTP_201_CREATED)


class CartRemoveView(APIView):

    def post(self, request):
        user, err = _require_auth(request)
        if err:
            return err

        book_id = request.data.get("book_id")
        if not book_id:
            return Response({"error": "book_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        Cart.objects.filter(user=user, book_id=book_id).delete()
        return Response({"message": "Removed from cart"})


class CheckoutView(APIView):

    def post(self, request):
        user, err = _require_auth(request)
        if err:
            return err

        book_ids = request.data.get("book_ids", [])
        payment_method = request.data.get("payment_method", "card")

        if not book_ids:
            return Response({"error": "No books provided for checkout"}, status=status.HTTP_400_BAD_REQUEST)

        # Checkout is restricted to books currently in the user's cart.
        cart_items = list(
            Cart.objects.filter(user=user, book_id__in=book_ids).select_related("book")
        )
        if not cart_items:
            return Response(
                {"error": "No valid cart items found for checkout"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_books = [item.book for item in cart_items]
        owned_ids = set(
            UserLibrary.objects.filter(user=user, book__in=cart_books).values_list("book_id", flat=True)
        )
        books_to_purchase = [book for book in cart_books if book.id not in owned_ids]

        if not books_to_purchase:
            Cart.objects.filter(user=user, book_id__in=[book.id for book in cart_books]).delete()
            return Response(
                {"error": "All selected books are already in your library"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total = sum(book.price for book in books_to_purchase)

        transaction = Transaction.objects.create(
            user=user,
            total_amount=total,
            payment_method=payment_method,
            status="completed",
        )

        for book in books_to_purchase:
            TransactionItem.objects.create(transaction=transaction, book=book)
            UserLibrary.objects.get_or_create(user=user, book=book)

        # Clear purchased books from cart
        Cart.objects.filter(user=user, book__in=books_to_purchase).delete()

        purchased_book_ids = [book.id for book in books_to_purchase]

        return Response(
            {
                "message": "Checkout successful",
                "transaction_id": transaction.id,
                "purchased_book_ids": purchased_book_ids,
            },
            status=status.HTTP_201_CREATED,
        )
