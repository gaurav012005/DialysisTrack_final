from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.DialysisMachineViewSet)
router.register(r'maintenance', views.MaintenanceLogViewSet, basename='maintenance')
router.register(r'cleaning', views.CleaningLogViewSet, basename='cleaning')

urlpatterns = [
    path('', include(router.urls)),
]