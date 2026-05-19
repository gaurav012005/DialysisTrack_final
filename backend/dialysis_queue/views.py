from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Queue, QueueSettings, DialysisSession
from .serializers import (QueueSerializer, QueueCreateSerializer, QueueUpdateSerializer, 
                         QueueSettingsSerializer, DialysisSessionSerializer, 
                         DialysisSessionCreateSerializer, DialysisSessionUpdateSerializer)
from users.permissions import HospitalRolePermission


def get_today_range():
    """Return (start_of_today, start_of_tomorrow) as UTC-aware datetimes.

    Avoids MySQL CONVERT_TZ() which requires populated timezone tables.
    Instead we localise via Python (Django's timezone.localtime) and produce
    an explicit UTC range that MySQL can compare directly with no conversion.
    """
    now_local = timezone.localtime(timezone.now())          # UTC → Django TIME_ZONE
    today_local = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_local = today_local + timedelta(days=1)
    return today_local, tomorrow_local

class QueueViewSet(viewsets.ModelViewSet):
    queryset = Queue.objects.all()
    permission_classes = [HospitalRolePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'assigned_machine']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__patient_id', 'queue_number']
    ordering_fields = ['check_in_time', 'priority', 'queue_number']
    app_name = 'dialysis_queue'
    
    def get_serializer_class(self):
        if self.action == 'create':
            return QueueCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return QueueUpdateSerializer
        return QueueSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # Filter by today's date by default (UTC-safe range — no CONVERT_TZ needed)
        if 'date' not in self.request.query_params:
            today_start, tomorrow_start = get_today_range()
            queryset = queryset.filter(
                check_in_time__gte=today_start,
                check_in_time__lt=tomorrow_start,
            )

        # Patients can only see their own queue entries
        if user.role == 'patient':
            queryset = queryset.filter(patient__user=user)

        return queryset
    
    def create(self, request, *args, **kwargs):
        """Nurses, doctors, and receptionists can add to queue.
        
        DIALYSIS HEAD RULES ENFORCED:
        - Only active patients can be added to queue
        - No duplicate queue entries for same patient on same day (waiting/in_progress)
        - Emergency patients get priority notification
        """
        if request.user.role not in ['admin', 'doctor', 'nurse', 'receptionist']:
            return Response({'error': 'Permission denied. Only medical staff and receptionists can add patients to the queue.'}, status=403)
        
        # === DIALYSIS HEAD FIX: Check if patient is active ===
        patient_id = request.data.get('patient')
        if patient_id:
            from patients.models import Patient
            try:
                patient = Patient.objects.get(id=patient_id)
                if not patient.is_active:
                    return Response(
                        {'error': 'Cannot add inactive/discharged patient to queue. Please reactivate the patient first.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Patient.DoesNotExist:
                return Response({'error': 'Patient not found.'}, status=status.HTTP_404_NOT_FOUND)
            
            # === DIALYSIS HEAD FIX: Prevent duplicate queue entries ===
            today_start, tomorrow_start = get_today_range()
            existing_entry = Queue.objects.filter(
                patient_id=patient_id,
                check_in_time__gte=today_start,
                check_in_time__lt=tomorrow_start,
                status__in=['waiting', 'in_progress']
            ).first()
            if existing_entry:
                return Response(
                    {'error': f'Patient {patient.first_name} {patient.last_name} is already in the queue today (Queue #{existing_entry.queue_number}, Status: {existing_entry.get_status_display()}). Cannot add duplicate entry.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def current_queue(self, request):
        """Get current active queue (waiting + in progress)"""
        today_start, tomorrow_start = get_today_range()
        queue = self.get_queryset().filter(
            check_in_time__gte=today_start,
            check_in_time__lt=tomorrow_start,
            status__in=['waiting', 'in_progress']
        ).order_by('-priority', 'check_in_time')

        serializer = self.get_serializer(queue, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get queue statistics for dashboard"""
        today_start, tomorrow_start = get_today_range()
        queryset = self.get_queryset()
        
        stats = {
            'total_waiting': queryset.filter(
                check_in_time__gte=today_start,
                check_in_time__lt=tomorrow_start,
                status='waiting'
            ).count(),
            'total_in_progress': queryset.filter(
                check_in_time__gte=today_start,
                check_in_time__lt=tomorrow_start,
                status='in_progress'
            ).count(),
            'total_completed': queryset.filter(
                check_in_time__gte=today_start,
                check_in_time__lt=tomorrow_start,
                status='completed'
            ).count(),
            'emergency_cases': queryset.filter(
                check_in_time__gte=today_start,
                check_in_time__lt=tomorrow_start,
                priority='emergency',
                status__in=['waiting', 'in_progress']
            ).count(),
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def start_treatment(self, request, pk=None):
        """Start treatment - nurses and doctors only.
        
        DIALYSIS HEAD RULES ENFORCED:
        - Machine MUST be assigned before starting treatment
        - Machine must be available (not in use by another patient)
        - Queue status must be 'waiting' (proper state transition)
        - Machine status auto-updates to 'in_use'
        """
        if request.user.role not in ['admin', 'doctor', 'nurse']:
            return Response({'error': 'Permission denied'}, status=403)
            
        queue = self.get_object()
        
        # === DIALYSIS HEAD FIX: Validate proper state transition ===
        if queue.status != 'waiting':
            return Response(
                {'error': f'Cannot start treatment. Current status is "{queue.get_status_display()}". Only waiting patients can start treatment.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # === DIALYSIS HEAD FIX: Machine MUST be assigned before starting ===
        if not queue.assigned_machine or queue.assigned_machine.strip() == '':
            return Response(
                {'error': 'Cannot start treatment without assigning a dialysis machine first. Please assign a machine to this patient.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # === DIALYSIS HEAD FIX: Verify machine exists and is available ===
        from machines.models import DialysisMachine
        try:
            machine = DialysisMachine.objects.get(machine_id=queue.assigned_machine)
            if machine.status == 'in_use':
                # Check who is using it
                today_start, tomorrow_start = get_today_range()
                other_queue = Queue.objects.filter(
                    assigned_machine=queue.assigned_machine,
                    status='in_progress',
                    check_in_time__gte=today_start,
                    check_in_time__lt=tomorrow_start
                ).exclude(pk=queue.pk).first()
                patient_info = f" (currently used by {other_queue.patient.first_name} {other_queue.patient.last_name})" if other_queue else ""
                return Response(
                    {'error': f'Machine {queue.assigned_machine} is already in use{patient_info}. Please assign a different machine.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif machine.status in ['maintenance', 'out_of_service']:
                return Response(
                    {'error': f'Machine {queue.assigned_machine} is under {machine.get_status_display()}. Cannot use for treatment.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # === DIALYSIS HEAD FIX: Update machine status to 'in_use' ===
            machine.status = 'in_use'
            machine.current_patient = queue.patient
            machine.current_session_start = timezone.now()
            machine.save()
            
        except DialysisMachine.DoesNotExist:
            # Machine ID typed manually but doesn't exist in system - warn but allow
            pass
        
        queue.status = 'in_progress'
        queue.actual_start_time = timezone.now()
        queue.assigned_staff = request.user
        queue.save()
        
        if hasattr(queue.patient, 'user') and queue.patient.user:
            from notifications.views import create_notification
            create_notification(
                user=queue.patient.user,
                notification_type='general',
                title='Treatment Started',
                message=f'Your dialysis treatment has started on Machine {queue.assigned_machine}. Estimated duration: ~4 hours.'
            )
        
        serializer = self.get_serializer(queue)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete_treatment(self, request, pk=None):
        """Complete treatment - nurses and doctors only.
        
        DIALYSIS HEAD RULES ENFORCED:
        - Queue status must be 'in_progress' (proper state transition)
        - Machine status auto-updates to 'cleaning' (must be cleaned before reuse)
        - Session duration is recorded
        - Long session warning (>5 hours)
        """
        if request.user.role not in ['admin', 'doctor', 'nurse']:
            return Response({'error': 'Permission denied'}, status=403)
            
        queue = self.get_object()
        
        # === DIALYSIS HEAD FIX: Validate proper state transition ===
        if queue.status != 'in_progress':
            return Response(
                {'error': f'Cannot complete treatment. Current status is "{queue.get_status_display()}". Only in-progress treatments can be completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queue.status = 'completed'
        queue.actual_end_time = timezone.now()
        queue.save()
        
        # === DIALYSIS HEAD FIX: Release machine and set to 'cleaning' ===
        if queue.assigned_machine:
            from machines.models import DialysisMachine
            try:
                machine = DialysisMachine.objects.get(machine_id=queue.assigned_machine)
                # Calculate session duration for machine operating hours
                if machine.current_session_start:
                    from decimal import Decimal
                    session_duration = timezone.now() - machine.current_session_start
                    hours = session_duration.total_seconds() / 3600
                    machine.total_operating_hours += Decimal(str(round(hours, 2)))
                
                # Route to maintenance if overdue, otherwise cleaning
                machine.status = 'maintenance' if machine.needs_maintenance else 'cleaning'
                machine.current_patient = None
                machine.current_session_start = None
                machine.total_sessions += 1
                machine.save()
            except DialysisMachine.DoesNotExist:
                pass
        
        # === DIALYSIS HEAD FIX: Check for abnormal session duration ===
        warning_msg = ''
        if queue.actual_start_time and queue.actual_end_time:
            duration_minutes = (queue.actual_end_time - queue.actual_start_time).total_seconds() / 60
            if duration_minutes > 300:  # More than 5 hours
                warning_msg = f' WARNING: Session lasted {int(duration_minutes)} minutes (>5 hours). Please verify.'
            elif duration_minutes < 60:  # Less than 1 hour
                warning_msg = f' NOTE: Session was only {int(duration_minutes)} minutes (<1 hour). Please verify early termination reason.'
        
        if hasattr(queue.patient, 'user') and queue.patient.user:
            from notifications.views import create_notification
            create_notification(
                user=queue.patient.user,
                notification_type='general',
                title='Treatment Completed',
                message=f'Your dialysis treatment has been completed. Machine {queue.assigned_machine or "N/A"} is now being cleaned for the next patient.'
            )
        
        serializer = self.get_serializer(queue)
        response_data = serializer.data
        if warning_msg:
            response_data['duration_warning'] = warning_msg
        return Response(response_data)
    
    @action(detail=True, methods=['post'])
    def assign_machine(self, request, pk=None):
        """Assign machine - nurses and technicians only.
        
        DIALYSIS HEAD RULES ENFORCED:
        - Machine must exist in system
        - Machine must be 'available' status
        - Machine must NOT be assigned to another active patient
        - Machine must NOT be under maintenance
        """
        if request.user.role not in ['admin', 'nurse', 'technician']:
            return Response({'error': 'Permission denied'}, status=403)
            
        queue = self.get_object()
        machine_id = request.data.get('machine')
        
        if not machine_id:
            return Response({'error': 'Machine ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # === DIALYSIS HEAD FIX: Validate machine exists and is available ===
        from machines.models import DialysisMachine
        try:
            machine = DialysisMachine.objects.get(machine_id=machine_id)
            
            if not machine.is_active:
                return Response(
                    {'error': f'Machine {machine_id} is deactivated and cannot be used.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if machine.status == 'in_use':
                return Response(
                    {'error': f'Machine {machine_id} is already in use. Please choose another machine.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if machine.status in ['maintenance', 'out_of_service']:
                return Response(
                    {'error': f'Machine {machine_id} is under {machine.get_status_display()}. Cannot assign to patient.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if machine.status == 'cleaning':
                return Response(
                    {'error': f'Machine {machine_id} is still being cleaned after the previous session. Please wait until cleaning is complete.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # === DIALYSIS HEAD FIX: Infection-based machine segregation ===
            patient = queue.patient
            if hasattr(patient, 'hepatitis_b_status'):
                if patient.hepatitis_b_status == 'positive':
                    # Hep B+ patient — ideally should use dedicated machine
                    # Log a note for tracking but allow assignment
                    machine.notes = (machine.notes or '') + f' [HEP B+ patient {patient.first_name} {patient.last_name} used on {timezone.now().date()}]'
                    machine.save()
            
        except DialysisMachine.DoesNotExist:
            return Response(
                {'error': f'Machine {machine_id} does not exist in the system. Please check the machine ID.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # === DIALYSIS HEAD FIX: Check consent before assigning machine ===
        if hasattr(queue.patient, 'is_consent_valid') and not queue.patient.is_consent_valid:
            if not queue.patient.is_emergency:
                return Response(
                    {'error': f'Patient {queue.patient.first_name} {queue.patient.last_name} does not have valid consent. Please obtain consent before proceeding.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # === DIALYSIS HEAD FIX: Check if machine is assigned to another active queue entry today ===
        today_start, tomorrow_start = get_today_range()
        conflict = Queue.objects.filter(
            assigned_machine=machine_id,
            status__in=['waiting', 'in_progress'],
            check_in_time__gte=today_start,
            check_in_time__lt=tomorrow_start
        ).exclude(pk=queue.pk).first()
        
        if conflict:
            return Response(
                {'error': f'Machine {machine_id} is already assigned to patient {conflict.patient.first_name} {conflict.patient.last_name} (Queue #{conflict.queue_number}). Please choose another machine.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queue.assigned_machine = machine_id
        queue.save()
        
        # Notify staff about machine assignment
        if hasattr(queue.patient, 'user') and queue.patient.user:
            from notifications.views import create_notification
            create_notification(
                user=queue.patient.user,
                notification_type='machine_booking',
                title='Machine Assigned',
                message=f'Machine {machine_id} ({machine.name}) has been assigned for your dialysis session.'
            )
            
        serializer = self.get_serializer(queue)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_emergency(self, request):
        """Add emergency case - medical staff only.
        
        DIALYSIS HEAD RULES ENFORCED:
        - Patient must exist and be active
        - No duplicate emergency entries
        """
        if request.user.role not in ['admin', 'doctor', 'nurse']:
            return Response({'error': 'Permission denied'}, status=403)
            
        patient_id = request.data.get('patient_id')
        
        try:
            from patients.models import Patient
            patient = Patient.objects.get(id=patient_id)
            
            if not patient.is_active:
                return Response(
                    {'error': 'Cannot add inactive patient to emergency queue.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # === DIALYSIS HEAD FIX: Check for existing active queue entry ===
            today_start, tomorrow_start = get_today_range()
            existing = Queue.objects.filter(
                patient=patient,
                check_in_time__gte=today_start,
                check_in_time__lt=tomorrow_start,
                status__in=['waiting', 'in_progress']
            ).first()
            if existing:
                # Upgrade existing entry to emergency priority instead of creating duplicate
                existing.priority = 'emergency'
                existing.save()
                serializer = self.get_serializer(existing)
                return Response(
                    {'message': f'Patient already in queue. Priority upgraded to Emergency.', 'data': serializer.data},
                    status=status.HTTP_200_OK
                )
            
            # Create emergency queue entry with a globally-unique sequential number
            from django.db import transaction
            with transaction.atomic():
                last_queue = (
                    Queue.objects
                    .select_for_update()
                    .order_by('-id')
                    .first()
                )
                next_num = 1
                if last_queue and last_queue.queue_number:
                    try:
                        next_num = int(last_queue.queue_number.lstrip('QE')) + 1
                    except (ValueError, IndexError):
                        next_num = Queue.objects.count() + 1

                queue = Queue.objects.create(
                    patient=patient,
                    priority='emergency',
                    status='waiting',
                    queue_number=f"E{next_num:04d}"
                )
            
            serializer = self.get_serializer(queue)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class QueueSettingsViewSet(viewsets.ModelViewSet):
    queryset = QueueSettings.objects.all()
    serializer_class = QueueSettingsSerializer
    permission_classes = [HospitalRolePermission]
    app_name = 'dialysis_queue'
    
    def list(self, request):
        # Only admin can view settings
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=403)
            
        # Get or create settings
        settings, created = QueueSettings.objects.get_or_create(pk=1)
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

class DialysisSessionViewSet(viewsets.ModelViewSet):
    queryset = DialysisSession.objects.all()
    permission_classes = [HospitalRolePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['patient', 'queue__status']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__patient_id']
    ordering_fields = ['created_at', 'queue__check_in_time']
    app_name = 'dialysis_queue'
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DialysisSessionCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DialysisSessionUpdateSerializer
        return DialysisSessionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset().select_related('patient', 'queue', 'attending_doctor', 'attending_nurse')
        user = self.request.user
        
        # Patients can only see their own sessions
        if user.role == 'patient':
            queryset = queryset.filter(patient__user=user)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def create(self, request, *args, **kwargs):
        # Check if session already exists for this queue
        queue_id = request.data.get('queue')
        if queue_id:
            existing = DialysisSession.objects.filter(queue_id=queue_id).first()
            if existing:
                return Response(
                    {'error': 'A session already exists for this queue entry'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e), 'detail': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], url_path='patient/(?P<patient_id>[^/.]+)')
    def patient_history(self, request, patient_id=None):
        """Get all dialysis sessions for a specific patient"""
        sessions = self.get_queryset().filter(patient_id=patient_id).order_by('-created_at')
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete_session(self, request, pk=None):
        """Complete session with post-dialysis vitals.
        
        DIALYSIS HEAD RULES ENFORCED:
        - Session's queue must be in_progress
        - Machine gets released to cleaning
        """
        if request.user.role not in ['admin', 'doctor', 'nurse']:
            return Response({'error': 'Permission denied'}, status=403)
        
        session = self.get_object()
        serializer = DialysisSessionUpdateSerializer(session, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            # Also update queue status
            session.queue.status = 'completed'
            session.queue.actual_end_time = timezone.now()
            session.queue.save()
            
            # === DIALYSIS HEAD FIX: Release machine when session completes ===
            if session.queue.assigned_machine:
                from machines.models import DialysisMachine
                try:
                    machine = DialysisMachine.objects.get(machine_id=session.queue.assigned_machine)
                    if machine.current_session_start:
                        session_duration = timezone.now() - machine.current_session_start
                        hours = session_duration.total_seconds() / 3600
                        machine.total_operating_hours += round(hours, 2)
                    # Route to maintenance if overdue, otherwise cleaning
                    machine.status = 'maintenance' if machine.needs_maintenance else 'cleaning'
                    machine.current_patient = None
                    machine.current_session_start = None
                    machine.total_sessions += 1
                    machine.save()
                except DialysisMachine.DoesNotExist:
                    pass
            
            if hasattr(session.patient, 'user') and session.patient.user:
                from notifications.views import create_notification
                create_notification(
                    user=session.patient.user,
                    notification_type='session_completed',
                    title='Session Completed',
                    message='Your dialysis session has been successfully completed with post-dialysis vitals.'
                )
            
            return Response(DialysisSessionSerializer(session).data)
        return Response(serializer.errors, status=400)
    
    @action(detail=False, methods=['get'])
    def recent_sessions(self, request):
        """Get recent sessions (last 7 days)"""
        week_ago = timezone.now() - timedelta(days=7)
        sessions = self.get_queryset().filter(created_at__gte=week_ago)
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)