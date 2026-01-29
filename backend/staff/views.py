from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum
from datetime import date, timedelta
from django.contrib.auth import get_user_model
from .models import StaffSchedule, StaffAttendance, LeaveRequest
from .serializers import (
    StaffScheduleSerializer, StaffAttendanceSerializer, 
    LeaveRequestSerializer, StaffWorkloadSerializer, UserShortSerializer
)

User = get_user_model()

class StaffScheduleViewSet(viewsets.ModelViewSet):
    queryset = StaffSchedule.objects.all()
    serializer_class = StaffScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['shift_type', 'shift_date', 'is_present']
    search_fields = ['staff__first_name', 'staff__last_name', 'assigned_zone']
    ordering_fields = ['shift_date', 'start_time']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by current week by default
        if 'date' not in self.request.query_params:
            today = date.today()
            start_week = today - timedelta(days=today.weekday())
            end_week = start_week + timedelta(days=6)
            queryset = queryset.filter(shift_date__range=[start_week, end_week])
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def today_schedule(self, request):
        """Get today's staff schedule"""
        today = date.today()
        schedule = StaffSchedule.objects.filter(shift_date=today)
        serializer = self.get_serializer(schedule, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Staff check-in for shift"""
        schedule = self.get_object()
        schedule.is_present = True
        schedule.check_in_time = date.today()
        schedule.save()
        
        # Create attendance record
        StaffAttendance.objects.create(
            staff=schedule.staff,
            date=schedule.shift_date,
            status='present',
            scheduled_start=schedule.start_time,
            scheduled_end=schedule.end_time,
            actual_start=schedule.start_time  # Use scheduled time for now
        )
        
        serializer = self.get_serializer(schedule)
        return Response(serializer.data)

class StaffAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StaffAttendance.objects.all()
    serializer_class = StaffAttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'date']
    ordering_fields = ['date', 'staff__first_name']
    
    @action(detail=False, methods=['get'])
    def monthly_report(self, request):
        """Get monthly attendance report"""
        year = request.query_params.get('year', date.today().year)
        month = request.query_params.get('month', date.today().month)
        
        attendance = StaffAttendance.objects.filter(
            date__year=year,
            date__month=month
        )
        
        serializer = self.get_serializer(attendance, many=True)
        return Response(serializer.data)

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'leave_type', 'staff']
    ordering_fields = ['created_at', 'start_date']
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve leave request"""
        if not request.user.has_perm('staff.approve_leaverequest'):
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        leave_request = self.get_object()
        leave_request.status = 'approved'
        leave_request.approved_by = request.user
        leave_request.approved_date = date.today()
        leave_request.save()
        
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject leave request"""
        if not request.user.has_perm('staff.approve_leaverequest'):
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        leave_request = self.get_object()
        leave_request.status = 'rejected'
        leave_request.approved_by = request.user
        leave_request.approved_date = date.today()
        leave_request.save()
        
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)

class StaffViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserShortSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['role', 'department', 'is_active']
    search_fields = ['first_name', 'last_name', 'username', 'email']
    
    @action(detail=False, methods=['get'])
    def workload(self, request):
        """Get staff workload statistics"""
        today = date.today()
        
        # This would need to be customized based on your actual workload tracking
        staff_workload = []
        
        for user in User.objects.filter(is_active=True):
            workload_data = {
                'staff_id': user.id,
                'staff_name': user.get_full_name(),
                'total_patients': 0,  # This would come from actual patient assignments
                'total_hours': 8.0,   # Default shift hours
                'shift_type': 'morning'
            }
            staff_workload.append(workload_data)
        
        serializer = StaffWorkloadSerializer(staff_workload, many=True)
        return Response(serializer.data)