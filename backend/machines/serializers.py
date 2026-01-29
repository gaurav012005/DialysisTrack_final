from rest_framework import serializers
from .models import DialysisMachine, MaintenanceLog, CleaningLog
from patients.serializers import PatientSerializer

class DialysisMachineSerializer(serializers.ModelSerializer):
    needs_maintenance = serializers.ReadOnlyField()
    days_since_maintenance = serializers.ReadOnlyField()
    current_patient_details = PatientSerializer(source='current_patient', read_only=True)
    
    class Meta:
        model = DialysisMachine
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'total_sessions', 'total_operating_hours')

class MaintenanceLogSerializer(serializers.ModelSerializer):
    machine_details = DialysisMachineSerializer(source='machine', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    
    class Meta:
        model = MaintenanceLog
        fields = '__all__'
        read_only_fields = ('created_at',)

class CleaningLogSerializer(serializers.ModelSerializer):
    machine_details = DialysisMachineSerializer(source='machine', read_only=True)
    cleaned_by_name = serializers.CharField(source='cleaned_by.get_full_name', read_only=True)
    
    class Meta:
        model = CleaningLog
        fields = '__all__'

class MachineStatsSerializer(serializers.Serializer):
    total_machines = serializers.IntegerField()
    available_machines = serializers.IntegerField()
    in_use_machines = serializers.IntegerField()
    maintenance_machines = serializers.IntegerField()
    utilization_rate = serializers.FloatField()