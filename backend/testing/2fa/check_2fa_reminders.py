"""
2FA Reminder Checker Script
Checks and displays the current reminder status for all users
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django_otp.plugins.otp_totp.models import TOTPDevice
from two_factor.models import TwoFactorReminder, BackupCode
from django.utils import timezone

User = get_user_model()


def print_header(text):
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)


def check_reminder_status():
    """Check reminder status for all staff users"""
    print_header("2FA Reminder Status Check")
    
    # Get all staff users
    staff_users = User.objects.filter(
        role__in=['admin', 'doctor', 'nurse', 'receptionist', 'technician'],
        is_active=True
    )
    
    print(f"\nFound {staff_users.count()} staff users\n")
    
    for user in staff_users:
        print(f"\n📧 {user.email} ({user.role})")
        print("-" * 70)
        
        # Check 2FA status
        has_2fa = TOTPDevice.objects.filter(user=user, confirmed=True).exists()
        print(f"   2FA Enabled: {'✅ Yes' if has_2fa else '❌ No'}")
        
        if has_2fa:
            backup_count = BackupCode.objects.filter(user=user, is_used=False).count()
            print(f"   Backup Codes: {backup_count} remaining")
        
        # Check reminder status
        try:
            reminder = TwoFactorReminder.objects.get(user=user)
            
            print(f"\n   Reminder Tracker:")
            print(f"   ├─ Logout count: {reminder.logout_count}")
            print(f"   ├─ Skip count: {reminder.reminder_skip_count}")
            print(f"   ├─ Grace logins: {reminder.grace_logins_remaining}")
            
            if reminder.last_reminder_shown:
                hours_ago = (timezone.now() - reminder.last_reminder_shown).total_seconds() / 3600
                print(f"   ├─ Last reminder: {hours_ago:.1f} hours ago")
            else:
                print(f"   ├─ Last reminder: Never")
            
            # Check if reminder should show
            should_show = reminder.should_show_reminder()
            print(f"   └─ Should show reminder: {'⚠️  YES' if should_show else '✅ No'}")
            
            # Check if needs verification
            if has_2fa:
                needs_verify = reminder.needs_2fa_verification()
                print(f"   └─ Needs 2FA code: {'🔐 YES' if needs_verify else '✅ No (grace period)'}")
            
        except TwoFactorReminder.DoesNotExist:
            print(f"   ⚠️  No reminder tracker (will be created on login)")
    
    print("\n" + "="*70)


def check_triggers():
    """Check which users would trigger reminders"""
    print_header("Users Who Will See Reminders")
    
    staff_users = User.objects.filter(
        role__in=['admin', 'doctor', 'nurse', 'receptionist', 'technician'],
        is_active=True
    )
    
    will_see_reminder = []
    
    for user in staff_users:
        # Skip users with 2FA already enabled
        if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
            continue
        
        try:
            reminder = TwoFactorReminder.objects.get(user=user)
            if reminder.should_show_reminder():
                will_see_reminder.append((user, reminder))
        except TwoFactorReminder.DoesNotExist:
            pass
    
    if will_see_reminder:
        print(f"\n⚠️  {len(will_see_reminder)} user(s) will see reminder on next login:\n")
        for user, reminder in will_see_reminder:
            print(f"   📧 {user.email}")
            print(f"      Reason: ", end="")
            if reminder.logout_count >= reminder.logouts_before_reminder:
                print(f"Logout count ({reminder.logout_count} ≥ {reminder.logouts_before_reminder})")
            elif reminder.last_reminder_shown:
                hours = (timezone.now() - reminder.last_reminder_shown).total_seconds() / 3600
                print(f"Time elapsed ({hours:.1f}h ≥ 24h)")
            print()
    else:
        print("\n✅ No users will see reminder (all have 2FA or not triggered yet)")
    
    print("="*70)


def summary():
    """Show summary statistics"""
    print_header("Summary Statistics")
    
    total_staff = User.objects.filter(
        role__in=['admin', 'doctor', 'nurse', 'receptionist', 'technician'],
        is_active=True
    ).count()
    
    with_2fa = TOTPDevice.objects.filter(
        user__role__in=['admin', 'doctor', 'nurse', 'receptionist', 'technician'],
        user__is_active=True,
        confirmed=True
    ).values('user').distinct().count()
    
    without_2fa = total_staff - with_2fa
    
    in_grace = TwoFactorReminder.objects.filter(
        user__role__in=['admin', 'doctor', 'nurse', 'receptionist', 'technician'],
        user__is_active=True,
        grace_logins_remaining__gt=0
    ).count()
    
    print(f"\n📊 Staff Users:")
    print(f"   Total: {total_staff}")
    print(f"   With 2FA: {with_2fa} ({with_2fa*100//total_staff if total_staff else 0}%)")
    print(f"   Without 2FA: {without_2fa} ({without_2fa*100//total_staff if total_staff else 0}%)")
    print(f"   In grace period: {in_grace}")
    
    print("\n✅ Reminder system operational!")
    print("="*70 + "\n")


if __name__ == "__main__":
    check_reminder_status()
    check_triggers()
    summary()
