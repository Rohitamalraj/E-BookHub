from django.db import models


class EBook(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=50, blank=True)
    genre = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    cover_image = models.TextField(blank=True)   # URL or relative /media/ path
    file_url = models.TextField(blank=True)       # PDF URL — never exposed publicly
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} — {self.author}"
