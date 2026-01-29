#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import requests

def test_export():
    """Test export functionality"""
    
    # Login first
    login_data = {
        'email': 'admin@test.com',
        'password': 'admin123'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/auth/login/', json=login_data)
        if response.status_code == 200:
            token = response.json()['access']
            print("✅ Login successful")
            
            # Test CSV export
            headers = {'Authorization': f'Bearer {token}'}
            export_response = requests.get(
                'http://localhost:8000/api/reports/export/?type=patients&format=csv',
                headers=headers
            )
            
            print(f"Export response status: {export_response.status_code}")
            print(f"Content-Type: {export_response.headers.get('Content-Type')}")
            print(f"Content-Disposition: {export_response.headers.get('Content-Disposition')}")
            
            if export_response.status_code == 200:
                print("✅ CSV export working")
                # Save test file
                with open('test_export.csv', 'wb') as f:
                    f.write(export_response.content)
                print("✅ Test file saved as test_export.csv")
            else:
                print(f"❌ Export failed: {export_response.text}")
                
        else:
            print(f"❌ Login failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Server not running. Start with: python manage.py runserver")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_export()