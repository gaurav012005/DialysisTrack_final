import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

print("\n" + "="*60)
print("  REACTIVATING ADMIN ACCOUNT")
print("="*60 + "\n")

# Find admin user
admin = User.objects.filter(email='admin@dialysis.com').first()

if admin:
    print(f"Found admin: {admin.email}")
    print(f"Current status: {'Active' if admin.is_active else 'INACTIVE'}")
    
    if not admin.is_active:
        admin.is_active = True
        admin.save()
        print("\n✅ Admin account has been ACTIVATED!")
    else:
        print("\n✅ Admin account is already active")
    
    print(f"\nFinal status:")
    print(f"  Email: {admin.email}")
    print(f"  Password: Admin@2026")
    print(f"  Is Active: {admin.is_active}")
    print(f"  Role: {admin.role}")
else:
    print("❌ Admin user not found!")

print("\n" + "="*60)
print("  DONE - You can now login!")
print("="*60)
