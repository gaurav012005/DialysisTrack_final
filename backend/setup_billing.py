import os
import django
from datetime import datetime, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from billing.models import Bill, Payment
from patients.models import Patient
from users.models import User

# Clear existing data
Bill.objects.all().delete()
Payment.objects.all().delete()
print("Cleared existing billing data")

# Get existing patients or create if none exist
patients = list(Patient.objects.all()[:3])
if not patients:
    print("No patients found - billing page will show empty state")
else:
    # Create bills for existing patients
    for i, patient in enumerate(patients):
        bill = Bill.objects.create(
            patient=patient,
            dialysis_sessions=2 + i,
            session_cost=Decimal('2500.00'),
            medicine_cost=Decimal('300.00'),
            consultation_cost=Decimal('500.00'),
            other_charges=Decimal('100.00'),
            discount=Decimal('200.00'),
            due_date=datetime.now().date() + timedelta(days=7 + i),
            status='pending' if i < 2 else 'overdue'
        )
        print(f"Created bill {bill.bill_number} for patient {patient.patient_id}")

print(f"Total bills created: {Bill.objects.count()}")
print("Billing data ready!")