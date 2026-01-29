#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from billing.models import Bill, Payment, InsuranceProvider, PatientInsurance
from patients.models import Patient
from users.models import User

def create_complete_billing_data():
    print("Creating complete billing data with patients...")
    
    # Get or create admin user
    admin_user, created = User.objects.get_or_create(
        email='admin@test.com',
        defaults={
            'username': 'admin',
            'is_superuser': True,
            'is_staff': True,
            'is_active': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"Created admin user: {admin_user.email}")
    
    # Create sample patients
    patients_data = [
        {
            'patient_id': 'P001',
            'first_name': 'Rajesh',
            'last_name': 'Kumar',
            'date_of_birth': datetime(1975, 5, 15).date(),
            'gender': 'male',
            'blood_type': 'B+',
            'phone_number': '9876543210',
            'email': 'rajesh.kumar@email.com',
            'address': '123 MG Road, Mumbai, Maharashtra',
            'emergency_contact_name': 'Sunita Kumar',
            'emergency_contact_phone': '9876543211',
            'primary_diagnosis': 'Chronic Kidney Disease Stage 5',
            'dialysis_type': 'Hemodialysis',
            'vascular_access': 'AV Fistula',
            'dry_weight': Decimal('65.5'),
        },
        {
            'patient_id': 'P002',
            'first_name': 'Priya',
            'last_name': 'Sharma',
            'date_of_birth': datetime(1982, 8, 22).date(),
            'gender': 'female',
            'blood_type': 'A+',
            'phone_number': '9876543212',
            'email': 'priya.sharma@email.com',
            'address': '456 Park Street, Delhi',
            'emergency_contact_name': 'Amit Sharma',
            'emergency_contact_phone': '9876543213',
            'primary_diagnosis': 'End Stage Renal Disease',
            'dialysis_type': 'Hemodialysis',
            'vascular_access': 'Central Venous Catheter',
            'dry_weight': Decimal('58.0'),
        },
        {
            'patient_id': 'P003',
            'first_name': 'Mohammed',
            'last_name': 'Ali',
            'date_of_birth': datetime(1968, 12, 10).date(),
            'gender': 'male',
            'blood_type': 'O+',
            'phone_number': '9876543214',
            'email': 'mohammed.ali@email.com',
            'address': '789 Brigade Road, Bangalore',
            'emergency_contact_name': 'Fatima Ali',
            'emergency_contact_phone': '9876543215',
            'primary_diagnosis': 'Diabetic Nephropathy',
            'dialysis_type': 'Hemodialysis',
            'vascular_access': 'AV Graft',
            'dry_weight': Decimal('72.3'),
        }
    ]
    
    created_patients = []
    for patient_data in patients_data:
        patient, created = Patient.objects.get_or_create(
            patient_id=patient_data['patient_id'],
            defaults=patient_data
        )
        created_patients.append(patient)
        if created:
            print(f"Created patient: {patient.first_name} {patient.last_name}")
    
    # Create Insurance Providers
    insurance_providers_data = [
        {
            'name': 'Star Health Insurance',
            'policy_prefix': 'SHI',
            'contact_number': '1800-425-2255',
            'email': 'support@starhealth.in',
            'coverage_percentage': Decimal('80.00')
        },
        {
            'name': 'HDFC ERGO Health Insurance',
            'policy_prefix': 'HEH',
            'contact_number': '1800-266-9966',
            'email': 'support@hdfcergo.com',
            'coverage_percentage': Decimal('75.00')
        }
    ]
    
    for provider_data in insurance_providers_data:
        provider, created = InsuranceProvider.objects.get_or_create(
            name=provider_data['name'],
            defaults=provider_data
        )
        if created:
            print(f"Created insurance provider: {provider.name}")
    
    # Create Bills
    bills_data = [
        {
            'patient': created_patients[0],
            'dialysis_sessions': 3,
            'session_cost': Decimal('2500.00'),
            'medicine_cost': Decimal('500.00'),
            'consultation_cost': Decimal('800.00'),
            'other_charges': Decimal('200.00'),
            'discount': Decimal('300.00'),
            'due_date': datetime.now().date() + timedelta(days=7),
            'status': 'pending'
        },
        {
            'patient': created_patients[1],
            'dialysis_sessions': 2,
            'session_cost': Decimal('2500.00'),
            'medicine_cost': Decimal('300.00'),
            'consultation_cost': Decimal('500.00'),
            'other_charges': Decimal('100.00'),
            'discount': Decimal('0.00'),
            'due_date': datetime.now().date() + timedelta(days=3),
            'status': 'pending'
        },
        {
            'patient': created_patients[2],
            'dialysis_sessions': 1,
            'session_cost': Decimal('2500.00'),
            'medicine_cost': Decimal('200.00'),
            'consultation_cost': Decimal('500.00'),
            'other_charges': Decimal('50.00'),
            'discount': Decimal('100.00'),
            'due_date': datetime.now().date() - timedelta(days=2),
            'status': 'overdue'
        }
    ]
    
    created_bills = []
    for bill_data in bills_data:
        bill = Bill.objects.create(**bill_data)
        created_bills.append(bill)
        print(f"Created bill: {bill.bill_number} for {bill.patient.first_name} {bill.patient.last_name}")
    
    # Create sample payment
    if created_bills:
        payment = Payment.objects.create(
            bill=created_bills[0],
            amount=Decimal('1000.00'),
            payment_method='upi',
            status='completed',
            upi_id='patient@paytm',
            transaction_id='UPI202501011234567890',
            processing_fee=Decimal('0.00'),
            processed_by=admin_user,
            gateway_response={
                'status': 'SUCCESS',
                'message': 'Payment completed successfully',
                'provider': 'paytm',
                'timestamp': datetime.now().isoformat()
            }
        )
        print(f"Created sample payment: {payment.payment_id}")
    
    print("\n✅ Complete billing data created successfully!")
    print(f"- Patients: {Patient.objects.count()}")
    print(f"- Bills: {Bill.objects.count()}")
    print(f"- Payments: {Payment.objects.count()}")
    print(f"- Insurance Providers: {InsuranceProvider.objects.count()}")

if __name__ == '__main__':
    create_complete_billing_data()