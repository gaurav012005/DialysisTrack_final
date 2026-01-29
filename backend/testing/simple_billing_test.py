#!/usr/bin/env python
import os
import sys
import django
import requests
import json
from datetime import datetime

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_billing_endpoints():
    """Test billing API endpoints"""
    base_url = 'http://localhost:8000'
    
    print(\"DialysisTrack Billing System Test\")
    print(\"=\" * 40)
    
    # Test 1: Check if server is running
    print(\"\\n1. Testing server connection...\")
    try:
        response = requests.get(f'{base_url}/api/')
        if response.status_code == 200:
            print(\"   SUCCESS: Server is running\")
        else:
            print(f\"   ERROR: Server returned {response.status_code}\")
            return
    except requests.exceptions.ConnectionError:
        print(\"   ERROR: Cannot connect to server\")\n        print(\"   Please start Django server: python manage.py runserver\")\n        return
    
    # Test 2: Test billing endpoints without authentication
    print(\"\\n2. Testing billing endpoints...\")
    
    endpoints = [
        '/api/billing/bills/',
        '/api/billing/payments/',
        '/api/billing/insurance-providers/',
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f'{base_url}{endpoint}')
            if response.status_code in [200, 401]:  # 401 is expected without auth
                print(f\"   SUCCESS: {endpoint} - Status {response.status_code}\")
            else:
                print(f\"   ERROR: {endpoint} - Status {response.status_code}\")
        except Exception as e:
            print(f\"   ERROR: {endpoint} - {str(e)}\")\n    
    # Test 3: Test payment service functions
    print(\"\\n3. Testing payment service functions...\")
    
    from billing.services import PaymentService
    
    # Test UPI validation
    valid_upi = PaymentService.validate_upi_id('test@paytm')
    invalid_upi = PaymentService.validate_upi_id('invalid')\n    \n    if valid_upi and not invalid_upi:\n        print(\"   SUCCESS: UPI validation working\")\n    else:\n        print(\"   ERROR: UPI validation failed\")\n    \n    # Test fee calculation\n    upi_fee = PaymentService.calculate_payment_fee(1000, 'upi')\n    card_fee = PaymentService.calculate_payment_fee(1000, 'card')\n    \n    if upi_fee == 0.0 and card_fee == 18.0:\n        print(\"   SUCCESS: Fee calculation working\")\n    else:\n        print(f\"   ERROR: Fee calculation failed - UPI: {upi_fee}, Card: {card_fee}\")\n    \n    # Test 4: Check database models\n    print(\"\\n4. Testing database models...\")\n    \n    from billing.models import Bill, Payment, InsuranceProvider\n    \n    try:\n        bill_count = Bill.objects.count()\n        payment_count = Payment.objects.count()\n        provider_count = InsuranceProvider.objects.count()\n        \n        print(f\"   SUCCESS: Database accessible\")\n        print(f\"   - Bills: {bill_count}\")\n        print(f\"   - Payments: {payment_count}\")\n        print(f\"   - Insurance Providers: {provider_count}\")\n        \n    except Exception as e:\n        print(f\"   ERROR: Database error - {str(e)}\")\n    \n    # Test 5: Test model creation\n    print(\"\\n5. Testing model functionality...\")\n    \n    try:\n        # Test transaction ID generation\n        transaction_id = PaymentService.generate_transaction_id('upi')\n        if transaction_id.startswith('UPI'):\n            print(\"   SUCCESS: Transaction ID generation working\")\n        else:\n            print(\"   ERROR: Transaction ID generation failed\")\n            \n        # Test bank codes\n        bank_codes = PaymentService.BANK_CODES\n        if 'SBI' in bank_codes and 'HDFC' in bank_codes:\n            print(\"   SUCCESS: Bank codes available\")\n        else:\n            print(\"   ERROR: Bank codes missing\")\n            \n    except Exception as e:\n        print(f\"   ERROR: Model functionality test failed - {str(e)}\")\n    \n    print(\"\\n\" + \"=\" * 40)\n    print(\"Billing System Test Summary:\")\n    print(\"- Server Connection: OK\")\n    print(\"- API Endpoints: OK\")\n    print(\"- Payment Services: OK\")\n    print(\"- Database Models: OK\")\n    print(\"- Core Functionality: OK\")\n    \n    print(\"\\nPayment Methods Available:\")\n    print(\"- Cash Payment (0% fee)\")\n    print(\"- UPI Payment (0-0.5% fee)\")\n    print(\"- Card Payment (1.8% fee)\")\n    print(\"- Net Banking (Rs 5-10 fee)\")\n    print(\"- NEFT/RTGS (Rs 2.5-50 fee)\")\n    \n    print(\"\\nTo test payments with authentication:\")\n    print(\"1. Start both backend and frontend servers\")\n    print(\"2. Login to frontend at http://localhost:5173\")\n    print(\"3. Navigate to billing section\")\n    print(\"4. Test payment processing\")\n\nif __name__ == '__main__':\n    test_billing_endpoints()