from django.contrib import admin
from .models import EBook


@admin.register(EBook)
class EBookAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "genre", "price", "created_at"]
    list_filter = ["genre"]
    search_fields = ["title", "author", "isbn"]
