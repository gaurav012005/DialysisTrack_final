from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from datetime import date, timedelta
from .models import DialysisMachine, MaintenanceLog, CleaningLog
from .serializers import (
    DialysisMachineSerializer, MaintenanceLogSerializer, 
    CleaningLogSerializer, MachineStatsSerializer
)

class DialysisMachineViewSet(viewsets.ModelViewSet):
    queryset = DialysisMachine.objects.all()
    serializer_class = DialysisMachineSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'machine_type', 'is_active']
    search_fields = ['machine_id', 'name', 'manufacturer', 'model', 'serial_number']
    ordering_fields = ['machine_id', 'name', 'status', 'purchase_date']
    
    @action(detail=False, methods=['get'])
    def available_machines(self, request):
        """Get list of available machines"""
        available_machines = DialysisMachine.objects.filter(
            status='available',
            is_active=True
        )
        serializer = self.get_serializer(available_machines, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get machine statistics"""
        total_machines = DialysisMachine.objects.filter(is_active=True).count()
        available_machines = DialysisMachine.objects.filter(status='available', is_active=True).count()
        in_use_machines = DialysisMachine.objects.filter(status='in_use', is_active=True).count()
        maintenance_machines = DialysisMachine.objects.filter(status='maintenance', is_active=True).count()
        
        utilization_rate = (in_use_machines / total_machines * 100) if total_machines > 0 else 0
        
        stats = {
            'total_machines': total_machines,
            'available_machines': available_machines,
            'in_use_machines': in_use_machines,
            'maintenance_machines': maintenance_machines,
            'utilization_rate': round(utilization_rate, 2)
        }
        
        serializer = MachineStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def start_maintenance(self, request, pk=None):
        """Put machine under maintenance"""
        machine = self.get_object()
        machine.status = 'maintenance'
        machine.current_patient = None
        machine.current_session_start = None
        machine.save()
        
        serializer = self.get_serializer(machine)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete_maintenance(self, request, pk=None):
        """Complete maintenance and make machine available"""
        machine = self.get_object()
        machine.status = 'available'
        machine.last_maintenance_date = date.today()
        machine.next_maintenance_date = date.today() + timedelta(days=machine.maintenance_interval_days)
        machine.save()
        
        serializer = self.get_serializer(machine)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign_patient(self, request, pk=None):
        """Assign patient to machine"""
        machine = self.get_object()
        patient_id = request.data.get('patient_id')
        
        if machine.status != 'available':
            return Response(
                {'error': 'Machine is not available'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from patients.models import Patient
            patient = Patient.objects.get(id=patient_id)
            
            machine.status = 'in_use'
            machine.current_patient = patient
            machine.current_session_start = date.today()
            machine.total_sessions += 1
            machine.save()
            
            serializer = self.get_serializer(machine)
            return Response(serializer.data)
            
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def release_patient(self, request, pk=None):
        """Release patient from machine"""
        machine = self.get_object()
        
        if machine.status == 'in_use':
            # Calculate operating hours
            if machine.current_session_start:
                from datetime import datetime
                session_duration = datetime.now() - machine.current_session_start
                machine.total_operating_hours += session_duration.total_seconds() / 3600
            
            machine.status = 'cleaning'  # Needs cleaning after use
            machine.current_patient = None
            machine.current_session_start = None
            machine.save()
        
        serializer = self.get_serializer(machine)
        return Response(serializer.data)

class MaintenanceLogViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceLog.objects.all()
    serializer_class = MaintenanceLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['maintenance_type', 'machine']
    ordering_fields = ['maintenance_date', 'created_at']
    
    @action(detail=False, methods=['get'])
    def upcoming_maintenance(self, request):
        """Get machines needing maintenance soon"""
        thirty_days_from_now = date.today() + timedelta(days=30)
        machines_needing_maintenance = DialysisMachine.objects.filter(
            next_maintenance_date__lte=thirty_days_from_now,
            is_active=True
        )
        
        from .serializers import DialysisMachineSerializer
        serializer = DialysisMachineSerializer(machines_needing_maintenance, many=True)
        return Response(serializer.data)

class CleaningLogViewSet(viewsets.ModelViewSet):
    queryset = CleaningLog.objects.all()
    serializer_class = CleaningLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['cleaning_type', 'machine']
    ordering_fields = ['cleaning_date']