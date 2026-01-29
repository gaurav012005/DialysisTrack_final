from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .dashboard_views import PatientDashboardViewSet

router = DefaultRouter()
router.register(r'', views.PatientViewSet)
router.register(r'dashboard', PatientDashboardViewSet, basename='patient-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]