"""
Disable 2FA for All Users
Removes all 2FA devices and resets reminder trackers
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django_otp.plugins.otp_totp.models import TOTPDevice
from two_factor.models import TwoFactorReminder, BackupCode

User = get_user_model()


def print_header(text):
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)


def disable_all_2fa():
    """Disable 2FA for all users"""
    print_header("Disable 2FA for All Users")
    
    # Count before deletion
    total_devices = TOTPDevice.objects.count()
    total_backup_codes = BackupCode.objects.count()
    total_reminders = TwoFactorReminder.objects.count()
    
    users_with_2fa = TOTPDevice.objects.filter(confirmed=True).values('user').distinct().count()
    
    print(f"\n📊 Current Status:")
    print(f"   Users with 2FA enabled: {users_with_2fa}")
    print(f"   TOTP devices: {total_devices}")
    print(f"   Backup codes: {total_backup_codes}")
    print(f"   Reminder trackers: {total_reminders}")
    
    # Ask for confirmation
    print("\n⚠️  WARNING: This will:")
    print("   - Delete all TOTP devices")
    print("   - Delete all backup codes")
    print("   - Reset all reminder trackers")
    print("   - Users will need to re-enable 2FA from scratch")
    
    confirm = input("\n❓ Type 'YES' to confirm: ")
    
    if confirm.strip().upper() != 'YES':
        print("\n❌ Cancelled. No changes made.")
        return
    
    print("\n🔄 Disabling 2FA for all users...")
    
    # Delete all TOTP devices
    deleted_devices = TOTPDevice.objects.all().delete()
    print(f"   ✅ Deleted {deleted_devices[0]} TOTP devices")
    
    # Delete all backup codes
    deleted_codes = BackupCode.objects.all().delete()
    print(f"   ✅ Deleted {deleted_codes[0]} backup codes")
    
    # Reset all reminder trackers
    reminders = TwoFactorReminder.objects.all()
    reset_count = 0
    for reminder in reminders:
        reminder.logout_count = 0
        reminder.reminder_skip_count = 0
        reminder.grace_logins_remaining = 0
        reminder.last_reminder_shown = None
        reminder.save()
        reset_count += 1
    
    print(f"   ✅ Reset {reset_count} reminder trackers")
    
    print("\n✅ SUCCESS! All 2FA has been disabled.")
    print("   Users can now login with just email/password.")
    print("   They can re-enable 2FA anytime from /2fa-setup")
    print("="*70 + "\n")


def quick_disable():
    """Quick disable without confirmation (for scripts)"""
    print_header("Quick Disable 2FA (No Confirmation)")
    
    # Delete everything
    deleted_devices = TOTPDevice.objects.all().delete()
    deleted_codes = BackupCode.objects.all().delete()
    
    # Reset reminders
    TwoFactorReminder.objects.all().update(
        logout_count=0,
        reminder_skip_count=0,
        grace_logins_remaining=0,
        last_reminder_shown=None
    )
    
    print(f"\n✅ Disabled 2FA for all users")
    print(f"   - Deleted {deleted_devices[0]} TOTP devices")
    print(f"   - Deleted {deleted_codes[0]} backup codes")
    print(f"   - Reset all reminder trackers")
    print("="*70 + "\n")


if __name__ == "__main__":
    import sys
    
    # Check for --quick flag
    if '--quick' in sys.argv or '-q' in sys.argv:
        quick_disable()
    else:
        disable_all_2fa()
