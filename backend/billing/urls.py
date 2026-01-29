from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet, PaymentViewSet, InsuranceProviderViewSet, PatientInsuranceViewSet
from .simple_payment import simple_cash_payment

router = DefaultRouter()
router.register(r'bills', BillViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'insurance-providers', InsuranceProviderViewSet)
router.register(r'patient-insurance', PatientInsuranceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('simple-cash-payment/', simple_cash_payment, name='simple-cash-payment'),
]