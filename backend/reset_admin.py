"""
Reset Django Admin Superuser
This script creates or resets the Django admin superuser with predefined credentials.
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def reset_admin():
    """Create or reset the admin superuser."""
    
    # Admin credentials
    ADMIN_EMAIL = 'admin@dialysis.com'
    ADMIN_PASSWORD = 'Admin@2026'  # Strong password
    ADMIN_USERNAME = 'admin'
    
    print("=" * 60)
    print("🔐 DJANGO ADMIN RESET SCRIPT")
    print("=" * 60)
    
    # Check if admin exists
    try:
        admin_user = User.objects.get(email=ADMIN_EMAIL)
        print(f"✅ Found existing admin user: {ADMIN_EMAIL}")
        
        # Update password
        admin_user.set_password(ADMIN_PASSWORD)
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.role = 'admin'
        admin_user.save()
        
        print("✅ Admin password has been RESET")
        
    except User.DoesNotExist:
        print(f"⚠️  Admin user not found. Creating new admin...")
        
        # Create new admin
        admin_user = User.objects.create_superuser(
            username=ADMIN_USERNAME,
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            first_name='System',
            last_name='Administrator',
            role='admin',
            department='Administration'
        )
        
        print("✅ New admin user CREATED")
    
    print("\n" + "=" * 60)
    print("🎉 DJANGO ADMIN CREDENTIALS")
    print("=" * 60)
    print(f"📧 Email:    {ADMIN_EMAIL}")
    print(f"🔑 Password: {ADMIN_PASSWORD}")
    print(f"🌐 URL:      http://localhost:8000/admin")
    print("=" * 60)
    print("\n⚠️  IMPORTANT: Save these credentials in PASSWORDS.md")
    print("=" * 60)

if __name__ == '__main__':
    reset_admin()
