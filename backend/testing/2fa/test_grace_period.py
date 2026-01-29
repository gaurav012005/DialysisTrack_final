import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from two_factor.models import TwoFactorReminder
from django.contrib.auth import get_user_model
from django_otp.plugins.otp_totp.models import TOTPDevice

User = get_user_model()

print("="*70)
print("  Setting up test user with 2FA and grace period")
print("="*70)

# Get admin user
user = User.objects.filter(email='admin@dialysistrack.com').first()
print(f"\n1. User: {user.email}")

# Create 2FA device
TOTPDevice.objects.filter(user=user).delete()
device = TOTPDevice.objects.create(
    user=user,
    name='test_device',
    confirmed=True
)
print(f"2. Created 2FA device: ✅")

# Create reminder with grace period
reminder, _ = TwoFactorReminder.objects.get_or_create(user=user)
reminder.grace_logins_remaining = 3
reminder.save()
print(f"3. Set grace logins: {reminder.grace_logins_remaining}")

# Test the flow
print("\n" + "="*70)
print("  Testing Grace Period Flow")
print("="*70)

for i in range(1, 5):
    print(f"\nLogin #{i}:")
    print(f"  Grace remaining before: {reminder.grace_logins_remaining}")
    print(f"  Needs 2FA code: {reminder.needs_2fa_verification()}")
    
    if not reminder.needs_2fa_verification():
        # Simulate login (use grace)
        reminder.use_grace_login()
        print(f"  ✅ Login allowed without code")
        print(f"  Grace remaining after: {reminder.grace_logins_remaining}")
    else:
        print(f"  🔐 Must enter 2FA code!")
    
    reminder.refresh_from_db()

print("\n" + "="*70)
print("  EXPECTED BEHAVIOR:")
print("="*70)
print("  Login #1: No code needed (2 grace left)")
print("  Login #2: No code needed (1 grace left)")
print("  Login #3: No code needed (0 grace left)")
print("  Login #4: CODE REQUIRED!")
print("="*70)

# Clean up
device.delete()
print("\n✅ Test device removed")
