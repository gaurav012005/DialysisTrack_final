#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

def fix_user_active_status():
    """Fix user active status"""
    
    try:
        # Get admin user
        user = User.objects.get(email='admin@test.com')
        print(f"Found user: {user.email}")
        print(f"Current is_active status: {user.is_active}")
        
        # Activate the user
        user.is_active = True
        user.save()
        
        print(f"Updated is_active status: {user.is_active}")
        print("User activated successfully!")
        
        # Also check other users
        inactive_users = User.objects.filter(is_active=False)
        if inactive_users.exists():
            print(f"\nFound {inactive_users.count()} inactive users:")
            for u in inactive_users:
                print(f"  - {u.email} (is_active: {u.is_active})")
                u.is_active = True
                u.save()
                print(f"    Activated {u.email}")
        
    except User.DoesNotExist:
        print("Admin user not found")

if __name__ == '__main__':
    fix_user_active_status()