#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

def create_admin_user():
    """Create admin user for testing"""
    
    # Check if admin user exists
    if User.objects.filter(email='admin@test.com').exists():
        print("[OK] Admin user already exists")
        user = User.objects.get(email='admin@test.com')
        print(f"Admin user: {user.email}")
        return
    
    # Create admin user
    try:
        admin_user = User.objects.create_user(
            email='admin@test.com',
            username='admin',
            password='admin123',
            first_name='Admin',
            last_name='User',
            role='admin',
            is_staff=True,
            is_superuser=True
        )
        print(f"[CREATED] Admin user: {admin_user.email}")
        print("Login credentials:")
        print("Email: admin@test.com")
        print("Password: admin123")
        
    except Exception as e:
        print(f"[ERROR] Failed to create admin user: {e}")

if __name__ == '__main__':
    create_admin_user()