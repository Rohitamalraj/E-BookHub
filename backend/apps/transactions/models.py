from django.db import models
from apps.users.models import User
from apps.books.models import EBook


class Cart(models.Model):
    """Temporary holding area — cleared when a book is purchased."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cart_items")
    book = models.ForeignKey(EBook, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "book")

    def __str__(self):
        return f"{self.user.email} → {self.book.title}"


class Transaction(models.Model):
    """A completed purchase event."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, default="card")
    status = models.CharField(max_length=50, default="completed")
    transaction_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction #{self.id} — {self.user.email}"


class TransactionItem(models.Model):
    """One book line within a Transaction."""
    transaction = models.ForeignKey(
        Transaction, on_delete=models.CASCADE, related_name="items"
    )
    book = models.ForeignKey(EBook, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.transaction_id} — {self.book.title}"


class UserLibrary(models.Model):
    """Books the user has purchased and may read."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="library")
    book = models.ForeignKey(EBook, on_delete=models.CASCADE)
    purchased_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "book")

    def __str__(self):
        return f"{self.user.email} owns {self.book.title}"
