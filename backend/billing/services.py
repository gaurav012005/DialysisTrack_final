import uuid
import hashlib
import hmac
import json
from datetime import datetime, timedelta
from decimal import Decimal
from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from .models import Bill, Payment

class PaymentService:
    """Real-world payment processing service"""
    
    # UPI Payment Simulation
    UPI_PROVIDERS = {
        'phonepe': {'name': 'PhonePe', 'fee': 0.0},
        'gpay': {'name': 'Google Pay', 'fee': 0.0},
        'paytm': {'name': 'Paytm', 'fee': 0.0},
        'bhim': {'name': 'BHIM UPI', 'fee': 0.0},
    }
    
    # Bank Codes for Net Banking
    BANK_CODES = {
        'SBI': 'State Bank of India',
        'HDFC': 'HDFC Bank',
        'ICICI': 'ICICI Bank',
        'AXIS': 'Axis Bank',
        'PNB': 'Punjab National Bank',
        'BOB': 'Bank of Baroda',
        'CANARA': 'Canara Bank',
        'UNION': 'Union Bank of India',
    }
    
    @staticmethod
    def generate_transaction_id(payment_method):
        """Generate unique transaction ID"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_id = str(uuid.uuid4())[:8].upper()
        
        prefixes = {
            'upi': 'UPI',
            'card': 'CRD',
            'netbanking': 'NBK',
            'neft': 'NFT',
            'rtgs': 'RTG',
            'cash': 'CSH',
            'cheque': 'CHQ'
        }
        
        prefix = prefixes.get(payment_method, 'PAY')
        return f"{prefix}{timestamp}{random_id}"
    
    @staticmethod
    def validate_upi_id(upi_id):
        """Validate UPI ID format"""
        if not upi_id or '@' not in upi_id:
            return False
        
        parts = upi_id.split('@')
        if len(parts) != 2:
            return False
        
        username, provider = parts
        valid_providers = ['paytm', 'phonepe', 'gpay', 'bhim', 'ybl', 'ibl', 'axl']
        
        return len(username) >= 3 and provider.lower() in valid_providers
    
    @staticmethod
    def calculate_payment_fee(amount, payment_method):
        """Calculate payment processing fee"""
        fees = {
            'cash': 0.0,
            'upi': 0.0,  # Free for amounts < 2000
            'card': amount * 0.018,  # 1.8% for cards
            'netbanking': 5.0 if amount < 1000 else 10.0,
            'neft': 2.5,
            'rtgs': 25.0 if amount < 200000 else 50.0,
            'cheque': 0.0
        }
        
        fee = fees.get(payment_method, 0.0)
        
        # UPI fee for amounts > 2000
        if payment_method == 'upi' and amount > 2000:
            fee = min(amount * 0.005, 15.0)  # 0.5% max ₹15
        
        return round(fee, 2)
    
    @staticmethod
    def process_upi_payment(bill, amount, upi_id, user):
        """Process UPI payment"""
        if not PaymentService.validate_upi_id(upi_id):
            return {'success': False, 'error': 'Invalid UPI ID format'}
        
        # Simulate UPI payment processing
        transaction_id = PaymentService.generate_transaction_id('upi')
        fee = PaymentService.calculate_payment_fee(amount, 'upi')
        
        # Handle anonymous user
        processed_by = user if user.is_authenticated else None
        
        # Create payment record
        with transaction.atomic():
            payment = Payment.objects.create(
                bill=bill,
                amount=amount,
                payment_method='upi',
                status='completed',  # In real world, this would be 'pending' initially
                transaction_id=transaction_id,
                upi_id=upi_id,
                processing_fee=fee,
                processed_by=processed_by,
                gateway_response={
                    'status': 'SUCCESS',
                    'message': 'Payment completed successfully',
                    'provider': upi_id.split('@')[1],
                    'timestamp': datetime.now().isoformat()
                }
            )
            
            # Update bill status
            PaymentService.update_bill_status(bill)
        
        return {
            'success': True,
            'payment_id': payment.payment_id,
            'transaction_id': transaction_id,
            'fee': fee,
            'message': 'UPI payment processed successfully'
        }
    
    @staticmethod
    def process_card_payment(bill, amount, card_data, user):
        """Process card payment"""
        transaction_id = PaymentService.generate_transaction_id('card')
        fee = PaymentService.calculate_payment_fee(amount, 'card')
        
        # Simulate card payment processing
        with transaction.atomic():
            payment = Payment.objects.create(
                bill=bill,
                amount=amount,
                payment_method='card',
                status='completed',
                transaction_id=transaction_id,
                card_last_four=card_data.get('last_four', '****'),
                bank_name=card_data.get('bank_name', ''),
                processing_fee=fee,
                processed_by=user,
                gateway_response={
                    'status': 'SUCCESS',
                    'auth_code': f"AUTH{uuid.uuid4().hex[:6].upper()}",
                    'card_type': card_data.get('card_type', 'DEBIT'),
                    'timestamp': datetime.now().isoformat()
                }
            )
            
            PaymentService.update_bill_status(bill)
        
        return {
            'success': True,
            'payment_id': payment.payment_id,
            'transaction_id': transaction_id,
            'fee': fee,
            'message': 'Card payment processed successfully'
        }
    
    @staticmethod
    def process_netbanking_payment(bill, amount, bank_code, user):
        """Process net banking payment"""
        if bank_code not in PaymentService.BANK_CODES:
            return {'success': False, 'error': 'Invalid bank code'}
        
        transaction_id = PaymentService.generate_transaction_id('netbanking')
        fee = PaymentService.calculate_payment_fee(amount, 'netbanking')
        
        with transaction.atomic():
            payment = Payment.objects.create(
                bill=bill,
                amount=amount,
                payment_method='netbanking',
                status='completed',
                transaction_id=transaction_id,
                bank_name=PaymentService.BANK_CODES[bank_code],
                reference_number=f"NBK{datetime.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:8].upper()}",
                processing_fee=fee,
                processed_by=user,
                gateway_response={
                    'status': 'SUCCESS',
                    'bank_code': bank_code,
                    'timestamp': datetime.now().isoformat()
                }
            )
            
            PaymentService.update_bill_status(bill)
        
        return {
            'success': True,
            'payment_id': payment.payment_id,
            'transaction_id': transaction_id,
            'fee': fee,
            'message': 'Net banking payment processed successfully'
        }
    
    @staticmethod
    def process_cash_payment(bill, amount, user, notes=''):
        """Process cash payment"""
        transaction_id = PaymentService.generate_transaction_id('cash')
        
        # Handle anonymous user
        processed_by = user if user.is_authenticated else None
        user_name = user.get_full_name() if user.is_authenticated else 'Walk-in Staff'
        
        with transaction.atomic():
            payment = Payment.objects.create(
                bill=bill,
                amount=amount,
                payment_method='cash',
                status='completed',
                transaction_id=transaction_id,
                notes=notes,
                processed_by=processed_by,
                gateway_response={
                    'status': 'SUCCESS',
                    'received_by': user_name or 'System',
                    'timestamp': datetime.now().isoformat()
                }
            )
            
            PaymentService.update_bill_status(bill)
        
        return {
            'success': True,
            'payment_id': payment.payment_id,
            'transaction_id': transaction_id,
            'message': 'Cash payment recorded successfully'
        }
    
    @staticmethod
    def update_bill_status(bill):
        """Update bill payment status"""
        total_paid = bill.payments.filter(status='completed').aggregate(
            total=Sum('amount'))['total'] or 0
        
        bill.paid_amount = total_paid
        
        if total_paid >= bill.total_amount:
            bill.status = 'paid'
        elif total_paid > 0:
            bill.status = 'partial'
        else:
            bill.status = 'pending'
        
        bill.save()
    
    @staticmethod
    def generate_receipt(payment):
        """Generate payment receipt data"""
        return {
            'receipt_id': f"RCP{payment.id:06d}",
            'payment_id': payment.payment_id,
            'transaction_id': payment.transaction_id,
            'bill_number': payment.bill.bill_number,
            'patient_name': payment.bill.patient.name,
            'amount': float(payment.amount),
            'payment_method': payment.get_payment_method_display(),
            'payment_date': payment.payment_date.strftime('%d/%m/%Y %I:%M %p'),
            'processed_by': payment.processed_by.get_full_name() if payment.processed_by else 'System',
            'status': payment.status.upper(),
            'fee': float(payment.processing_fee) if hasattr(payment, 'processing_fee') else 0.0
        }