from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from datetime import datetime
from decimal import Decimal
import uuid

from .models import Bill, Payment
from patients.models import Patient


@api_view(['POST'])
@permission_classes([AllowAny])
def simple_cash_payment(request):
    """Simple cash payment - no authentication required"""
    try:
        # Get data
        patient_id = request.data.get('patient_id', 1)
        amount = Decimal(str(request.data.get('amount', 0)))
        notes = request.data.get('notes', 'Walk-in cash payment')
        
        # Get or create patient
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
            bill_number = f"CASH{datetime.now().strftime('%Y%m%d%H%M%S')}"
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
            transaction_id = f"CSH{datetime.now().strftime('%Y%m%d%H%M%S')}{str(uuid.uuid4())[:4].upper()}"
            payment = Payment.objects.create(
                bill=bill,
                amount=amount,
                payment_method='cash',
                status='completed',
                transaction_id=transaction_id,
                notes=notes,
                processed_by=None,
                gateway_response={
                    'status': 'SUCCESS',
                    'received_by': 'Reception',
                    'timestamp': datetime.now().isoformat()
                }
            )
        
        return Response({
            'success': True,
            'message': 'Cash payment recorded successfully',
            'transaction_id': transaction_id,
            'bill_number': bill_number,
            'patient_name': f"{patient.first_name} {patient.last_name}",
            'amount': float(amount)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
