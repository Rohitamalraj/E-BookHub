from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, default="customer")

    def __str__(self):
        return self.email or self.username
