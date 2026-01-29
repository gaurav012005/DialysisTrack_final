from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from datetime import datetime, timedelta
from billing.models import Bill, Payment, InsuranceProvider, PatientInsurance
from billing.services import PaymentService
from patients.models import Patient

User = get_user_model()

class BillingModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        self.patient = Patient.objects.create(
            name='Test Patient',
            age=45,
            gender='M',
            phone='9876543210',
            address='Test Address'
        )

    def test_bill_creation(self):
        """Test bill creation and auto-calculation"""
        bill = Bill.objects.create(
            patient=self.patient,
            dialysis_sessions=2,
            session_cost=Decimal('2500.00'),
            medicine_cost=Decimal('500.00'),
            consultation_cost=Decimal('800.00'),
            other_charges=Decimal('200.00'),
            discount=Decimal('300.00'),
            due_date=datetime.now().date() + timedelta(days=7)
        )
        
        # Test auto-calculations
        expected_subtotal = (2 * 2500) + 500 + 800 + 200  # 6000
        expected_tax = expected_subtotal * 0.18  # 1080
        expected_total = expected_subtotal + expected_tax - 300  # 6780
        
        self.assertEqual(bill.subtotal, expected_subtotal)
        self.assertEqual(bill.tax_amount, expected_tax)
        self.assertEqual(bill.total_amount, expected_total)
        self.assertTrue(bill.bill_number.startswith('DT'))

    def test_payment_creation(self):
        """Test payment creation and bill status update"""
        bill = Bill.objects.create(
            patient=self.patient,
            dialysis_sessions=1,
            session_cost=Decimal('2500.00'),
            due_date=datetime.now().date() + timedelta(days=7)
        )
        
        payment = Payment.objects.create(
            bill=bill,
            amount=Decimal('1000.00'),
            payment_method='upi',
            status='completed',
            upi_id='test@paytm',
            processed_by=self.user
        )
        
        self.assertTrue(payment.payment_id.startswith('PAY'))
        self.assertEqual(payment.bill, bill)

class PaymentServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        self.patient = Patient.objects.create(
            name='Test Patient',
            age=45,
            gender='M',
            phone='9876543210',
            address='Test Address'
        )
        self.bill = Bill.objects.create(
            patient=self.patient,
            dialysis_sessions=1,
            session_cost=Decimal('2500.00'),
            due_date=datetime.now().date() + timedelta(days=7)
        )

    def test_upi_id_validation(self):
        """Test UPI ID validation"""
        valid_upi_ids = [
            'test@paytm',
            'user123@phonepe',
            'example@gpay',
            'user@bhim'
        ]
        
        invalid_upi_ids = [
            'invalid',
            'test@',
            '@paytm',
            'test@invalid'
        ]
        
        for upi_id in valid_upi_ids:
            self.assertTrue(PaymentService.validate_upi_id(upi_id))
        
        for upi_id in invalid_upi_ids:
            self.assertFalse(PaymentService.validate_upi_id(upi_id))

    def test_payment_fee_calculation(self):
        """Test payment fee calculation for different methods"""
        # UPI fees
        self.assertEqual(PaymentService.calculate_payment_fee(1000, 'upi'), 0.0)
        self.assertEqual(PaymentService.calculate_payment_fee(3000, 'upi'), 15.0)
        
        # Card fees (1.8%)
        self.assertEqual(PaymentService.calculate_payment_fee(1000, 'card'), 18.0)
        
        # Net banking fees
        self.assertEqual(PaymentService.calculate_payment_fee(500, 'netbanking'), 5.0)
        self.assertEqual(PaymentService.calculate_payment_fee(1500, 'netbanking'), 10.0)
        
        # Cash (no fee)
        self.assertEqual(PaymentService.calculate_payment_fee(1000, 'cash'), 0.0)

    def test_upi_payment_processing(self):
        """Test UPI payment processing"""
        result = PaymentService.process_upi_payment(
            self.bill, 
            Decimal('1000.00'), 
            'test@paytm', 
            self.user
        )
        
        self.assertTrue(result['success'])
        self.assertIn('payment_id', result)
        self.assertIn('transaction_id', result)
        
        # Check payment was created
        payment = Payment.objects.get(payment_id=result['payment_id'])
        self.assertEqual(payment.amount, Decimal('1000.00'))
        self.assertEqual(payment.payment_method, 'upi')
        self.assertEqual(payment.status, 'completed')

    def test_card_payment_processing(self):
        """Test card payment processing"""
        card_data = {
            'last_four': '1234',
            'bank_name': 'HDFC Bank',
            'card_type': 'DEBIT'
        }
        
        result = PaymentService.process_card_payment(
            self.bill,
            Decimal('2000.00'),
            card_data,
            self.user
        )
        
        self.assertTrue(result['success'])
        
        payment = Payment.objects.get(payment_id=result['payment_id'])
        self.assertEqual(payment.card_last_four, '1234')
        self.assertEqual(payment.bank_name, 'HDFC Bank')

    def test_cash_payment_processing(self):
        """Test cash payment processing"""
        result = PaymentService.process_cash_payment(
            self.bill,
            Decimal('1500.00'),
            self.user,
            'Cash payment at counter'
        )
        
        self.assertTrue(result['success'])
        
        payment = Payment.objects.get(payment_id=result['payment_id'])
        self.assertEqual(payment.payment_method, 'cash')
        self.assertEqual(payment.notes, 'Cash payment at counter')

class BillingAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        self.patient = Patient.objects.create(
            name='Test Patient',
            age=45,
            gender='M',
            phone='9876543210',
            address='Test Address'
        )
        self.client.force_authenticate(user=self.user)

    def test_bill_list_api(self):
        """Test bill list API"""
        Bill.objects.create(
            patient=self.patient,
            dialysis_sessions=1,
            session_cost=Decimal('2500.00'),
            due_date=datetime.now().date() + timedelta(days=7)
        )
        
        url = reverse('bill-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_dashboard_stats_api(self):
        """Test dashboard statistics API"""
        bill = Bill.objects.create(
            patient=self.patient,
            dialysis_sessions=1,
            session_cost=Decimal('2500.00'),
            due_date=datetime.now().date() + timedelta(days=7),
            status='pending'
        )
        
        url = reverse('bill-dashboard-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_pending', response.data)
        self.assertIn('today_collections', response.data)

    def test_upi_payment_api(self):
        """Test UPI payment API"""
        bill = Bill.objects.create(
            patient=self.patient,
            dialysis_sessions=1,
            session_cost=Decimal('2500.00'),
            due_date=datetime.now().date() + timedelta(days=7)
        )
        
        url = reverse('payment-process-upi-payment')
        data = {
            'bill_id': bill.id,
            'amount': 1000.00,
            'upi_id': 'test@paytm'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])

    def test_card_payment_api(self):
        """Test card payment API"""
        bill = Bill.objects.create(
            patient=self.patient,
            dialysis_sessions=1,
            session_cost=Decimal('2500.00'),
            due_date=datetime.now().date() + timedelta(days=7)
        )
        
        url = reverse('payment-process-card-payment')
        data = {
            'bill_id': bill.id,
            'amount': 2000.00,
            'card_last_four': '1234',
            'bank_name': 'HDFC Bank',
            'card_type': 'DEBIT'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])

    def test_invalid_upi_payment(self):
        """Test invalid UPI payment"""
        bill = Bill.objects.create(
            patient=self.patient,
            dialysis_sessions=1,
            session_cost=Decimal('2500.00'),
            due_date=datetime.now().date() + timedelta(days=7)
        )
        
        url = reverse('payment-process-upi-payment')
        data = {
            'bill_id': bill.id,
            'amount': 1000.00,
            'upi_id': 'invalid_upi'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

class InsuranceTests(TestCase):
    def setUp(self):
        self.patient = Patient.objects.create(
            name='Test Patient',
            age=45,
            gender='M',
            phone='9876543210',
            address='Test Address'
        )
        self.provider = InsuranceProvider.objects.create(
            name='Test Insurance',
            policy_prefix='TI',
            contact_number='1800-123-456',
            email='test@insurance.com',
            coverage_percentage=80.00
        )

    def test_insurance_provider_creation(self):
        """Test insurance provider creation"""
        self.assertEqual(self.provider.name, 'Test Insurance')
        self.assertEqual(self.provider.coverage_percentage, 80.00)

    def test_patient_insurance_creation(self):
        """Test patient insurance creation"""
        patient_insurance = PatientInsurance.objects.create(
            patient=self.patient,
            provider=self.provider,
            policy_number='TI123456789',
            coverage_amount=Decimal('500000.00'),
            expiry_date=datetime.now().date() + timedelta(days=365)
        )
        
        self.assertEqual(patient_insurance.patient, self.patient)
        self.assertEqual(patient_insurance.provider, self.provider)
        self.assertEqual(patient_insurance.policy_number, 'TI123456789')