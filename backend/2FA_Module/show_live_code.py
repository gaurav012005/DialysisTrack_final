#!/usr/bin/env python
"""
Real-time 2FA Code Display
Shows the current valid code continuously
"""

import os
import sys
import django
import time
from datetime import datetime

# Setup Django
sys.path.insert(0, r'C:\5th sem\100 working project\DialysisTrack\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib.auth import get_user_model
import pyotp
import base64

User = get_user_model()

def show_live_codes():
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
    
    # Create TOTP object
    totp = pyotp.TOTP(secret_base32)
    
    print("\n" + "=" * 70)
    print("🔐 REAL-TIME 2FA CODE DISPLAY")
    print("=" * 70)
    print(f"User: {user.email}")
    print(f"Secret: {secret_base32}")
    print("=" * 70)
    print("\n⚠️  INSTRUCTIONS:")
    print("   1. Keep this window visible")
    print("   2. Enter the code shown below into the browser")
    print("   3. Press Ctrl+C to stop")
    print("\n" + "=" * 70)
    
    last_code = None
    
    try:
        while True:
            current_code = totp.now()
            current_time = datetime.now().strftime('%H:%M:%S')
            
            # Calculate seconds remaining
            seconds = 30 - (int(time.time()) % 30)
            
            # Clear line and show current code
            if current_code != last_code:
                print(f"\n{'='*70}")
                print(f"🆕 NEW CODE AVAILABLE!")
                print(f"{'='*70}")
            
            print(f"\r⏰ {current_time} | 🔢 CODE: {current_code} | ⏱️  Valid for: {seconds:2d}s ", end='', flush=True)
            
            last_code = current_code
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n✅ Stopped!")

if __name__ == "__main__":
    try:
        show_live_codes()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure you've started the 2FA setup in the browser first!")
