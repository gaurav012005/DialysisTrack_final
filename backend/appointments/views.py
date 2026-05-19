from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from datetime import date, timedelta
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentCreateSerializer
from notifications.views import create_notification, create_audit_log

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

    def _notify_all_staff(self, notification_type, title, message, exclude_user=None):
        """Send a notification to all active staff members."""
        from users.models import User
        staff_roles = ['admin', 'doctor', 'nurse', 'receptionist', 'technician']
        staff_users = User.objects.filter(role__in=staff_roles, is_active=True)
        if exclude_user:
            staff_users = staff_users.exclude(id=exclude_user.id)
        for staff in staff_users:
            create_notification(staff, notification_type, title, message)

    def perform_create(self, serializer):
        """DIALYSIS HEAD RULES: Validate machine conflicts & patient status before creating appointment."""
        patient = serializer.validated_data.get('patient')
        machine_number = serializer.validated_data.get('machine_number', '')
        appt_date = serializer.validated_data.get('appointment_date')
        shift = serializer.validated_data.get('shift')
        
        # === DIALYSIS HEAD FIX: Check patient is active ===
        if patient and not patient.is_active:
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Cannot create appointment for inactive/discharged patient.')
        
        # === DIALYSIS HEAD FIX: Check machine-appointment conflict ===
        if machine_number and appt_date and shift:
            conflict = Appointment.objects.filter(
                machine_number=machine_number,
                appointment_date=appt_date,
                shift=shift,
                status__in=['scheduled', 'checked_in', 'in_progress']
            ).first()
            if conflict:
                from rest_framework.exceptions import ValidationError
                raise ValidationError(
                    f'Machine {machine_number} is already booked for {appt_date} ({shift} shift) '
                    f'by patient {conflict.patient.first_name} {conflict.patient.last_name}. '
                    f'Please choose another machine or time slot.'
                )
        
        appointment = serializer.save(created_by=self.request.user)
        # Notify patient
        if hasattr(appointment.patient, 'user') and appointment.patient.user:
            create_notification(
                appointment.patient.user,
                'appointment_booked',
                'Appointment Confirmed',
                f'Your appointment has been scheduled for {appointment.appointment_date} ({appointment.shift} shift) at {appointment.scheduled_time}.'
            )
        # Notify staff if a machine is already assigned at creation
        if appointment.machine_number:
            self._notify_all_staff(
                'machine_booking',
                'Machine Assigned',
                f'Machine {appointment.machine_number} has been assigned to {appointment.patient} for {appointment.appointment_date} ({appointment.shift} shift).',
                exclude_user=self.request.user
            )
        create_audit_log(self.request.user, 'create', 'appointments',
                         f'Appointment created for {appointment.patient} on {appointment.appointment_date}', self.request)

    def perform_update(self, serializer):
        old_machine = serializer.instance.machine_number
        appointment = serializer.save()
        # Notify staff when a machine gets assigned (or changed)
        new_machine = appointment.machine_number
        if new_machine and new_machine != old_machine:
            self._notify_all_staff(
                'machine_booking',
                'Machine Booking Update',
                f'Machine {new_machine} is now assigned to {appointment.patient} for {appointment.appointment_date} ({appointment.shift} shift). Please update your records if needed.',
                exclude_user=self.request.user
            )
            # Also notify the patient
            if hasattr(appointment.patient, 'user') and appointment.patient.user:
                create_notification(
                    appointment.patient.user,
                    'machine_booking',
                    'Machine Assigned to Your Session',
                    f'Machine {new_machine} has been assigned for your session on {appointment.appointment_date}.'
                )
        create_audit_log(self.request.user, 'update', 'appointments',
                         f'Appointment updated for {appointment.patient}', self.request)
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """DIALYSIS HEAD RULE: Only 'scheduled' appointments can be checked in."""
        appointment = self.get_object()
        
        # === DIALYSIS HEAD FIX: Validate state transition ===
        if appointment.status != 'scheduled':
            return Response(
                {'error': f'Cannot check in. Current status is "{appointment.get_status_display()}". Only scheduled appointments can be checked in.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'checked_in'
        appointment.save()
        if hasattr(appointment.patient, 'user') and appointment.patient.user:
            create_notification(
                appointment.patient.user,
                'appointment_reminder',
                'Checked In Successfully',
                f'You have been checked in for your appointment on {appointment.appointment_date}. Please proceed to the waiting area.'
            )
        create_audit_log(request.user, 'status_change', 'appointments', f'Patient {appointment.patient} checked in', request)
        return Response({'status': 'checked_in'})
    
    @action(detail=True, methods=['post'])
    def start_session(self, request, pk=None):
        """DIALYSIS HEAD RULES: Must be checked in first. Machine must be assigned."""
        appointment = self.get_object()
        
        # === DIALYSIS HEAD FIX: Validate state transition ===
        if appointment.status not in ['checked_in', 'scheduled']:
            return Response(
                {'error': f'Cannot start session. Current status is "{appointment.get_status_display()}". Patient must be checked in first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # === DIALYSIS HEAD FIX: Machine should be assigned before starting ===
        if not appointment.machine_number:
            return Response(
                {'error': 'Cannot start session without a machine assignment. Please assign a machine first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.utils import timezone as tz
        appointment.status = 'in_progress'
        appointment.actual_start_time = tz.now().time()
        appointment.save()
        if hasattr(appointment.patient, 'user') and appointment.patient.user:
            create_notification(
                appointment.patient.user,
                'session_completed',
                'Session Started',
                f'Your dialysis session has started on Machine {appointment.machine_number}. Estimated duration: ~4 hours.'
            )
        create_audit_log(request.user, 'status_change', 'appointments', f'Session started for {appointment.patient}', request)
        return Response({'status': 'in_progress'})
    
    @action(detail=True, methods=['post'])
    def complete_session(self, request, pk=None):
        """DIALYSIS HEAD RULE: Only in-progress sessions can be completed."""
        appointment = self.get_object()
        
        # === DIALYSIS HEAD FIX: Validate state transition ===
        if appointment.status != 'in_progress':
            return Response(
                {'error': f'Cannot complete session. Current status is "{appointment.get_status_display()}". Only in-progress sessions can be completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.utils import timezone as tz
        appointment.status = 'completed'
        appointment.actual_end_time = tz.now().time()
        appointment.save()
        if hasattr(appointment.patient, 'user') and appointment.patient.user:
            create_notification(
                appointment.patient.user,
                'session_completed',
                'Session Completed',
                f'Your dialysis session on {appointment.appointment_date} has been completed. Thank you for visiting DialysisTrack.'
            )
        create_audit_log(request.user, 'status_change', 'appointments', f'Session completed for {appointment.patient}', request)
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

    @action(detail=False, methods=['post'])
    def book_appointment(self, request):
        """Allow a logged-in patient to book their own appointment."""
        user = request.user
        from patients.models import Patient

        try:
            patient = Patient.objects.filter(Q(user=user) | Q(email=user.email)).first()
            if not patient:
                return Response(
                    {'error': 'No patient profile linked to your account. Please contact reception.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            appointment_date = request.data.get('appointment_date')
            shift = request.data.get('shift')
            scheduled_time = request.data.get('scheduled_time')
            notes = request.data.get('notes', '')

            if not appointment_date or not shift or not scheduled_time:
                return Response(
                    {'error': 'appointment_date, shift, and scheduled_time are required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Ensure appointment is in the future
            from datetime import datetime
            try:
                appt_date = datetime.strptime(appointment_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

            if appt_date < date.today():
                return Response({'error': 'Appointment date cannot be in the past.'}, status=status.HTTP_400_BAD_REQUEST)

            # Check for duplicate booking on same date/shift
            existing = Appointment.objects.filter(
                patient=patient,
                appointment_date=appt_date,
                shift=shift,
                status__in=['scheduled', 'checked_in', 'in_progress']
            ).exists()
            if existing:
                return Response(
                    {'error': f'You already have a {shift} shift appointment on {appointment_date}.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            appointment = Appointment.objects.create(
                patient=patient,
                appointment_date=appt_date,
                shift=shift,
                scheduled_time=scheduled_time,
                notes=notes,
                status='scheduled',
                created_by=user
            )

            # Notify patient
            create_notification(
                user,
                'appointment_booked',
                'Appointment Booked Successfully',
                f'Your appointment for {appt_date} ({shift} shift) at {scheduled_time} has been booked. Please arrive 15 minutes early.'
            )

            # Notify all staff about the new patient booking
            self._notify_all_staff(
                'appointment_booked',
                'New Patient Appointment',
                f'Patient {patient.first_name} {patient.last_name} has self-booked an appointment for {appt_date} ({shift} shift) at {scheduled_time}.'
            )

            create_audit_log(user, 'create', 'appointments',
                             f'Patient {patient} self-booked appointment for {appt_date}', request)

            serializer = AppointmentSerializer(appointment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)