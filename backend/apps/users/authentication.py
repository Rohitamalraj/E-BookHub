import jwt
from django.conf import settings
from apps.users.models import User


class JWTAuthentication:
    """
    Lightweight JWT authenticator used manually in each view.
    Returns (user, token) or (None, None) if the token is missing/invalid.
    """

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return None, None

        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user = User.objects.get(id=payload["user_id"])
            return user, token
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
            return None, None
