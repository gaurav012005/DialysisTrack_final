from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from .models import Patient
from .serializers import PatientSerializer
from users.permissions import HospitalRolePermission

User = get_user_model()

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [HospitalRolePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'is_emergency', 'is_active', 'blood_type']
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
    
    def perform_create(self, serializer):
        patient = serializer.save()
        
        # Check if frontend explicitly requested user account creation
        create_account = self.request.data.get('create_user_account', False)
        user_password = self.request.data.get('user_password', None)
        
        # Create user account if explicitly requested and password provided
        if create_account and patient.email and user_password and not patient.user:
            username = patient.email  # Use email as username
            
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
                # User might already exist, log but don't fail
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