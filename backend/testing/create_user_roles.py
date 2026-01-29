#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import User

def create_user_roles():
    """Create default user roles if they don't exist"""
    
    users_to_create = [
        {
            'email': 'doctor@test.com',
            'username': 'doctor',
            'password': 'doctor123',
            'first_name': 'Dr. John',
            'last_name': 'Smith',
            'role': 'doctor',
            'is_staff': True
        },
        {
            'email': 'nurse@test.com', 
            'username': 'nurse',
            'password': 'nurse123',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'role': 'nurse',
            'is_staff': True
        },
        {
            'email': 'reception@test.com',
            'username': 'reception', 
            'password': 'reception123',
            'first_name': 'Mike',
            'last_name': 'Davis',
            'role': 'receptionist',
            'is_staff': True
        }
    ]
    
    created_count = 0
    
    for user_data in users_to_create:
        email = user_data['email']
        username = user_data['username']
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            print(f"[OK] User {username} already exists")
            continue
            
        if User.objects.filter(username=username).exists():
            print(f"[OK] User {username} already exists")
            continue
        
        # Create user
        try:
            user = User.objects.create_user(
                email=email,
                username=username,
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                role=user_data['role'],
                is_staff=user_data['is_staff']
            )
            print(f"[CREATED] User: {username} ({email})")
            created_count += 1
            
        except Exception as e:
            print(f"[ERROR] Failed to create {username}: {e}")
    
    print(f"\nCreated {created_count} new users")
    print("\nLogin Credentials:")
    print("| Role         | Username   | Password     | Email              |")
    print("|--------------|------------|--------------|-------------------|")
    print("| Doctor       | doctor     | doctor123    | doctor@test.com   |")
    print("| Nurse        | nurse      | nurse123     | nurse@test.com    |") 
    print("| Receptionist | reception  | reception123 | reception@test.com|")

if __name__ == '__main__':
    create_user_roles()