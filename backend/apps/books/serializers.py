from rest_framework import serializers
from .models import EBook


class EBookPublicSerializer(serializers.ModelSerializer):
    """
    Safe for unauthenticated users — omits file_url so the PDF
    location is never leaked before purchase.
    """

    class Meta:
        model = EBook
        fields = ["id", "title", "author", "isbn", "genre", "price",
                  "description", "cover_image", "created_at"]


class EBookSerializer(serializers.ModelSerializer):
    """
    Full serializer — includes file_url.
    Used only by admin endpoints and the secureview app.
    """

    class Meta:
        model = EBook
        fields = "__all__"
