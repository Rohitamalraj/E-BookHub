from django.urls import path
from .views import ReaderView

urlpatterns = [
    path("reader/<int:book_id>", ReaderView.as_view()),
]
