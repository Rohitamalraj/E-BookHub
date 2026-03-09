from django.urls import path
from .views import CartView, CartAddView, CartRemoveView, CheckoutView

urlpatterns = [
    path("cart", CartView.as_view()),
    path("cart/add", CartAddView.as_view()),
    path("cart/remove", CartRemoveView.as_view()),
    path("checkout", CheckoutView.as_view()),
]
