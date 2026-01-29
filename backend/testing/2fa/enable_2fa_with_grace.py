"""
Enable 2FA with Grace Period for Testing
Sets up a user with 2FA enabled and 3 grace logins
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from two_factor.models import TwoFactorReminder, BackupCode
from django.contrib.auth import get_user_model
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.util import random_hex

User = get_user_model()


def enable_2fa_for_user(email, grace_logins=3):
    """Enable 2FA for a user with grace period"""
    
    user = User.objects.filter(email=email).first()
    if not user:
        print(f"❌ User {email} not found!")
        return False
    
    print(f"\n📧 Setting up 2FA for: {email}")
    print("="*70)
    
    # Clean up existing 2FA
    TOTPDevice.objects.filter(user=user).delete()
    BackupCode.objects.filter(user=user).delete()
    print("  ✅ Cleaned up old 2FA data")
    
    # Create TOTP device
    device = TOTPDevice.objects.create(
        user=user,
        name='default',
        confirmed=True  # Mark as confirmed so it's active
    )
    print(f"  ✅ Created TOTP device (confirmed)")
    
    # Generate backup codes
    backup_codes = []
    for _ in range(10):
        code = random_hex(4).upper()
        BackupCode.objects.create(user=user, code=code)
        backup_codes.append(code)
    print(f"  ✅ Generated {len(backup_codes)} backup codes")
    
    # Setup reminder with grace period
    reminder, created = TwoFactorReminder.objects.get_or_create(user=user)
    reminder.grace_logins_remaining = grace_logins
    reminder.logout_count = 0
    reminder.reminder_skip_count = 0
    reminder.last_reminder_shown = None
    reminder.save()
    print(f"  ✅ Set grace period: {grace_logins} free logins")
    
    print("\n" + "="*70)
    print("  2FA ENABLED SUCCESSFULLY!")
    print("=" *70)
    print(f"\n📱 IMPORTANT:")
    print(f"   - User has {grace_logins} grace logins (no code needed)")
    print(f"   - On login #{grace_logins + 1}, 2FA code will be required")
    print(f"   - Secret key: {device.key}")
    print(f"\n🔐 To test login with code:")
    print(f"   1. Get the secret: {device.key}")
    print(f"   2. Use Google Authenticator or generate code")
    print(f"   3. Or use a backup code from above")
    
    print(f"\n📋 Backup Codes (save these!):")
    for i, code in enumerate(backup_codes, 1):
        print(f"   {i:2d}. {code}")
    
    print("\n" + "="*70)
    return True


if __name__ == "__main__":
    import sys
    
    # Get email from command line or use default
    email = sys.argv[1] if len(sys.argv) > 1 else 'admin@dialysistrack.com'
    grace = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    
    enable_2fa_for_user(email, grace)
    
    print("\n✅ READY TO TEST!")
    print(f"\n🧪 Test Flow:")
    print(f"   1. Login {grace} times → No code needed")
    print(f"   2. Login #{grace + 1} → Code required!")
    print("="*70 + "\n")
