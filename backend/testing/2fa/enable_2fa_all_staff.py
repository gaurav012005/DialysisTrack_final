"""
Enable 2FA for All Staff Users (Excluding Patients)
Sets up 2FA with grace period for all staff members
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


def enable_2fa_for_all_staff(grace_logins=3):
    """Enable 2FA for all staff users with grace period"""
    
    print("="*70)
    print("  ENABLE 2FA FOR ALL STAFF (EXCLUDING PATIENTS)")
    print("="*70)
    
    # Get all staff users (NOT patients)
    staff_roles = ['admin', 'doctor', 'nurse', 'receptionist', 'technician']
    staff_users = User.objects.filter(
        role__in=staff_roles,
        is_active=True
    )
    
    print(f"\nFound {staff_users.count()} staff users")
    print(f"Grace period: {grace_logins} free logins per user\n")
    
    success_count = 0
    
    for user in staff_users:
        print(f"\n📧 {user.email} ({user.role})")
        print("-" * 70)
        
        try:
            # Clean up existing 2FA
            TOTPDevice.objects.filter(user=user).delete()
            BackupCode.objects.filter(user=user).delete()
            
            # Create TOTP device
            device = TOTPDevice.objects.create(
                user=user,
                name='default',
                confirmed=True
            )
            print(f"   ✅ Created TOTP device")
            
            # Generate backup codes
            backup_codes = []
            for _ in range(10):
                code = random_hex(4).upper()
                BackupCode.objects.create(user=user, code=code)
                backup_codes.append(code)
            print(f"   ✅ Generated 10 backup codes")
            
            # Setup reminder with grace period
            reminder, created = TwoFactorReminder.objects.get_or_create(user=user)
            reminder.grace_logins_remaining = grace_logins
            reminder.logout_count = 0
            reminder.reminder_skip_count = 0
            reminder.last_reminder_shown = None
            reminder.save()
            print(f"   ✅ Set grace period: {grace_logins} free logins")
            
            print(f"   📋 Backup codes: {', '.join(backup_codes[:3])}... (10 total)")
            
            success_count += 1
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n" + "="*70)
    print(f"  SUMMARY")
    print("="*70)
    print(f"   Total staff users: {staff_users.count()}")
    print(f"   Successfully enabled: {success_count}")
    print(f"   Grace logins per user: {grace_logins}")
    
    # Show patient status
    patient_count = User.objects.filter(role='patient', is_active=True).count()
    print(f"\n   Patients (2FA DISABLED): {patient_count}")
    print(f"   ✅ Patients can login without 2FA")
    
    print("\n" + "="*70)
    print("  2FA ENABLED FOR ALL STAFF!")
    print("="*70)
    print(f"\n📱 How it works:")
    print(f"   - First {grace_logins} logins: No code needed")
    print(f"   - Login #{grace_logins + 1} onwards: 2FA code required")
    print(f"   - Patients: No 2FA at all (normal login)")
    print("="*70 + "\n")


if __name__ == "__main__":
    import sys
    
    # Get grace logins from command line or use default
    grace = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    
    # Confirm
    print("\n⚠️  This will enable 2FA for ALL staff users")
    print("    (admin, doctor, nurse, receptionist, technician)")
    print("    Patients will NOT have 2FA")
    print(f"    Grace period: {grace} free logins")
    
    confirm = input("\n❓ Continue? (yes/no): ")
    
    if confirm.lower() in ['yes', 'y']:
        enable_2fa_for_all_staff(grace)
    else:
        print("\n❌ Cancelled")
