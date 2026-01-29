from django.contrib import admin
from .models import Bill, Payment, InsuranceProvider, PatientInsurance

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ['bill_number', 'patient', 'total_amount', 'paid_amount', 'status', 'due_date']
    list_filter = ['status', 'created_at', 'due_date']
    search_fields = ['bill_number', 'patient__name', 'patient__phone']
    readonly_fields = ['bill_number', 'subtotal', 'tax_amount', 'total_amount']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['payment_id', 'bill', 'amount', 'payment_method', 'status', 'payment_date']
    list_filter = ['payment_method', 'status', 'payment_date']
    search_fields = ['payment_id', 'transaction_id', 'bill__bill_number']
    readonly_fields = ['payment_id']

@admin.register(InsuranceProvider)
class InsuranceProviderAdmin(admin.ModelAdmin):
    list_display = ['name', 'policy_prefix', 'coverage_percentage', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']

@admin.register(PatientInsurance)
class PatientInsuranceAdmin(admin.ModelAdmin):
    list_display = ['patient', 'provider', 'policy_number', 'coverage_amount', 'expiry_date', 'is_active']
    list_filter = ['provider', 'is_active', 'expiry_date']
    search_fields = ['patient__name', 'policy_number']