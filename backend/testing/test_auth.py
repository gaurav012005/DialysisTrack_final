#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_authentication():
    """Test the authentication flow"""
    
    base_url = 'http://localhost:8000'
    
    # Test login
    print("Testing login...")
    login_data = {
        'email': 'admin@test.com',
        'password': 'admin123'
    }
    
    try:
        response = requests.post(f'{base_url}/api/auth/login/', json=login_data)
        print(f"Login response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access')
            print(f"Login successful! Token: {token[:50]}...")
            
            # Test authenticated endpoint
            print("\nTesting authenticated endpoint...")
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test patients endpoint
            patients_response = requests.get(f'{base_url}/api/patients/', headers=headers)
            print(f"Patients endpoint status: {patients_response.status_code}")
            
            # Test dashboard stats endpoint
            stats_response = requests.get(f'{base_url}/api/reports/dashboard-stats/', headers=headers)
            print(f"Dashboard stats endpoint status: {stats_response.status_code}")
            
            if patients_response.status_code == 200:
                print("✅ Authentication working correctly!")
            else:
                print(f"❌ Authentication failed: {patients_response.text}")
                
        else:
            print(f"❌ Login failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_authentication()