"""
Script to create test users for all roles
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from patients.models import Patient

User = get_user_model()

# Create test users for each role
test_users = [
    {
        'username': 'doctor@test.com',
        'email': 'doctor@test.com',
        'password': 'doctor123',
        'first_name': 'Dr. John',
        'last_name': 'Smith',
        'role': 'doctor',
        'department': 'Nephrology',
        'phone_number': '1234567890'
    },
    {
        'username': 'nurse@test.com',
        'email': 'nurse@test.com',
        'password': 'nurse123',
        'first_name': 'Mary',
        'last_name': 'Williams',
        'role': 'nurse',
        'department': 'Dialysis',
        'phone_number': '1234567891'
    },
    {
        'username': 'technician@test.com',
        'email': 'technician@test.com',
        'password': 'tech123',
        'first_name': 'Mike',
        'last_name': 'Johnson',
        'role': 'technician',
        'department': 'Dialysis',
        'phone_number': '1234567892'
    },
    {
        'username': 'receptionist@test.com',
        'email': 'receptionist@test.com',
        'password': 'reception123',
        'first_name': 'Sarah',
        'last_name': 'Davis',
        'role': 'receptionist',
        'department': 'Reception',
        'phone_number': '1234567893'
    }
]

print("Creating test users...")
for user_data in test_users:
    try:
        # Check if user already exists
        if User.objects.filter(email=user_data['email']).exists():
            print(f"✓ User {user_data['email']} already exists")
            continue
        
        # Create user
        user = User.objects.create_user(**user_data)
        user.is_active = True
        user.save()
        print(f"✓ Created {user_data['role']}: {user_data['email']} / {user_data['password']}")
    except Exception as e:
        print(f"✗ Error creating {user_data['email']}: {e}")

# Create a test patient with login credentials
try:
    patient_user_data = {
        'username': 'patient@test.com',
        'email': 'patient@test.com',
        'password': 'patient123',
        'first_name': 'James',
        'last_name': 'Anderson',
        'role': 'patient',
        'phone_number': '1234567894'
    }
    
    if not User.objects.filter(email=patient_user_data['email']).exists():
        patient_user = User.objects.create_user(**patient_user_data)
        patient_user.is_active = True
        patient_user.save()
        
        # Create patient profile
        if not Patient.objects.filter(email=patient_user_data['email']).exists():
            patient = Patient.objects.create(
                patient_id='P000001',
                user=patient_user,
                first_name=patient_user_data['first_name'],
                last_name=patient_user_data['last_name'],
                date_of_birth='1985-05-15',
                gender='male',
                blood_type='O+',
                phone_number=patient_user_data['phone_number'],
                email=patient_user_data['email'],
                address='123 Test Street, Test City',
                emergency_contact_name='Emergency Contact',
                emergency_contact_phone='9876543210',
                primary_diagnosis='Chronic Kidney Disease',
                is_active=True
            )
            print(f"✓ Created patient: {patient_user_data['email']} / {patient_user_data['password']}")
        else:
            print(f"✓ Patient profile already exists for {patient_user_data['email']}")
    else:
        print(f"✓ Patient user already exists: {patient_user_data['email']}")
        
except Exception as e:
    print(f"✗ Error creating patient: {e}")

print("\n" + "="*60)
print("TEST CREDENTIALS:")
print("="*60)
print("Admin:        admin@test.com / admin123")
print("Doctor:       doctor@test.com / doctor123")
print("Nurse:        nurse@test.com / nurse123")
print("Technician:   technician@test.com / tech123")
print("Receptionist: receptionist@test.com / reception123")
print("Patient:      patient@test.com / patient123")
print("="*60)
