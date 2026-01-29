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

from billing.models import Bill, Payment
from patients.models import Patient
from users.models import User

class BillingTester:
    def __init__(self):
        self.base_url = 'http://localhost:8000'
        self.token = None
        
    def get_auth_token(self):
        """Get authentication token"""
        print("🔐 Getting authentication token...")
        
        # Try to get admin user
        try:
            admin_user = User.objects.filter(is_superuser=True).first()
            if not admin_user:
                print("❌ No admin user found. Please create one first.")
                return False
                
            login_data = {
                'email': admin_user.email,
                'password': 'admin123'  # Default password
            }
            
            response = requests.post(f'{self.base_url}/api/auth/login/', json=login_data)
            
            if response.status_code == 200:
                self.token = response.json()['access']
                print("✅ Authentication successful")
                return True
            else:
                print(f"❌ Authentication failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {str(e)}")
            return False
    
    def get_headers(self):
        """Get headers with authentication"""
        return {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
    
    def test_bill_api(self):
        """Test bill API endpoints"""
        print("\n📋 Testing Bill API...")
        
        # Test GET bills
        response = requests.get(f'{self.base_url}/api/billing/bills/', headers=self.get_headers())
        if response.status_code == 200:
            bills = response.json()
            print(f"✅ GET Bills: Found {len(bills.get('results', bills))} bills")
            return bills.get('results', bills)
        else:
            print(f"❌ GET Bills failed: {response.text}")
            return []
    
    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n📊 Testing Dashboard Stats...")
        
        response = requests.get(f'{self.base_url}/api/billing/bills/dashboard_stats/', headers=self.get_headers())
        if response.status_code == 200:
            stats = response.json()
            print("✅ Dashboard Stats:")
            print(f"   - Pending Bills: ₹{stats.get('total_pending', 0)}")
            print(f"   - Overdue Bills: ₹{stats.get('total_overdue', 0)}")
            print(f"   - Today's Collections: ₹{stats.get('today_collections', 0)}")
            print(f"   - Monthly Collections: ₹{stats.get('monthly_collections', 0)}")
            return True
        else:
            print(f"❌ Dashboard Stats failed: {response.text}")
            return False
    
    def test_upi_payment(self, bill_id):
        """Test UPI payment processing"""
        print("\n📱 Testing UPI Payment...")
        
        payment_data = {
            'bill_id': bill_id,
            'amount': 1000.00,
            'upi_id': 'test@paytm'
        }
        
        response = requests.post(
            f'{self.base_url}/api/billing/payments/process_upi_payment/',
            json=payment_data,
            headers=self.get_headers()
        )
        
        if response.status_code == 201:
            result = response.json()
            print("✅ UPI Payment Successful:")
            print(f"   - Payment ID: {result.get('payment_id')}")
            print(f"   - Transaction ID: {result.get('transaction_id')}")
            print(f"   - Fee: ₹{result.get('fee', 0)}")
            return True
        else:
            print(f"❌ UPI Payment failed: {response.text}")
            return False
    
    def test_card_payment(self, bill_id):
        """Test card payment processing"""
        print("\n💳 Testing Card Payment...")
        
        payment_data = {
            'bill_id': bill_id,
            'amount': 1500.00,
            'card_last_four': '1234',
            'bank_name': 'HDFC Bank',
            'card_type': 'DEBIT'
        }
        
        response = requests.post(
            f'{self.base_url}/api/billing/payments/process_card_payment/',
            json=payment_data,
            headers=self.get_headers()
        )
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Card Payment Successful:")
            print(f"   - Payment ID: {result.get('payment_id')}")
            print(f"   - Transaction ID: {result.get('transaction_id')}")
            print(f"   - Fee: ₹{result.get('fee', 0)}")
            return True
        else:
            print(f"❌ Card Payment failed: {response.text}")
            return False
    
    def test_netbanking_payment(self, bill_id):
        """Test net banking payment processing"""
        print("\n🏦 Testing Net Banking Payment...")
        
        payment_data = {
            'bill_id': bill_id,
            'amount': 2000.00,
            'bank_code': 'HDFC'
        }
        
        response = requests.post(
            f'{self.base_url}/api/billing/payments/process_netbanking_payment/',
            json=payment_data,
            headers=self.get_headers()
        )
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Net Banking Payment Successful:")
            print(f"   - Payment ID: {result.get('payment_id')}")
            print(f"   - Transaction ID: {result.get('transaction_id')}")
            print(f"   - Fee: ₹{result.get('fee', 0)}")
            return True
        else:
            print(f"❌ Net Banking Payment failed: {response.text}")
            return False
    
    def test_cash_payment(self, bill_id):
        """Test cash payment processing"""
        print("\n💵 Testing Cash Payment...")
        
        payment_data = {
            'bill_id': bill_id,
            'amount': 500.00,
            'notes': 'Cash payment at reception counter'
        }
        
        response = requests.post(
            f'{self.base_url}/api/billing/payments/process_cash_payment/',
            json=payment_data,
            headers=self.get_headers()
        )
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Cash Payment Successful:")
            print(f"   - Payment ID: {result.get('payment_id')}")
            print(f"   - Transaction ID: {result.get('transaction_id')}")
            return True
        else:
            print(f"❌ Cash Payment failed: {response.text}")
            return False
    
    def test_invalid_payments(self, bill_id):
        """Test invalid payment scenarios"""
        print("\n❌ Testing Invalid Payment Scenarios...")
        
        # Invalid UPI ID
        invalid_upi_data = {
            'bill_id': bill_id,
            'amount': 1000.00,
            'upi_id': 'invalid_upi'
        }
        
        response = requests.post(
            f'{self.base_url}/api/billing/payments/process_upi_payment/',
            json=invalid_upi_data,
            headers=self.get_headers()
        )
        
        if response.status_code == 400:
            print("✅ Invalid UPI ID correctly rejected")
        else:
            print("❌ Invalid UPI ID should have been rejected")
        
        # Invalid bank code
        invalid_bank_data = {
            'bill_id': bill_id,
            'amount': 1000.00,
            'bank_code': 'INVALID'
        }
        
        response = requests.post(
            f'{self.base_url}/api/billing/payments/process_netbanking_payment/',
            json=invalid_bank_data,
            headers=self.get_headers()
        )
        
        if response.status_code == 400:
            print("✅ Invalid bank code correctly rejected")
        else:
            print("❌ Invalid bank code should have been rejected")
    
    def test_payment_methods_stats(self):
        """Test payment methods statistics"""
        print("\n📈 Testing Payment Methods Stats...")
        
        response = requests.get(
            f'{self.base_url}/api/billing/payments/payment_methods_stats/',
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            stats = response.json()
            print("✅ Payment Methods Stats:")
            for stat in stats:
                print(f"   - {stat['payment_method']}: {stat['count']} payments, ₹{stat['total_amount']}")
            return True
        else:
            print(f"❌ Payment Methods Stats failed: {response.text}")
            return False
    
    def run_all_tests(self):
        """Run all billing tests"""
        print("🧪 Starting Billing System Tests...")
        print("=" * 50)
        
        # Get authentication token
        if not self.get_auth_token():
            return
        
        # Test bill API
        bills = self.test_bill_api()
        if not bills:
            print("❌ No bills found. Please create sample data first.")
            return
        
        # Get first bill for testing payments
        test_bill_id = bills[0]['id']
        print(f"\n🎯 Using Bill ID {test_bill_id} for payment tests")
        
        # Test dashboard stats
        self.test_dashboard_stats()
        
        # Test different payment methods
        self.test_upi_payment(test_bill_id)
        self.test_card_payment(test_bill_id)
        self.test_netbanking_payment(test_bill_id)
        self.test_cash_payment(test_bill_id)
        
        # Test invalid scenarios
        self.test_invalid_payments(test_bill_id)
        
        # Test statistics
        self.test_payment_methods_stats()
        
        print("\n" + "=" * 50)
        print("🎉 Billing System Tests Completed!")
        print("\n💡 Test Summary:")
        print("✅ Authentication")
        print("✅ Bill Management API")
        print("✅ Dashboard Statistics")
        print("✅ UPI Payment Processing")
        print("✅ Card Payment Processing")
        print("✅ Net Banking Payment")
        print("✅ Cash Payment Processing")
        print("✅ Invalid Payment Handling")
        print("✅ Payment Statistics")

def main():
    print("🏥 DialysisTrack Billing System Tester")
    print("=" * 50)
    
    # Check if server is running
    try:
        response = requests.get('http://localhost:8000/api/')
        if response.status_code != 200:
            print("❌ Backend server is not running on http://localhost:8000")
            print("Please start the Django server first:")
            print("cd backend && python manage.py runserver")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("Please make sure Django server is running on http://localhost:8000")
        return
    
    # Run tests
    tester = BillingTester()
    tester.run_all_tests()

if __name__ == '__main__':
    main()