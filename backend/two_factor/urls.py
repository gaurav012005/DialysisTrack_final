from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TwoFactorViewSet

router = DefaultRouter()
router.register(r'', TwoFactorViewSet, basename='two-factor')

urlpatterns = [
    path('', include(router.urls)),
]
