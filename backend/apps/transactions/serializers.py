from rest_framework import serializers
from apps.books.serializers import EBookPublicSerializer
from .models import Cart, Transaction, TransactionItem


class CartSerializer(serializers.ModelSerializer):
    book = EBookPublicSerializer(read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "book", "added_at"]


class TransactionItemSerializer(serializers.ModelSerializer):
    book = EBookPublicSerializer(read_only=True)

    class Meta:
        model = TransactionItem
        fields = ["id", "book"]


class TransactionSerializer(serializers.ModelSerializer):
    items = TransactionItemSerializer(many=True, read_only=True)

    class Meta:
        model = Transaction
        fields = ["id", "total_amount", "payment_method", "status",
                  "transaction_date", "items"]
