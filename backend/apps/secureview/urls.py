from django.urls import path
from .views import ReaderPageImageView, ReaderStreamView, ReaderView

urlpatterns = [
    path("reader/<int:book_id>", ReaderView.as_view()),
    path("reader/<int:book_id>/stream", ReaderStreamView.as_view()),
    path("reader/<int:book_id>/page-image", ReaderPageImageView.as_view()),
]
