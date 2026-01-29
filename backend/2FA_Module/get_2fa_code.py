#!/usr/bin/env python
"""
LIVE 2FA Code Generator
Run this to get a valid code that will work RIGHT NOW
"""

import os
import sys
import django
import time

# Setup Django
sys.path.insert(0, r'C:\5th sem\100 working project\DialysisTrack\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib.auth import get_user_model
import pyotp
import base64

User = get_user_model()

def get_valid_code():
    print("\n" + "=" * 60)
    print("🔐 LIVE 2FA CODE GENERATOR")
    print("=" * 60)
    
    # Get admin user
    user = User.objects.get(email='admin@dialysistrack.com')
    
    # Get the most recent unconfirmed device
    device = TOTPDevice.objects.filter(user=user, confirmed=False).order_by('-id').first()
    
    if not device:
        print("\n❌ No 2FA setup in progress!")
        print("Please click 'Start Setup' in the browser first.")
        return
    
    # Convert hex key to base32
    secret_base32 = base64.b32encode(bytes.fromhex(device.key)).decode('utf-8').rstrip('=')
    
    print(f"\n✅ User: {user.email}")
    print(f"✅ Secret: {secret_base32}")
    
    # Generate current code
    totp = pyotp.TOTP(secret_base32)
    
    print("\n" + "=" * 60)
    print("⏰ WAITING FOR FRESH CODE...")
    print("=" * 60)
    
    # Wait for a code change to ensure it's fresh
    old_code = totp.now()
    print(f"\nCurrent code: {old_code} (waiting for it to change...)")
    
    while True:
        new_code = totp.now()
        if new_code != old_code:
            break
        time.sleep(1)
        print(".", end="", flush=True)
    
    print(f"\n\n" + "=" * 60)
    print(f"✅ FRESH CODE READY!")
    print("=" * 60)
    print(f"\n🔢 ENTER THIS CODE: {new_code}")
    print("\n⚠️  IMPORTANT: Enter it in the browser NOW!")
    print("   This code is valid for 30 seconds.")
    print("=" * 60)
    
    # Countdown
    print("\n⏱️  Time remaining:")
    for i in range(25, 0, -5):
        print(f"   {i} seconds...")
        time.sleep(5)
    
    print("\n⚠️  Code expiring soon! Hurry!")

if __name__ == "__main__":
    try:
        get_valid_code()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure you've started the 2FA setup in the browser first!")
