#!/usr/bin/env python
"""
Test script to verify 2FA codes are working correctly
This will generate valid TOTP codes for testing
"""

import pyotp
import time

# Your secret key from the 2FA setup page
SECRET_KEY = "427ef27f840e078d527cb72a919dfd9804371318"

def generate_code():
    """Generate a valid TOTP code"""
    totp = pyotp.TOTP(SECRET_KEY)
    return totp.now()

def verify_code(code):
    """Verify if a code is valid"""
    totp = pyotp.TOTP(SECRET_KEY)
    # Check with drift tolerance
    for drift in range(-2, 3):  # -2, -1, 0, 1, 2
        if totp.verify(code, valid_window=drift):
            return True
    return False

if __name__ == "__main__":
    print("=" * 60)
    print("2FA Code Generator & Tester")
    print("=" * 60)
    print(f"\nSecret Key: {SECRET_KEY}")
    print("\nGenerating codes every 5 seconds...")
    print("Press Ctrl+C to stop\n")
    
    try:
        while True:
            code = generate_code()
            print(f"Current Code: {code}")
            print(f"  - Valid: {verify_code(code)}")
            print(f"  - Time: {time.strftime('%H:%M:%S')}")
            print()
            time.sleep(5)
    except KeyboardInterrupt:
        print("\n\nStopped!")
