from django.contrib.auth import get_user_model
from patients.models import Patient

User = get_user_model()

print("="*80)
print("CLEANING UP USERS - KEEPING ONE PER ROLE")
print("="*80)

# Define the one user per role
SINGLE_USERS = {
    'admin': {
        'email': 'admin@dialysistrack.com',
        'password': 'admin@2026',
        'first_name': 'System',
        'last_name': 'Administrator',
        'role': 'admin',
        'department': 'Administration',
        'phone_number': '9876543210',
        'is_superuser': True,
        'is_staff': True
    },
    'doctor': {
        'email': 'doctor@dialysistrack.com',
        'password': 'doctor@2026',
        'first_name': 'Dr. Rajesh',
        'last_name': 'Kumar',
        'role': 'doctor',
        'department': 'Nephrology',
        'phone_number': '9876543211'
    },
    'nurse': {
        'email': 'nurse@dialysistrack.com',
        'password': 'nurse@2026',
        'first_name': 'Priya',
        'last_name': 'Sharma',
        'role': 'nurse',
        'department': 'Dialysis',
        'phone_number': '9876543212'
    },
    'technician': {
        'email': 'technician@dialysistrack.com',
        'password': 'tech@2026',
        'first_name': 'Amit',
        'last_name': 'Patel',
        'role': 'technician',
        'department': 'Dialysis',
        'phone_number': '9876543213'
    },
    'receptionist': {
        'email': 'receptionist@dialysistrack.com',
        'password': 'reception@2026',
        'first_name': 'Anita',
        'last_name': 'Verma',
        'role': 'receptionist',
        'department': 'Reception',
        'phone_number': '9876543214'
    },
    'patient': {
        'email': 'patient@dialysistrack.com',
        'password': 'patient@2026',
        'first_name': 'Ramesh',
        'last_name': 'Singh',
        'role': 'patient',
        'phone_number': '9876543215'
    }
}

# Delete all users
print("\nDeleting all existing users...")
deleted_count = User.objects.all().count()
User.objects.all().delete()
print(f"Deleted {deleted_count} users")

# Delete all patients
print("\nDeleting all existing patients...")
patient_count = Patient.objects.all().count()
Patient.objects.all().delete()
print(f"Deleted {patient_count} patients")

# Create fresh accounts
print("\nCreating fresh accounts...")

for role_name, user_data in SINGLE_USERS.items():
    if role_name == 'admin':
        user = User.objects.create_superuser(
            username=user_data['email'],
            email=user_data['email'],
            password=user_data['password'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            role=user_data['role'],
            department=user_data.get('department', ''),
            phone_number=user_data.get('phone_number', '')
        )
    else:
        user = User.objects.create_user(
            username=user_data['email'],
            email=user_data['email'],
            password=user_data['password'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            role=user_data['role'],
            department=user_data.get('department', ''),
            phone_number=user_data.get('phone_number', '')
        )
    
    user.is_active = True
    user.save()
    
    print(f"Created {role_name:15} | {user_data['email']:35} | {user_data['password']}")
    
    # Create patient profile
    if role_name == 'patient':
        patient = Patient.objects.create(
            patient_id='P000001',
            user=user,
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            date_of_birth='1980-01-15',
            gender='male',
            blood_type='O+',
            phone_number=user_data['phone_number'],
            email=user_data['email'],
            address='123 Main Street, Mumbai, Maharashtra, India',
            emergency_contact_name='Sunita Singh',
            emergency_contact_phone='9876543299',
            primary_diagnosis='Chronic Kidney Disease Stage 5',
            comorbidities='Hypertension, Diabetes Type 2',
            is_active=True
        )
        print(f"   Created patient profile: P000001")

print("\n" + "="*80)
print("COMPLETE! Created 6 users (one per role)")
print("="*80)
