import logging

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from datetime import datetime
from decimal import Decimal, InvalidOperation
import uuid

from .models import Bill, Payment
from patients.models import Patient

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def simple_cash_payment(request):
    """Simple payment (cash or UPI) - authentication required"""
    try:
        # Get data
        patient_id = request.data.get('patient_id')
        payment_method = request.data.get('payment_method', 'cash')
        upi_id = request.data.get('upi_id', '')
        notes = request.data.get('notes', f'Walk-in {payment_method} payment')

        if not patient_id:
            return Response({
                'success': False,
                'error': 'Patient ID is required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate payment method
        if payment_method not in ('cash', 'upi', 'razorpay', 'Online'):
            return Response({
                'success': False,
                'error': 'Invalid payment method. Use cash, upi, or razorpay.'
            }, status=status.HTTP_400_BAD_REQUEST)
        # Normalise legacy "Online" to "razorpay"
        if payment_method == 'Online':
            payment_method = 'razorpay'

        try:
            amount = Decimal(str(request.data.get('amount', 0)))
        except (InvalidOperation, ValueError):
            return Response({
                'success': False,
                'error': 'Invalid amount format.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({
                'success': False,
                'error': 'Amount must be greater than zero.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get patient
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Patient not found. Please add patient first.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create bill and payment in one transaction
        with transaction.atomic():
            # Create bill
            prefix = 'UPI' if payment_method == 'upi' else 'CASH'
            bill_number = f"{prefix}{datetime.now().strftime('%Y%m%d%H%M%S')}"
            bill = Bill.objects.create(
                patient=patient,
                bill_number=bill_number,
                total_amount=amount,
                paid_amount=amount,
                status='paid',
                due_date=datetime.now().date(),
                dialysis_sessions=0,
                session_cost=Decimal('0'),
                medicine_cost=Decimal('0'),
                consultation_cost=Decimal('0'),
                other_charges=amount,
                discount=Decimal('0')
            )
            
            # Create payment
            import random
            import string
            rand_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
            txn_prefix = 'UPI' if payment_method == 'upi' else 'CSH'
            transaction_id = f"{txn_prefix}{datetime.now().strftime('%Y%m%d%H%M%S')}{rand_suffix}"
            payment = Payment.objects.create(
                bill=bill,
                amount=amount,
                payment_method=payment_method,
                status='completed',
                transaction_id=transaction_id,
                upi_id=upi_id if payment_method == 'upi' else None,
                notes=notes,
                processed_by=request.user,
                gateway_response={
                    'status': 'SUCCESS',
                    'method': payment_method,
                    'upi_id': upi_id if payment_method == 'upi' else None,
                    'received_by': request.user.get_full_name() or request.user.username,
                    'timestamp': datetime.now().isoformat()
                }
            )
        
        return Response({
            'success': True,
            'message': f'{payment_method.upper()} payment recorded successfully',
            'transaction_id': transaction_id,
            'bill_number': bill_number,
            'patient_name': f"{patient.first_name} {patient.last_name}",
            'amount': float(amount),
            'payment_method': payment_method
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.exception('Simple cash payment error')
        return Response({
            'success': False,
            'error': 'An unexpected error occurred while processing payment.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
