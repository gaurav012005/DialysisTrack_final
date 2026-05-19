"""
Razorpay API Endpoints
======================
Three endpoints for the full Razorpay payment lifecycle:

1. POST /api/billing/razorpay/create-order/
   → Frontend calls BEFORE opening checkout modal.
   → Returns order_id + key_id for the Razorpay SDK.

2. POST /api/billing/razorpay/verify/
   → Frontend calls AFTER user completes payment in the modal.
   → Verifies HMAC signature, records Payment in DB, updates Bill status.

3. GET  /api/billing/razorpay/config/
   → Returns public key + test-mode flag (used by frontend to decide UI).
"""

import logging
import uuid
from datetime import datetime
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from patients.models import Patient
from notifications.views import create_notification
from .models import Bill, Payment
from .services import PaymentService
from .razorpay_service import create_razorpay_order, verify_razorpay_payment

logger = logging.getLogger(__name__)


# ─── 1. Create Order ─────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def razorpay_create_order_view(request):
    """
    Create a Razorpay order so the frontend can open the checkout modal.

    Body:
        amount      (float)  – Amount in INR  (required, > 0)
        bill_id     (int)    – Existing bill ID  (optional)
        patient_id  (int)    – Patient ID for walk-in  (optional)
        notes       (str)    – Extra notes  (optional)
    """
    try:
        amount = float(request.data.get('amount', 0))
        bill_id = request.data.get('bill_id')
        patient_id = request.data.get('patient_id')
        notes = request.data.get('notes', '')

        if amount <= 0:
            return Response(
                {'success': False, 'error': 'Amount must be greater than zero'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Resolve bill / patient names for Razorpay receipt
        bill_number = f"RZP{datetime.now().strftime('%Y%m%d%H%M%S')}"
        patient_name = 'Walk-in Patient'

        if bill_id:
            try:
                bill = Bill.objects.get(id=bill_id)
                bill_number = bill.bill_number
                patient_name = f"{bill.patient.first_name} {bill.patient.last_name}"
            except Bill.DoesNotExist:
                pass
        elif patient_id:
            try:
                patient = Patient.objects.get(id=patient_id)
                patient_name = f"{patient.first_name} {patient.last_name}"
            except Patient.DoesNotExist:
                pass

        # Call Razorpay API
        result = create_razorpay_order(amount, bill_number, patient_name, notes)

        if result['success']:
            return Response({
                'success': True,
                'order_id': result['order_id'],
                'amount': result['amount'],          # in paise
                'currency': result['currency'],
                'key_id': result['key_id'],
                'bill_number': bill_number,
                'patient_name': patient_name,
                'test_mode': settings.RAZORPAY_TEST_MODE,
            })
        else:
            return Response(
                {'success': False, 'error': result.get('error', 'Order creation failed')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except Exception as e:
        logger.exception("razorpay_create_order_view error")
        return Response(
            {'success': False, 'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ─── 2. Verify Payment ───────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def razorpay_verify_payment_view(request):
    """
    Verify a completed Razorpay payment and record it in the database.

    Body (all required):
        razorpay_payment_id  (str)
        razorpay_order_id    (str)
        razorpay_signature   (str)
        amount               (float)  – Original amount in INR
    Optional:
        bill_id      (int)
        patient_id   (int)
        notes        (str)
    """
    try:
        rp_payment_id = request.data.get('razorpay_payment_id', '')
        rp_order_id = request.data.get('razorpay_order_id', '')
        rp_signature = request.data.get('razorpay_signature', '')
        amount = float(request.data.get('amount', 0))
        bill_id = request.data.get('bill_id')
        patient_id = request.data.get('patient_id')
        notes = request.data.get('notes', '')
        # 'upi' or 'razorpay' — sent by frontend to record the sub-method
        payment_sub_method = request.data.get('payment_sub_method', 'razorpay')

        # ── Validate required fields ────────────────────────────────────
        if not all([rp_payment_id, rp_order_id, rp_signature]):
            return Response(
                {'success': False, 'error': 'Missing Razorpay payment details (payment_id, order_id, signature)'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if amount <= 0:
            return Response(
                {'success': False, 'error': 'Invalid amount'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Verify HMAC signature ───────────────────────────────────────
        verification = verify_razorpay_payment(rp_order_id, rp_payment_id, rp_signature)
        if not verification['success']:
            return Response(
                {'success': False, 'error': verification.get('error', 'Verification failed')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Signature valid → record in DB ──────────────────────────────
        with transaction.atomic():
            # Resolve or create Bill
            if bill_id:
                try:
                    bill = Bill.objects.get(id=bill_id)
                except Bill.DoesNotExist:
                    return Response(
                        {'success': False, 'error': 'Bill not found'},
                        status=status.HTTP_404_NOT_FOUND,
                    )
            else:
                # Walk-in → create a new bill
                if not patient_id:
                    return Response(
                        {'success': False, 'error': 'Either bill_id or patient_id is required'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                patient = Patient.objects.get(id=patient_id)
                bill = Bill.objects.create(
                    patient=patient,
                    bill_number=f"RZP{datetime.now().strftime('%Y%m%d%H%M%S')}",
                    total_amount=Decimal(str(amount)),
                    paid_amount=Decimal('0'),
                    status='pending',
                    due_date=datetime.now().date(),
                    dialysis_sessions=0,
                    session_cost=Decimal('0'),
                    medicine_cost=Decimal('0'),
                    consultation_cost=Decimal('0'),
                    other_charges=Decimal(str(amount)),
                    discount=Decimal('0'),
                )

            # Create Payment record
            txn_id = f"RZP{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:4].upper()}"
            # UPI via Razorpay has 0% fee; card/netbanking is 1.8%
            fee = round(amount * (0.0 if payment_sub_method == 'upi' else 0.018), 2)
            method_label = 'UPI / QR (Razorpay)' if payment_sub_method == 'upi' else 'Online Payment (Razorpay)'

            payment = Payment.objects.create(
                bill=bill,
                amount=Decimal(str(amount)),
                payment_method='razorpay',   # always 'razorpay' in DB
                status='completed',
                transaction_id=txn_id,
                razorpay_order_id=rp_order_id,
                razorpay_payment_id=rp_payment_id,
                razorpay_signature=rp_signature,
                processing_fee=Decimal(str(fee)),
                processed_by=request.user,
                notes=f"{method_label} Payment. {notes}".strip(),
                gateway_response={
                    'status': 'SUCCESS',
                    'razorpay_payment_id': rp_payment_id,
                    'razorpay_order_id': rp_order_id,
                    'method': payment_sub_method,   # 'upi' or 'razorpay'
                    'test_mode': settings.RAZORPAY_TEST_MODE,
                    'verified': True,
                    'timestamp': datetime.now().isoformat(),
                },
            )

            # Update bill paid amount + status
            PaymentService.update_bill_status(bill)

            # Notification
            if hasattr(bill.patient, 'user') and bill.patient.user:
                create_notification(
                    user=bill.patient.user,
                    notification_type='payment_received',
                    title='Payment Received',
                    message=(
                        f"Payment of Rs.{amount:.2f} received via {method_label}. "
                        f"Transaction: {rp_payment_id}. Bill: {bill.bill_number}."
                    ),
                )

        return Response({
            'success': True,
            'message': 'Payment verified and recorded successfully',
            'transaction_id': rp_payment_id,
            'internal_txn_id': txn_id,
            'bill_number': bill.bill_number,
            'bill_id': bill.id,
            'patient_name': f"{bill.patient.first_name} {bill.patient.last_name}",
            'amount': float(amount),
            'fee': fee,
            'payment_method': payment_sub_method,   # 'upi' or 'razorpay'
        }, status=status.HTTP_201_CREATED)

    except Patient.DoesNotExist:
        return Response(
            {'success': False, 'error': 'Patient not found'},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger.exception("razorpay_verify_payment_view error")
        return Response(
            {'success': False, 'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ─── 3. Config (public key for frontend) ─────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def razorpay_config_view(request):
    """Return the public Razorpay key + test-mode flag to the frontend."""
    return Response({
        'key_id': settings.RAZORPAY_KEY_ID,
        'test_mode': settings.RAZORPAY_TEST_MODE,
        'hospital_name': 'DialysisTrack Hospital',
    })
