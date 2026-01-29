import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from two_factor.models import TwoFactorReminder
from django.contrib.auth import get_user_model
from django_otp.plugins.otp_totp.models import TOTPDevice

User = get_user_model()

user = User.objects.filter(email='admin@dialysistrack.com').first()
has_2fa = TOTPDevice.objects.filter(user=user, confirmed=True).exists()

print(f"User: {user.email}")
print(f"Has 2FA: {has_2fa}")

if has_2fa:
    reminder = TwoFactorReminder.objects.filter(user=user).first()
    if reminder:
        print(f"Grace logins remaining: {reminder.grace_logins_remaining}")
        print(f"Needs verification: {reminder.needs_2fa_verification()}")
    else:
        print("No reminder tracker - creating one...")
        reminder = TwoFactorReminder.objects.create(user=user)
        reminder.grace_logins_remaining = 3
        reminder.save()
        print(f"Created with grace logins: {reminder.grace_logins_remaining}")
