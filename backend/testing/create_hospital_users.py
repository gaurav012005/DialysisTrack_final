#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from patients.models import Patient

User = get_user_model()

def create_hospital_users():
    """Create comprehensive hospital user accounts with proper roles"""
    
    # Admin Users
    admin_users = [
        {
            'email': 'admin@test.com',
            'username': 'admin',
            'password': 'admin123',
            'role': 'admin',
            'first_name': 'System',
            'last_name': 'Administrator',
            'is_staff': True,
            'is_superuser': True
        }
    ]
    
    # Medical Staff
    medical_staff = [
        {
            'email': 'doctor@test.com',
            'username': 'doctor1',
            'password': 'doctor123',
            'role': 'doctor',
            'first_name': 'Dr. John',
            'last_name': 'Smith',
            'department': 'Nephrology'
        },
        {
            'email': 'doctor2@test.com',
            'username': 'doctor2',
            'password': 'doctor123',
            'role': 'doctor',
            'first_name': 'Dr. Sarah',
            'last_name': 'Johnson',
            'department': 'Internal Medicine'
        },
        {
            'email': 'nurse@test.com',
            'username': 'nurse1',
            'password': 'nurse123',
            'role': 'nurse',
            'first_name': 'Mary',
            'last_name': 'Wilson',
            'department': 'Dialysis Unit'
        },
        {
            'email': 'nurse2@test.com',
            'username': 'nurse2',
            'password': 'nurse123',
            'role': 'nurse',
            'first_name': 'Jennifer',
            'last_name': 'Brown',
            'department': 'Dialysis Unit'
        }
    ]
    
    # Support Staff
    support_staff = [
        {
            'email': 'reception@test.com',
            'username': 'reception1',
            'password': 'reception123',
            'role': 'receptionist',
            'first_name': 'Lisa',
            'last_name': 'Davis',
            'department': 'Front Desk'
        },
        {
            'email': 'tech@test.com',
            'username': 'tech1',
            'password': 'tech123',
            'role': 'technician',
            'first_name': 'Mike',
            'last_name': 'Anderson',
            'department': 'Biomedical Engineering'
        }
    ]
    
    # Patient Users
    patient_users = [
        {
            'email': 'patient1@test.com',
            'username': 'patient1',
            'password': 'patient123',
            'role': 'patient',
            'first_name': 'Robert',
            'last_name': 'Miller',
            'patient_data': {
                'patient_id': 'P001',
                'phone_number': '555-0101',
                'address': '123 Main St, City, State',
                'blood_type': 'O+',
                'gender': 'male',
                'emergency_contact': 'Jane Miller - 555-0102'
            }
        },
        {
            'email': 'patient2@test.com',
            'username': 'patient2',
            'password': 'patient123',
            'role': 'patient',
            'first_name': 'Emily',
            'last_name': 'Garcia',
            'patient_data': {
                'patient_id': 'P002',
                'phone_number': '555-0201',
                'address': '456 Oak Ave, City, State',
                'blood_type': 'A+',
                'gender': 'female',
                'emergency_contact': 'Carlos Garcia - 555-0202'
            }
        },
        {
            'email': 'patient3@test.com',
            'username': 'patient3',
            'password': 'patient123',
            'role': 'patient',
            'first_name': 'David',
            'last_name': 'Thompson',
            'patient_data': {
                'patient_id': 'P003',
                'phone_number': '555-0301',
                'address': '789 Pine St, City, State',
                'blood_type': 'B+',
                'gender': 'male',
                'emergency_contact': 'Susan Thompson - 555-0302'
            }
        }
    ]
    
    all_users = admin_users + medical_staff + support_staff + patient_users
    
    print("Creating hospital user accounts...")
    
    for user_data in all_users:
        patient_data = user_data.pop('patient_data', None)
        
        # Check if user already exists
        if User.objects.filter(email=user_data['email']).exists():
            print(f"User {user_data['email']} already exists, updating...")
            user = User.objects.get(email=user_data['email'])
            for key, value in user_data.items():
                if key != 'password':
                    setattr(user, key, value)
            user.set_password(user_data['password'])
            user.is_active = True
            user.save()
        else:
            print(f"Creating user: {user_data['email']} ({user_data['role']})")
            user = User.objects.create_user(**user_data)
            user.is_active = True
            user.save()
        
        # Create patient record if this is a patient user
        if patient_data and user.role == 'patient':
            patient, created = Patient.objects.get_or_create(
                user=user,
                defaults={
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    **patient_data
                }
            )
            if created:
                print(f"Created patient record for {user.email}")
            else:
                print(f"Patient record already exists for {user.email}")
    
    print("\\n=== HOSPITAL USER ACCOUNTS CREATED ===")
    print("\\n🏥 ADMIN ACCESS:")
    print("Email: admin@test.com | Password: admin123")
    
    print("\\n👨‍⚕️ MEDICAL STAFF:")
    print("Doctor 1: doctor@test.com | Password: doctor123")
    print("Doctor 2: doctor2@test.com | Password: doctor123")
    print("Nurse 1: nurse@test.com | Password: nurse123")
    print("Nurse 2: nurse2@test.com | Password: nurse123")
    
    print("\\n👥 SUPPORT STAFF:")
    print("Receptionist: reception@test.com | Password: reception123")
    print("Technician: tech@test.com | Password: tech123")
    
    print("\\n🏥 PATIENT ACCOUNTS:")
    print("Patient 1: patient1@test.com | Password: patient123")
    print("Patient 2: patient2@test.com | Password: patient123")
    print("Patient 3: patient3@test.com | Password: patient123")
    
    print("\\n✅ All users created successfully!")
    print("\\n📋 ROLE PERMISSIONS:")
    print("• Admin: Full system access")
    print("• Doctor: Patients, appointments, queue, reports")
    print("• Nurse: Queue management, patient updates, machines")
    print("• Receptionist: Patient registration, appointments, billing")
    print("• Technician: Machine management, queue monitoring")
    print("• Patient: Own appointments, billing, reports only")

if __name__ == '__main__':
    create_hospital_users()