from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from .models import Patient, DialysisPrescription, LabResult
from .serializers import PatientSerializer, DialysisPrescriptionSerializer, LabResultSerializer
from users.permissions import HospitalRolePermission

User = get_user_model()

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [HospitalRolePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'is_emergency', 'is_active', 'blood_type', 'hepatitis_b_status', 'hepatitis_c_status', 'hiv_status']
    search_fields = ['first_name', 'last_name', 'patient_id', 'phone_number']
    ordering_fields = ['created_at', 'first_name', 'last_name']
    app_name = 'patients'
    
    def get_queryset(self):
        """Filter patients based on user role"""
        user = self.request.user
        queryset = Patient.objects.all()
        
        # Patients can only see their own records
        if user.role == 'patient':
            queryset = queryset.filter(user=user)
        # Medical staff and admin can see all patients
        elif user.role in ['admin', 'doctor', 'nurse', 'receptionist']:
            queryset = queryset.all()
        # Technicians can see basic patient info
        elif user.role == 'technician':
            queryset = queryset.all()
            
        return queryset
    
    def perform_destroy(self, instance):
        """DIALYSIS HEAD RULE: Never hard-delete patient records.
        
        Medical records must be retained for 5-10 years by law.
        Instead of deleting, we soft-delete by marking as inactive.
        """
        from dialysis_queue.models import Queue
        active_sessions = Queue.objects.filter(
            patient=instance,
            status__in=['waiting', 'in_progress']
        ).exists()
        
        if active_sessions:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                'Cannot deactivate patient with active queue entries or ongoing sessions. '
                'Please complete or cancel all active sessions first.'
            )
        
        from billing.models import Bill
        pending_bills = Bill.objects.filter(
            patient=instance,
            status__in=['pending', 'overdue']
        ).exists()
        
        if pending_bills:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                'Cannot deactivate patient with pending/overdue bills. '
                'Please settle all outstanding bills first.'
            )
        
        instance.is_active = False
        instance.save()
        
        if instance.user:
            instance.user.is_active = False
            instance.user.save()
    
    def perform_create(self, serializer):
        patient = serializer.save()
        
        # Check if frontend explicitly requested user account creation
        create_account = self.request.data.get('create_user_account', False)
        user_password = self.request.data.get('user_password', None)
        
        if create_account and patient.email and user_password and not patient.user:
            username = patient.email
            
            try:
                user = User.objects.create_user(
                    username=username,
                    email=patient.email,
                    password=user_password,
                    first_name=patient.first_name,
                    last_name=patient.last_name,
                    role='patient',
                    phone_number=patient.phone_number
                )
                patient.user = user
                patient.save()
            except Exception as e:
                print(f"Could not create user account for patient: {e}")
    
    @action(detail=True, methods=['post'])
    def toggle_emergency(self, request, pk=None):
        """Only medical staff can toggle emergency status"""
        if request.user.role not in ['admin', 'doctor', 'nurse']:
            return Response({'error': 'Permission denied'}, status=403)
            
        patient = self.get_object()
        patient.is_emergency = not patient.is_emergency
        patient.save()
        return Response({'emergency_status': patient.is_emergency})
    
    @action(detail=False, methods=['get'])
    def emergency_cases(self, request):
        """Get emergency patients - medical staff only"""
        if request.user.role not in ['admin', 'doctor', 'nurse']:
            return Response({'error': 'Permission denied'}, status=403)
            
        emergency_patients = self.get_queryset().filter(is_emergency=True, is_active=True)
        serializer = self.get_serializer(emergency_patients, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def infection_positive(self, request):
        """Get patients with positive infection status — for machine segregation planning"""
        if request.user.role not in ['admin', 'doctor', 'nurse', 'technician']:
            return Response({'error': 'Permission denied'}, status=403)
        
        from django.db.models import Q
        positive_patients = self.get_queryset().filter(
            Q(hepatitis_b_status='positive') | 
            Q(hepatitis_c_status='positive') | 
            Q(hiv_status='positive'),
            is_active=True
        )
        serializer = self.get_serializer(positive_patients, many=True)
        return Response({
            'count': positive_patients.count(),
            'patients': serializer.data,
            'note': 'These patients require isolated/dedicated machines for dialysis.'
        })
    
    @action(detail=False, methods=['get'])
    def consent_expired(self, request):
        """Get patients whose consent has expired or is missing"""
        if request.user.role not in ['admin', 'doctor', 'nurse', 'receptionist']:
            return Response({'error': 'Permission denied'}, status=403)
        
        from datetime import date
        from django.db.models import Q
        patients = self.get_queryset().filter(
            Q(consent_given=False) | 
            Q(consent_expiry_date__lt=date.today()),
            is_active=True
        )
        serializer = self.get_serializer(patients, many=True)
        return Response({
            'count': patients.count(),
            'patients': serializer.data,
            'warning': 'These patients need consent renewal before their next dialysis session.'
        })
    
    @action(detail=False, methods=['get'])
    def screening_overdue(self, request):
        """Get patients whose infection screening is overdue (>3 months)"""
        if request.user.role not in ['admin', 'doctor', 'nurse']:
            return Response({'error': 'Permission denied'}, status=403)
        
        from datetime import date, timedelta
        from django.db.models import Q
        three_months_ago = date.today() - timedelta(days=90)
        
        patients = self.get_queryset().filter(
            Q(last_infection_screening_date__lt=three_months_ago) |
            Q(last_infection_screening_date__isnull=True),
            is_active=True
        )
        serializer = self.get_serializer(patients, many=True)
        return Response({
            'count': patients.count(),
            'patients': serializer.data,
            'warning': 'These patients need Hep B/C/HIV screening (overdue >3 months).'
        })


class DialysisPrescriptionViewSet(viewsets.ModelViewSet):
    """Manage dialysis prescriptions — Doctors only can create/modify."""
    queryset = DialysisPrescription.objects.all()
    serializer_class = DialysisPrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['patient', 'is_active', 'frequency', 'dialyzer_type']
    ordering_fields = ['created_at', 'effective_date']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role == 'patient':
            queryset = queryset.filter(patient__user=user)
        return queryset
    
    def create(self, request, *args, **kwargs):
        if request.user.role not in ['admin', 'doctor']:
            return Response(
                {'error': 'Only doctors can create dialysis prescriptions.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        serializer.save(prescribed_by=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='patient/(?P<patient_id>[^/.]+)/active')
    def active_prescription(self, request, patient_id=None):
        """Get patient's current active prescription"""
        prescription = self.get_queryset().filter(
            patient_id=patient_id, is_active=True
        ).first()
        if prescription:
            serializer = self.get_serializer(prescription)
            return Response(serializer.data)
        return Response(
            {'error': 'No active prescription found. Doctor must create one before dialysis.'},
            status=status.HTTP_404_NOT_FOUND
        )


class LabResultViewSet(viewsets.ModelViewSet):
    """Manage lab results — Doctors and nurses can add results."""
    queryset = LabResult.objects.all()
    serializer_class = LabResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['patient', 'is_critical', 'test_date']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__patient_id']
    ordering_fields = ['test_date', 'created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role == 'patient':
            queryset = queryset.filter(patient__user=user)
        return queryset
    
    def create(self, request, *args, **kwargs):
        if request.user.role not in ['admin', 'doctor', 'nurse']:
            return Response(
                {'error': 'Only doctors and nurses can add lab results.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        lab = serializer.save(ordered_by=self.request.user)
        
        # Auto-update patient infection status from screening results
        if lab.hbsag or lab.anti_hcv or lab.hiv:
            patient = lab.patient
            if lab.hbsag:
                patient.hepatitis_b_status = 'positive' if lab.hbsag.lower() in ['positive', 'reactive', '+'] else 'negative'
            if lab.anti_hcv:
                patient.hepatitis_c_status = 'positive' if lab.anti_hcv.lower() in ['positive', 'reactive', '+'] else 'negative'
            if lab.hiv:
                patient.hiv_status = 'positive' if lab.hiv.lower() in ['positive', 'reactive', '+'] else 'negative'
            patient.last_infection_screening_date = lab.test_date
            patient.save()
        
        # Notify doctor if critical results
        if lab.is_critical:
            from notifications.views import create_notification
            # Notify all doctors
            from users.models import User
            doctors = User.objects.filter(role='doctor', is_active=True)
            for doctor in doctors:
                create_notification(
                    user=doctor,
                    notification_type='general',
                    title='⚠️ CRITICAL Lab Result',
                    message=f'Patient {lab.patient.first_name} {lab.patient.last_name} has critical lab values. '
                            f'{"K+: " + str(lab.serum_potassium) + " mEq/L (HIGH)" if lab.is_potassium_critical else ""}'
                            f'{"Hb: " + str(lab.hemoglobin) + " g/dL (LOW)" if lab.is_hemoglobin_low else ""}'
                )
    
    @action(detail=False, methods=['get'], url_path='patient/(?P<patient_id>[^/.]+)/history')
    def patient_lab_history(self, request, patient_id=None):
        """Get all lab results for a specific patient with trend data"""
        results = self.get_queryset().filter(patient_id=patient_id).order_by('-test_date')
        serializer = self.get_serializer(results, many=True)
        
        # Calculate trend summary
        latest = results.first()
        trend_data = {
            'total_results': results.count(),
            'latest_date': latest.test_date if latest else None,
            'latest_hemoglobin': float(latest.hemoglobin) if latest and latest.hemoglobin else None,
            'latest_potassium': float(latest.serum_potassium) if latest and latest.serum_potassium else None,
            'latest_urr': latest.urr if latest else None,
            'latest_ktv': latest.ktv_estimated if latest else None,
        }
        
        return Response({
            'trend_summary': trend_data,
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def critical_alerts(self, request):
        """Get all critical lab results that need attention"""
        if request.user.role not in ['admin', 'doctor', 'nurse']:
            return Response({'error': 'Permission denied'}, status=403)
        
        critical = self.get_queryset().filter(is_critical=True).order_by('-test_date')[:20]
        serializer = self.get_serializer(critical, many=True)
        return Response(serializer.data)