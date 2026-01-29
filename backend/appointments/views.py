from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from datetime import date, timedelta
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentCreateSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'shift', 'appointment_date']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__patient_id']
    ordering_fields = ['appointment_date', 'scheduled_time', 'created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AppointmentCreateSerializer
        return AppointmentSerializer
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'checked_in'
        appointment.save()
        return Response({'status': 'checked_in'})
    
    @action(detail=True, methods=['post'])
    def start_session(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'in_progress'
        appointment.save()
        return Response({'status': 'in_progress'})
    
    @action(detail=True, methods=['post'])
    def complete_session(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'completed'
        appointment.save()
        return Response({'status': 'completed'})
    
    @action(detail=False, methods=['get'])
    def today_appointments(self, request):
        today = date.today()
        appointments = Appointment.objects.filter(appointment_date=today)
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming_appointments(self, request):
        today = date.today()
        next_week = today + timedelta(days=7)
        appointments = Appointment.objects.filter(
            appointment_date__range=[today, next_week],
            status='scheduled'
        )
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_appointments(self, request):
        """Get appointments for the currently logged-in patient"""
        user = request.user
        
        # Try to find appointments by matching patient's user or email
        from patients.models import Patient
        try:
            # First try to find patient by user
            patient = Patient.objects.filter(Q(user=user) | Q(email=user.email)).first()
            
            if patient:
                appointments = Appointment.objects.filter(patient=patient).order_by('-appointment_date', '-scheduled_time')
                serializer = self.get_serializer(appointments, many=True)
                return Response(serializer.data)
            else:
                # No patient record found for this user
                return Response([], status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)