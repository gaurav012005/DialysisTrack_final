import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

print("\n" + "="*60)
print("  CHECKING ADMIN USER IN DATABASE")
print("="*60 + "\n")

# Find all users with admin role
admin_users = User.objects.filter(role='admin')

print(f"Found {admin_users.count()} admin user(s):\n")

for admin in admin_users:
    print(f"ID: {admin.id}")
    print(f"Email: {admin.email}")
    print(f"Username: {admin.username}")
    print(f"First Name: {admin.first_name}")
    print(f"Last Name: {admin.last_name}")
    print(f"Role: {admin.role}")
    print(f"Is Active: {admin.is_active}")
    print(f"Is Staff: {admin.is_staff}")
    print(f"Is Superuser: {admin.is_superuser}")
    print(f"Date Joined: {admin.date_joined}")
    
    # Test passwords
    print("\nTesting passwords:")
    passwords_to_test = ['admin123', 'Admin@2026', 'admin', 'password']
    for pwd in passwords_to_test:
        if admin.check_password(pwd):
            print(f"  ✅ CORRECT PASSWORD: {pwd}")
        else:
            print(f"  ❌ Wrong: {pwd}")
    
    print("\n" + "-"*60 + "\n")

# Also check if there are any users with email admin@dialysis.com
print("\nChecking for admin@dialysis.com specifically:")
admin_by_email = User.objects.filter(email='admin@dialysis.com')
print(f"Found {admin_by_email.count()} user(s) with email admin@dialysis.com\n")

for user in admin_by_email:
    print(f"ID: {user.id}")
    print(f"Email: {user.email}")
    print(f"Role: {user.role}")
    print(f"Is Active: {user.is_active}")
    
    # Test passwords
    print("\nTesting passwords:")
    passwords_to_test = ['admin123', 'Admin@2026', 'admin', 'password', 'staff123']
    for pwd in passwords_to_test:
        if user.check_password(pwd):
            print(f"  ✅ CORRECT PASSWORD: {pwd}")
        else:
            print(f"  ❌ Wrong: {pwd}")
    
    print("\n" + "-"*60 + "\n")

print("="*60)
print("  CHECK COMPLETE")
print("="*60)
