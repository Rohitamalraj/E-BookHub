import jwt
from datetime import datetime, timedelta, timezone

from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import User
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email", "")
        password = request.data.get("password", "")

        # Look up by email (email is unique on the User model)
        user_obj = User.objects.filter(email=email).first()
        user = None
        if user_obj:
            user = authenticate(request, username=user_obj.username, password=password)

        if not user:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        payload = {
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "exp": datetime.now(tz=timezone.utc) + timedelta(days=7),
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
        return Response({"token": token, "user": UserSerializer(user).data})
