"""
Update User Role - Change role for akshata@gmail.com

This script will update the user's role to a staff position.

Run this script from the backend directory:
    python update_user_role.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

def update_user_role():
    email = 'akshata@gmail.com'
    
    # Available roles
    print("Available roles:")
    print("1. admin")
    print("2. doctor")
    print("3. nurse")
    print("4. technician")
    print("5. receptionist")
    print("6. patient (current)")
    
    try:
        user = User.objects.get(email=email)
        
        print(f"\nCurrent user details:")
        print(f"  Username: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Current Role: {user.role}")
        print(f"  Is Active: {user.is_active}")
        
        # Update to nurse role (change this as needed)
        new_role = 'nurse'  # Change this to: admin, doctor, nurse, technician, receptionist, or patient
        
        user.role = new_role
        user.save()
        
        print(f"\n✅ User role updated successfully!")
        print(f"  New Role: {user.role}")
        
        # Check if staff
        staff_roles = ['admin', 'doctor', 'nurse', 'receptionist', 'technician']
        if user.role in staff_roles:
            print(f"\n⚠️  IMPORTANT: This is a staff role.")
            print(f"   2FA setup will be MANDATORY on first login.")
            print(f"   The user will be redirected to /2fa-setup after login.")
        else:
            print(f"\n✅ This is a patient role - 2FA is optional.")
            
    except User.DoesNotExist:
        print(f"❌ User with email {email} not found!")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    update_user_role()
