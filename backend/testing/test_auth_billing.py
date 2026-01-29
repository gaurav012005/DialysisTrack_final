import requests
import json

def test_authenticated_billing():
    base_url = 'http://localhost:8000'
    
    print("Authenticated Billing Test")
    print("=" * 30)
    
    # Step 1: Login
    print("\n1. Logging in...")
    login_data = {
        'email': 'admin@test.com',
        'password': 'admin123'
    }
    
    try:
        response = requests.post(f'{base_url}/api/auth/login/', json=login_data)
        if response.status_code == 200:
            token = response.json()['access']
            print("   SUCCESS: Login successful")
        else:
            print(f"   ERROR: Login failed - {response.text}")
            return
    except Exception as e:
        print(f"   ERROR: Login error - {str(e)}")
        return
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Step 2: Get bills
    print("\n2. Getting bills...")
    try:
        response = requests.get(f'{base_url}/api/billing/bills/', headers=headers)
        if response.status_code == 200:
            bills = response.json()
            bill_count = len(bills.get('results', bills))
            print(f"   SUCCESS: Found {bill_count} bills")
            
            if bill_count > 0:
                test_bill = bills.get('results', bills)[0]
                print(f"   Test Bill: {test_bill['bill_number']} - Rs{test_bill['total_amount']}")
                return test_bill, headers
        else:
            print(f"   ERROR: Failed to get bills - {response.text}")
    except Exception as e:
        print(f"   ERROR: Bills error - {str(e)}")
    
    return None, headers

def test_payment_processing(bill, headers):
    base_url = 'http://localhost:8000'
    
    if not bill:
        print("No bill available for payment testing")
        return
    
    print(f"\n3. Testing payments for Bill {bill['bill_number']}...")
    
    # Test UPI Payment
    print("\n   Testing UPI Payment...")
    upi_data = {
        'bill_id': bill['id'],
        'amount': 1000.00,
        'upi_id': 'test@paytm'
    }
    
    try:
        response = requests.post(
            f'{base_url}/api/billing/payments/process_upi_payment/',
            json=upi_data,
            headers=headers
        )
        if response.status_code == 201:
            result = response.json()
            print(f"   SUCCESS: UPI Payment - {result['transaction_id']}")
        else:
            print(f"   ERROR: UPI Payment failed - {response.text}")
    except Exception as e:
        print(f"   ERROR: UPI Payment error - {str(e)}")
    
    # Test Card Payment
    print("\n   Testing Card Payment...")
    card_data = {
        'bill_id': bill['id'],
        'amount': 500.00,
        'card_last_four': '1234',
        'bank_name': 'HDFC Bank',
        'card_type': 'DEBIT'
    }
    
    try:
        response = requests.post(
            f'{base_url}/api/billing/payments/process_card_payment/',
            json=card_data,
            headers=headers
        )
        if response.status_code == 201:
            result = response.json()
            print(f"   SUCCESS: Card Payment - {result['transaction_id']}")
        else:
            print(f"   ERROR: Card Payment failed - {response.text}")
    except Exception as e:
        print(f"   ERROR: Card Payment error - {str(e)}")
    
    # Test Cash Payment
    print("\n   Testing Cash Payment...")
    cash_data = {
        'bill_id': bill['id'],
        'amount': 300.00,
        'notes': 'Cash payment at counter'
    }
    
    try:
        response = requests.post(
            f'{base_url}/api/billing/payments/process_cash_payment/',
            json=cash_data,
            headers=headers
        )
        if response.status_code == 201:
            result = response.json()
            print(f"   SUCCESS: Cash Payment - {result['transaction_id']}")
        else:
            print(f"   ERROR: Cash Payment failed - {response.text}")
    except Exception as e:
        print(f"   ERROR: Cash Payment error - {str(e)}")

def test_dashboard_stats(headers):
    base_url = 'http://localhost:8000'
    
    print("\n4. Testing Dashboard Stats...")
    try:
        response = requests.get(f'{base_url}/api/billing/bills/dashboard_stats/', headers=headers)
        if response.status_code == 200:
            stats = response.json()
            print("   SUCCESS: Dashboard Stats:")
            print(f"   - Pending: Rs{stats.get('total_pending', 0)}")
            print(f"   - Today Collections: Rs{stats.get('today_collections', 0)}")
            print(f"   - Monthly Collections: Rs{stats.get('monthly_collections', 0)}")
        else:
            print(f"   ERROR: Dashboard stats failed - {response.text}")
    except Exception as e:
        print(f"   ERROR: Dashboard stats error - {str(e)}")

def main():
    print("Testing DialysisTrack Billing System with Authentication")
    print("=" * 55)
    
    # Test authentication and get bills
    bill, headers = test_authenticated_billing()
    
    # Test payment processing
    if bill and headers:
        test_payment_processing(bill, headers)
        test_dashboard_stats(headers)
    
    print("\n" + "=" * 55)
    print("Billing System Authentication Test Complete!")
    print("\nAll payment methods tested:")
    print("- UPI Payment Processing")
    print("- Card Payment Processing") 
    print("- Cash Payment Processing")
    print("- Dashboard Statistics")

if __name__ == '__main__':
    main()