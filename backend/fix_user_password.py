"""
Fix User Password - Set proper hashed password for akshata@gmail.com

This script will:
1. Find the user with email akshata@gmail.com
2. Set the password properly (hashed)
3. Verify the user can login

Run this script from the backend directory:
    python fix_user_password.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

def fix_user_password():
    email = 'akshata@gmail.com'
    password = 'staff123'
    
    try:
        # Find the user
        user = User.objects.get(email=email)
        
        print(f"Found user: {user.username} ({user.email})")
        print(f"Current role: {user.role}")
        print(f"Is active: {user.is_active}")
        
        # Set the password properly (this will hash it)
        user.set_password(password)
        user.save()
        
        print(f"\n✅ Password updated successfully for {email}")
        print(f"You can now login with:")
        print(f"  Email: {email}")
        print(f"  Password: {password}")
        
        # Verify the password works
        if user.check_password(password):
            print(f"\n✅ Password verification successful!")
        else:
            print(f"\n❌ Password verification failed!")
            
    except User.DoesNotExist:
        print(f"❌ User with email {email} not found!")
        print(f"\nCreating new user instead...")
        
        # Create the user properly
        user = User.objects.create_user(
            username=email.split('@')[0],  # Use 'akshata' as username
            email=email,
            password=password,
            role='nurse',  # Change this to the desired role
            first_name='Akshata',
            last_name='',
            is_active=True
        )
        
        print(f"\n✅ User created successfully!")
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Role: {user.role}")
        print(f"Password: {password}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    fix_user_password()
