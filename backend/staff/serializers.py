from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import StaffSchedule, StaffAttendance, LeaveRequest

User = get_user_model()

class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'department']

class StaffScheduleSerializer(serializers.ModelSerializer):
    staff_details = UserShortSerializer(source='staff', read_only=True)
    
    class Meta:
        model = StaffSchedule
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class StaffAttendanceSerializer(serializers.ModelSerializer):
    staff_details = UserShortSerializer(source='staff', read_only=True)
    
    class Meta:
        model = StaffAttendance
        fields = '__all__'
        read_only_fields = ('created_at',)

class LeaveRequestSerializer(serializers.ModelSerializer):
    staff_details = UserShortSerializer(source='staff', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = LeaveRequest
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'total_days')

class StaffWorkloadSerializer(serializers.Serializer):
    staff_id = serializers.IntegerField()
    staff_name = serializers.CharField()
    total_patients = serializers.IntegerField()
    total_hours = serializers.FloatField()
    shift_type = serializers.CharField()