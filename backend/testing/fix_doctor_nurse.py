"""
Fix doctor and nurse accounts
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("Fixing doctor and nurse accounts...")

# Fix or create doctor
try:
    doctor = User.objects.filter(email='doctor@test.com').first()
    if doctor:
        doctor.set_password('doctor123')
        doctor.is_active = True
        doctor.save()
        print(f"✅ Fixed doctor account: doctor@test.com / doctor123")
    else:
        doctor = User.objects.create_user(
            username='doctor@test.com',
            email='doctor@test.com',
            password='doctor123',
            first_name='Dr. John',
            last_name='Smith',
            role='doctor',
            department='Nephrology',
            phone_number='1234567890'
        )
        print(f"✅ Created doctor account: doctor@test.com / doctor123")
except Exception as e:
    print(f"❌ Error with doctor: {e}")

# Fix or create nurse  
try:
    nurse = User.objects.filter(email='nurse@test.com').first()
    if nurse:
        nurse.set_password('nurse123')
        nurse.is_active = True
        nurse.save()
        print(f"✅ Fixed nurse account: nurse@test.com / nurse123")
    else:
        nurse = User.objects.create_user(
            username='nurse@test.com',
            email='nurse@test.com',
            password='nurse123',
            first_name='Mary',
            last_name='Williams',
            role='nurse',
            department='Dialysis',
            phone_number='1234567891'
        )
        print(f"✅ Created nurse account: nurse@test.com / nurse123")
except Exception as e:
    print(f"❌ Error with nurse: {e}")

print("\nDone!")
