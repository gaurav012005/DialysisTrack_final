import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import authenticate, get_user_model

User = get_user_model()

# Test superadmin login
print("=" * 60)
print("Testing Django Admin Login")
print("=" * 60)

username = 'superadmin'
password = 'Admin@2026'

user = authenticate(username=username, password=password)

if user:
    print(f"✅ Authentication SUCCESSFUL!")
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Is staff: {user.is_staff}")
    print(f"Is superuser: {user.is_superuser}")
    print(f"Is active: {user.is_active}")
    print("\n🎉 You can login with:")
    print(f"   Username: {username}")
    print(f"   Password: {password}")
else:
    print(f"❌ Authentication FAILED!")
    print(f"Username tried: {username}")
    print(f"Password tried: {password}")
    
    # Check if user exists
    try:
        user_obj = User.objects.get(username=username)
        print(f"\n⚠️ User exists but password is incorrect")
        print(f"User details:")
        print(f"  - Username: {user_obj.username}")
        print(f"  - Email: {user_obj.email}")
        print(f"  - Is staff: {user_obj.is_staff}")
        print(f"  - Is superuser: {user_obj.is_superuser}")
        print(f"  - Is active: {user_obj.is_active}")
        
        # Reset password
        print(f"\n🔄 Resetting password to: {password}")
        user_obj.set_password(password)
        user_obj.save()
        print("✅ Password reset complete!")
        
        # Test again
        user = authenticate(username=username, password=password)
        if user:
            print("✅ Authentication now works!")
        else:
            print("❌ Still failing - there may be another issue")
            
    except User.DoesNotExist:
        print(f"\n❌ User '{username}' does not exist!")
        print("Creating user now...")
        user_obj = User.objects.create_superuser(
            username=username,
            email='superadmin@dialysis.com',
            password=password
        )
        print(f"✅ User created: {user_obj.username}")

print("=" * 60)
