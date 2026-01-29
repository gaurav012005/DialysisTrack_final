from django.contrib.auth import get_user_model
from patients.models import Patient

User = get_user_model()

# Check if test patient already exists
existing_user = User.objects.filter(email='testpatient@gmail.com').first()
if existing_user:
    print("Test patient already exists!")
    print(f"Email: testpatient@gmail.com")
    print(f"Password: patient123")
    if hasattr(existing_user, 'patient'):
        print(f"Patient ID: {existing_user.patient.patient_id}")
else:
    # Create user
    user = User.objects.create_user(
        username='testpatient@gmail.com',
        email='testpatient@gmail.com',
        password='patient123',
        first_name='Test',
        last_name='Patient',
        role='patient',
        phone_number='+919999999999'
    )
    
    # Create patient
    patient = Patient.objects.create(
        user=user,
        first_name='Test',
        last_name='Patient',
        patient_id='PAT999',
        email='testpatient@gmail.com',
        phone_number='+919999999999',
        blood_type='O+',
        gender='male',
        address='123 Test Street',
        city='Mumbai',
        state='Maharashtra',
        is_active=True
    )
    
    print("Test patient created successfully!")
    print(f"\nLogin Credentials:")
    print(f"Email: testpatient@gmail.com")
    print(f"Password: patient123")
    print(f"Patient ID: {patient.patient_id}")

print(f"\nNow go to: http://localhost:3000/login")
print(f"After login, visit: http://localhost:3000/patient-portal")
