from django.db import models
from django.contrib.auth import get_user_model
from patients.models import Patient
from appointments.models import Appointment
import uuid
from datetime import datetime
from decimal import Decimal

User = get_user_model()

class Bill(models.Model):
    BILL_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('partial', 'Partially Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]
    
    bill_number = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='bills')
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, null=True, blank=True)
    
    # Bill Details
    dialysis_sessions = models.IntegerField(default=1)
    session_cost = models.DecimalField(max_digits=10, decimal_places=2, default=2500.00)
    medicine_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    consultation_cost = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    other_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Calculations
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    status = models.CharField(max_length=20, choices=BILL_STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Bill {self.bill_number} - {self.patient.first_name} {self.patient.last_name}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate totals
        self.subtotal = (self.dialysis_sessions * self.session_cost) + self.medicine_cost + self.consultation_cost + self.other_charges
        self.tax_amount = self.subtotal * Decimal('0.18')  # 18% GST
        self.total_amount = self.subtotal + self.tax_amount - self.discount
        
        # Generate bill number if not exists
        if not self.bill_number:
            import random
            random_num = random.randint(100, 999)
            self.bill_number = f"DT{datetime.now().strftime('%Y%m%d')}{random_num}"
        
        super().save(*args, **kwargs)

class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('upi', 'UPI/Scanner (PhonePe/GPay/Paytm)'),
        ('razorpay', 'Online Payment (Razorpay)'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='payments')
    payment_id = models.CharField(max_length=50, unique=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Payment Details
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    
    # UPI Details
    upi_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Card Details
    card_last_four = models.CharField(max_length=4, blank=True, null=True)
    
    # Razorpay Details
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    
    # Processing Details
    processing_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    gateway_response = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    payment_date = models.DateTimeField(auto_now_add=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"Payment {self.payment_id} - ₹{self.amount}"
    
    def save(self, *args, **kwargs):
        # Generate payment ID if not exists
        if not self.payment_id:
            self.payment_id = f"PAY{datetime.now().strftime('%Y%m%d%H%M%S')}{str(uuid.uuid4())[:4].upper()}"
        
        super().save(*args, **kwargs)

class InsuranceProvider(models.Model):
    name = models.CharField(max_length=100)
    policy_prefix = models.CharField(max_length=10)
    contact_number = models.CharField(max_length=15)
    email = models.EmailField()
    coverage_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=80.00)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class PatientInsurance(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='insurance')
    provider = models.ForeignKey(InsuranceProvider, on_delete=models.CASCADE)
    policy_number = models.CharField(max_length=50)
    coverage_amount = models.DecimalField(max_digits=10, decimal_places=2)
    expiry_date = models.DateField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.patient.first_name} {self.patient.last_name} - {self.provider.name}"