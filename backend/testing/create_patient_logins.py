"""
Create login accounts for existing patients
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from patients.models import Patient
from users.models import User

def create_patient_accounts():
    print("Creating login accounts for patients...")
    
    patients = Patient.objects.filter(user__isnull=True, email__isnull=False).exclude(email='')
    
    for patient in patients:
        username = patient.email.split('@')[0] + '_' + patient.patient_id
        default_password = 'patient123'
        
        try:
            # Check if user already exists
            if User.objects.filter(email=patient.email).exists():
                user = User.objects.get(email=patient.email)
                patient.user = user
                patient.save()
                print(f"✅ Linked existing user: {patient.email}")
            else:
                # Create new user
                user = User.objects.create_user(
                    username=username,
                    email=patient.email,
                    password=default_password,
                    first_name=patient.first_name,
                    last_name=patient.last_name,
                    role='patient'
                )
                patient.user = user
                patient.save()
                print(f"✅ Created account: {patient.email} / patient123")
        except Exception as e:
            print(f"❌ Error for {patient.email}: {str(e)}")
    
    print("\n" + "="*50)
    print("PATIENT LOGIN CREDENTIALS")
    print("="*50)
    
    patients_with_accounts = Patient.objects.filter(user__isnull=False)
    for patient in patients_with_accounts:
        print(f"Name: {patient.first_name} {patient.last_name}")
        print(f"Email: {patient.email}")
        print(f"Password: patient123")
        print(f"Patient ID: {patient.patient_id}")
        print("-" * 50)

if __name__ == '__main__':
    create_patient_accounts()
