"""
Test script to verify 2FA reminder shows after 3 logins
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_2fa_reminder():
    """Test that 2FA reminder shows after 3 login attempts"""
    
    # Test credentials - use a staff member who doesn't have 2FA setup
    email = "doctor@hospital.com"  # Change this to an actual staff email from your database
    password = "doctor123"  # Change this to the actual password
    
    print("Testing 2FA Reminder System")
    print("=" * 50)
    print(f"Testing with: {email}")
    print("=" * 50)
    
    # Perform 3 login attempts
    for i in range(1, 4):
        print(f"\n--- Login Attempt {i} ---")
        
        response = requests.post(
            f"{BASE_URL}/api/auth/login/",
            json={
                "email": email,
                "password": password
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Login successful")
            print(f"  - Requires 2FA: {data.get('requires_2fa', False)}")
            print(f"  - Show 2FA Reminder: {data.get('show_2fa_reminder', False)}")
            
            if data.get('show_2fa_reminder'):
                print("\n🎉 SUCCESS! 2FA reminder triggered after 3 logins!")
                return True
        else:
            print(f"✗ Login failed: {response.status_code}")
            print(f"  Error: {response.text}")
            return False
    
    print("\n⚠ Warning: 2FA reminder did not show after 3 logins")
    print("This might be expected if:")
    print("1. The user already has 2FA enabled")
    print("2. The user is not a staff member")
    print("3. The reminder was recently shown")
    return False

if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("2FA REMINDER TEST SCRIPT")
    print("=" * 50)
    print("\nNOTE: Before running this script:")
    print("1. Make sure the backend server is running")
    print("2. Update the email and password in the script")
    print("3. Ensure the user is a staff member without 2FA")
    print("=" * 50 + "\n")
    
    input("Press Enter to start the test...")
    
    test_2fa_reminder()
    
    print("\n" + "=" * 50)
    print("Test completed!")
    print("=" * 50)
