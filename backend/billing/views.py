from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.db import transaction
from datetime import datetime, timedelta
from .models import Bill, Payment, InsuranceProvider, PatientInsurance
from .serializers import (
    BillSerializer, PaymentSerializer, InsuranceProviderSerializer,
    PatientInsuranceSerializer, PaymentCreateSerializer
)
from .services import PaymentService
from .upi_qr import UPIQRCodeGenerator, HOSPITAL_UPI_ID, HOSPITAL_NAME

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    
    def get_queryset(self):
        queryset = Bill.objects.all()
        status_filter = self.request.query_params.get('status', None)
        patient_id = self.request.query_params.get('patient', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get billing dashboard statistics"""
        today = datetime.now().date()
        
        stats = {
            'total_pending': Bill.objects.filter(status='pending').aggregate(
                total=Sum('total_amount'))['total'] or 0,
            'total_overdue': Bill.objects.filter(
                status='overdue', due_date__lt=today).aggregate(
                total=Sum('total_amount'))['total'] or 0,
            'today_collections': Payment.objects.filter(
                payment_date__date=today, status='completed').aggregate(
                total=Sum('amount'))['total'] or 0,
            'monthly_collections': Payment.objects.filter(
                payment_date__month=today.month, 
                payment_date__year=today.year,
                status='completed').aggregate(total=Sum('amount'))['total'] or 0,
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def generate_receipt(self, request, pk=None):
        """Generate receipt for a bill"""
        bill = self.get_object()
        receipt_data = {
            'bill_number': bill.bill_number,
            'patient_name': bill.patient.name,
            'total_amount': bill.total_amount,
            'paid_amount': bill.paid_amount,
            'balance': bill.total_amount - bill.paid_amount,
            'payments': PaymentSerializer(bill.payments.filter(status='completed'), many=True).data
        }
        return Response(receipt_data)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    @action(detail=False, methods=['post'])
    def quick_payment(self, request):
        """Quick payment for walk-in patients - creates bill and processes payment"""
        try:
            from patients.models import Patient
            
            patient_id = request.data.get('patient_id')
            amount = float(request.data.get('amount', 0))
            payment_method = request.data.get('payment_method', 'cash')
            notes = request.data.get('notes', '')
            upi_id = request.data.get('upi_id', '')
            
            if not patient_id:
                return Response({'error': 'Patient ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            if amount <= 0:
                return Response({'error': 'Amount must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)
            
            patient = Patient.objects.get(id=patient_id)
            
            with transaction.atomic():
                # Create bill
                bill = Bill.objects.create(
                    patient=patient,
                    bill_number=f"QP{datetime.now().strftime('%Y%m%d%H%M%S')}",
                    total_amount=amount,
                    paid_amount=0,
                    status='pending',
                    description=notes or 'Quick Payment'
                )
                
                # Process payment
                if payment_method == 'cash':
                    result = PaymentService.process_cash_payment(bill, amount, request.user, notes)
                elif payment_method == 'upi':
                    result = PaymentService.process_upi_payment(bill, amount, upi_id, request.user)
                else:
                    return Response({'error': 'Invalid payment method'}, status=status.HTTP_400_BAD_REQUEST)
                
                if result['success']:
                    result['bill_id'] = bill.id
                    result['bill_number'] = bill.bill_number
                    result['patient_name'] = patient.name
                    return Response(result, status=status.HTTP_201_CREATED)
                else:
                    return Response(result, status=status.HTTP_400_BAD_REQUEST)
                    
        except Patient.DoesNotExist:
            return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def process_upi_payment(self, request):
        """Process UPI payment"""
        try:
            bill_id = request.data.get('bill_id')
            amount = float(request.data.get('amount', 0))
            upi_id = request.data.get('upi_id')
            
            if amount <= 0:
                return Response({'error': 'Amount must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)
            
            bill = Bill.objects.get(id=bill_id)
            
            result = PaymentService.process_upi_payment(bill, amount, upi_id, request.user)
            
            if result['success']:
                return Response(result, status=status.HTTP_201_CREATED)
            else:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
                
        except Bill.DoesNotExist:
            return Response({'error': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def generate_qr_code(self, request):
        """Generate UPI QR code for payment"""
        try:
            amount = float(request.data.get('amount', 0))
            bill_number = request.data.get('bill_number', 'PAYMENT')
            
            # Generate QR code
            qr_code_base64 = UPIQRCodeGenerator.generate_qr_code_base64(
                upi_id=HOSPITAL_UPI_ID,
                name=HOSPITAL_NAME,
                amount=amount,
                transaction_note=f"Bill: {bill_number}"
            )
            
            return Response({
                'success': True,
                'qr_code': qr_code_base64,
                'upi_id': HOSPITAL_UPI_ID,
                'amount': amount,
                'hospital_name': HOSPITAL_NAME
            })
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def process_card_payment(self, request):
        """Process card payment"""
        try:
            bill_id = request.data.get('bill_id')
            amount = float(request.data.get('amount', 0))
            card_data = {
                'last_four': request.data.get('card_last_four'),
                'bank_name': request.data.get('bank_name'),
                'card_type': request.data.get('card_type', 'DEBIT')
            }
            
            bill = Bill.objects.get(id=bill_id)
            
            if amount <= 0:
                return Response({'error': 'Amount must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)
            
            result = PaymentService.process_card_payment(bill, amount, card_data, request.user)
            
            if result['success']:
                return Response(result, status=status.HTTP_201_CREATED)
            else:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
                
        except Bill.DoesNotExist:
            return Response({'error': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def process_netbanking_payment(self, request):
        """Process net banking payment"""
        try:
            bill_id = request.data.get('bill_id')
            amount = float(request.data.get('amount', 0))
            bank_code = request.data.get('bank_code')
            
            bill = Bill.objects.get(id=bill_id)
            
            if amount <= 0:
                return Response({'error': 'Amount must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)
            
            result = PaymentService.process_netbanking_payment(bill, amount, bank_code, request.user)
            
            if result['success']:
                return Response(result, status=status.HTTP_201_CREATED)
            else:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
                
        except Bill.DoesNotExist:
            return Response({'error': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def process_cash_payment(self, request):
        """Process cash payment"""
        try:
            bill_id = request.data.get('bill_id')
            amount = float(request.data.get('amount', 0))
            notes = request.data.get('notes', '')
            
            if amount <= 0:
                return Response({'error': 'Amount must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)
            
            bill = Bill.objects.get(id=bill_id)
            
            result = PaymentService.process_cash_payment(bill, amount, request.user, notes)
            
            return Response(result, status=status.HTTP_201_CREATED)
                
        except Bill.DoesNotExist:
            return Response({'error': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def generate_receipt(self, request, pk=None):
        """Generate payment receipt"""
        payment = self.get_object()
        receipt_data = PaymentService.generate_receipt(payment)
        return Response(receipt_data)
    
    @action(detail=False, methods=['get'])
    def payment_methods_stats(self, request):
        """Get statistics by payment method"""
        from django.db.models import Count
        
        stats = Payment.objects.filter(status='completed').values('payment_method').annotate(
            count=Count('id'),
            total_amount=Sum('amount')
        ).order_by('-total_amount')
        
        return Response(stats)

class InsuranceProviderViewSet(viewsets.ModelViewSet):
    queryset = InsuranceProvider.objects.filter(is_active=True)
    serializer_class = InsuranceProviderSerializer

class PatientInsuranceViewSet(viewsets.ModelViewSet):
    queryset = PatientInsurance.objects.all()
    serializer_class = PatientInsuranceSerializer
    
    def get_queryset(self):
        queryset = PatientInsurance.objects.all()
        patient_id = self.request.query_params.get('patient', None)
        
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
            
        return queryset