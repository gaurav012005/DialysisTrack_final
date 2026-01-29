from django.contrib.auth import get_user_model

User = get_user_model()

# Get the existing patient user
patient_user = User.objects.filter(role='patient').first()

if patient_user:
    # Set a NEW password that you know
    patient_user.set_password('patient123')
    patient_user.save()
    
    print("✅ Password reset successfully!")
    print(f"\nLogin Credentials:")
    print(f"Email/Username: {patient_user.email}")
    print(f"Password: patient123")
    print(f"\nGo to: http://localhost:3000/login")
    print(f"Then: http://localhost:3000/patient-portal")
else:
    print("❌ No patient user found!")
    print("Creating new patient user...")
    
    from patients.models import Patient
    
    # Create new user
    user = User.objects.create_user(
        username='testpatient@gmail.com',
        email='testpatient@gmail.com',
        password='patient123',
        first_name='Test',
        last_name='Patient',
        role='patient',
        phone_number='+919999999999'
    )
    
    # Create patient profile
    patient = Patient.objects.create(
        user=user,
        first_name='Test',
        last_name='Patient',
        patient_id='TESTPAT',
        email='testpatient@gmail.com',
        phone_number='+919999999999',
        blood_type='O+',
        gender='male',
        is_active=True
    )
    
    print("✅ New patient created!")
    print(f"Email: testpatient@gmail.com")
    print(f"Password: patient123")
