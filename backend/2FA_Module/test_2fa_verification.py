#!/usr/bin/env python
"""
Direct test of 2FA verification using the Django OTP library
This will help us debug why codes aren't verifying
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, r'C:\5th sem\100 working project\DialysisTrack\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib.auth import get_user_model
import pyotp

User = get_user_model()

def test_2fa():
    print("=" * 60)
    print("2FA Verification Test")
    print("=" * 60)
    
    # Get admin user
    try:
        user = User.objects.get(email='admin@dialysistrack.com')
        print(f"\n✅ Found user: {user.email}")
    except User.DoesNotExist:
        print("\n❌ User not found!")
        return
    
    # Get unconfirmed device
    device = TOTPDevice.objects.filter(user=user, confirmed=False).first()
    
    if not device:
        print("\n❌ No unconfirmed 2FA device found!")
        print("Please start the 2FA setup in the browser first.")
        return
    
    print(f"\n✅ Found device: {device.name}")
    print(f"   Device key (hex): {device.key}")
    
    # Convert to base32
    import base64
    secret_base32 = base64.b32encode(bytes.fromhex(device.key)).decode('utf-8').rstrip('=')
    print(f"   Secret (base32): {secret_base32}")
    
    # Generate current code using pyotp
    totp = pyotp.TOTP(secret_base32)
    current_code = totp.now()
    print(f"\n📱 Current TOTP code: {current_code}")
    
    # Test verification with device
    device.tolerance = 2
    result = device.verify_token(current_code)
    
    print(f"\n🔍 Verification result: {result}")
    
    if result:
        print("✅ Code verified successfully!")
    else:
        print("❌ Code verification failed!")
        print("\nTrying with different tolerance values...")
        for tol in [0, 1, 2, 3, 4, 5]:
            device.tolerance = tol
            if device.verify_token(current_code):
                print(f"   ✅ Works with tolerance={tol}")
                break
        else:
            print("   ❌ Doesn't work with any tolerance!")
    
    # Test a few codes
    print("\n📋 Testing multiple codes:")
    for i in range(3):
        code = totp.now()
        device.tolerance = 2
        result = device.verify_token(code)
        print(f"   Code {code}: {'✅ Valid' if result else '❌ Invalid'}")
        import time
        time.sleep(1)

if __name__ == "__main__":
    test_2fa()
