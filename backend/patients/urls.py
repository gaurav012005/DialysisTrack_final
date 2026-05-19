from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .dashboard_views import PatientDashboardViewSet

# Separate routers to avoid empty-prefix conflict
patient_router = DefaultRouter()
patient_router.register(r'', views.PatientViewSet)

prescription_router = DefaultRouter()
prescription_router.register(r'', views.DialysisPrescriptionViewSet, basename='prescription')

lab_router = DefaultRouter()
lab_router.register(r'', views.LabResultViewSet, basename='lab-result')

dashboard_router = DefaultRouter()
dashboard_router.register(r'', PatientDashboardViewSet, basename='patient-dashboard')

urlpatterns = [
    # Specific routes FIRST (before the catch-all patient router)
    path('prescriptions/', include(prescription_router.urls)),
    path('lab-results/', include(lab_router.urls)),
    path('dashboard/', include(dashboard_router.urls)),
    # Catch-all patient routes LAST
    path('', include(patient_router.urls)),
]