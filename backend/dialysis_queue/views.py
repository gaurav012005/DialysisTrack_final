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
        
        # Filter by today's date by default
        today = timezone.now().date()
        if 'date' not in self.request.query_params:
            queryset = queryset.filter(check_in_time__date=today)
        
        # Patients can only see their own queue entries
        if user.role == 'patient':
            queryset = queryset.filter(patient__user=user)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Nurses, doctors, and receptionists can add to queue"""
        if request.user.role not in ['admin', 'doctor', 'nurse', 'receptionist']:
            return Response({'error': 'Permission denied. Only medical staff and receptionists can add patients to the queue.'}, status=403)
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def current_queue(self, request):
        """Get current active queue (waiting + in progress)"""
        today = timezone.now().date()
        queue = self.get_queryset().filter(
            check_in_time__date=today,
            status__in=['waiting', 'in_progress']
        ).order_by('-priority', 'check_in_time')
        
        serializer = self.get_serializer(queue, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get queue statistics for dashboard"""
        today = timezone.now().date()
        queryset = self.get_queryset()
        
        stats = {
            'total_waiting': queryset.filter(
                check_in_time__date=today, 
                status='waiting'
            ).count(),
            'total_in_progress': queryset.filter(
                check_in_time__date=today, 
                status='in_progress'
            ).count(),
            'total_completed': queryset.filter(
                check_in_time__date=today, 
                status='completed'
            ).count(),
            'emergency_cases': queryset.filter(
                check_in_time__date=today,
                priority='emergency',
                status__in=['waiting', 'in_progress']
            ).count(),
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def start_treatment(self, request, pk=None):
        """Start treatment - nurses and doctors only"""
        if request.user.role not in ['admin', 'doctor', 'nurse']:
            return Response({'error': 'Permission denied'}, status=403)
            
        queue = self.get_object()
        queue.status = 'in_progress'
        queue.actual_start_time = timezone.now()
        queue.save()
        
        serializer = self.get_serializer(queue)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete_treatment(self, request, pk=None):
        """Complete treatment - nurses and doctors only"""
        if request.user.role not in ['admin', 'doctor', 'nurse']:
            return Response({'error': 'Permission denied'}, status=403)
            
        queue = self.get_object()
        queue.status = 'completed'
        queue.actual_end_time = timezone.now()
        queue.save()
        
        serializer = self.get_serializer(queue)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign_machine(self, request, pk=None):
        """Assign machine - nurses and technicians only"""
        if request.user.role not in ['admin', 'nurse', 'technician']:
            return Response({'error': 'Permission denied'}, status=403)
            
        queue = self.get_object()
        machine = request.data.get('machine')
        
        if machine:
            queue.assigned_machine = machine
            queue.save()
            
        serializer = self.get_serializer(queue)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_emergency(self, request):
        """Add emergency case - medical staff only"""
        if request.user.role not in ['admin', 'doctor', 'nurse']:
            return Response({'error': 'Permission denied'}, status=403)
            
        patient_id = request.data.get('patient_id')
        
        try:
            from patients.models import Patient
            patient = Patient.objects.get(id=patient_id)
            
            # Create emergency queue entry
            queue = Queue.objects.create(
                patient=patient,
                priority='emergency',
                status='waiting'
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
        """Complete session with post-dialysis vitals"""
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
            
            return Response(DialysisSessionSerializer(session).data)
        return Response(serializer.errors, status=400)
    
    @action(detail=False, methods=['get'])
    def recent_sessions(self, request):
        """Get recent sessions (last 7 days)"""
        week_ago = timezone.now() - timedelta(days=7)
        sessions = self.get_queryset().filter(created_at__gte=week_ago)
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)