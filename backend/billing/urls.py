from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet, PaymentViewSet, InsuranceProviderViewSet, PatientInsuranceViewSet
from .simple_payment import simple_cash_payment
from .razorpay_views import razorpay_create_order_view, razorpay_verify_payment_view, razorpay_config_view

router = DefaultRouter()
router.register(r'bills', BillViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'insurance-providers', InsuranceProviderViewSet)
router.register(r'patient-insurance', PatientInsuranceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('simple-cash-payment/', simple_cash_payment, name='simple-cash-payment'),
    # ── Razorpay Payment Gateway ──────────────────────────────────────────
    path('razorpay/create-order/', razorpay_create_order_view, name='razorpay-create-order'),
    path('razorpay/verify/', razorpay_verify_payment_view, name='razorpay-verify'),
    path('razorpay/config/', razorpay_config_view, name='razorpay-config'),
]