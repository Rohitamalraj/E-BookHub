from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    # All REST endpoints are under /api/
    path("api/", include("apps.users.urls")),
    path("api/", include("apps.books.urls")),
    path("api/", include("apps.transactions.urls")),
    path("api/", include("apps.secureview.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
