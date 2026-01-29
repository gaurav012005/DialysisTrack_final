#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

def fix_admin_role():
    """Fix admin user role"""
    
    try:
        user = User.objects.get(email='admin@test.com')
        print(f"Found user: {user.email}")
        print(f"Current role: {user.role}")
        
        # Update role to admin
        user.role = 'admin'
        user.save()
        
        print(f"Updated role to: {user.role}")
        print("Admin role fixed successfully!")
        
    except User.DoesNotExist:
        print("Admin user not found")

if __name__ == '__main__':
    fix_admin_role()