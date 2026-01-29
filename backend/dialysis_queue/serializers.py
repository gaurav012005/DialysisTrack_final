from rest_framework import serializers
from .models import Queue, QueueSettings, DialysisSession
from patients.serializers import PatientSerializer
from users.serializers import UserSerializer

class QueueSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    patient_details = PatientSerializer(source='patient', read_only=True)
    total_session_time = serializers.ReadOnlyField()
    assigned_staff_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Queue
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'queue_number')
    
    def get_assigned_staff_name(self, obj):
        if obj.assigned_staff:
            return f"{obj.assigned_staff.first_name} {obj.assigned_staff.last_name}".strip() or obj.assigned_staff.username
        return None

class QueueCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Queue
        fields = ['patient', 'priority']
        read_only_fields = ('queue_number', 'status', 'check_in_time', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        # Generate simple queue number
        import random
        queue_number = f"Q{random.randint(1, 9999):04d}"
        validated_data['queue_number'] = queue_number
        return super().create(validated_data)

class QueueUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Queue
        fields = ['status', 'priority', 'assigned_machine', 'assigned_staff', 'blood_pressure', 
                 'weight_before', 'weight_after', 'notes', 'actual_start_time', 'actual_end_time']

class QueueSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueueSettings
        fields = '__all__'

class DialysisSessionSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    queue_details = QueueSerializer(source='queue', read_only=True)
    attending_doctor_details = UserSerializer(source='attending_doctor', read_only=True)
    attending_nurse_details = UserSerializer(source='attending_nurse', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = DialysisSession
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by')

class DialysisSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DialysisSession
        fields = ['queue', 'patient', 'pre_bp_systolic', 'pre_bp_diastolic', 'pre_heart_rate', 
                 'pre_temperature', 'pre_oxygen_saturation', 'blood_flow_rate', 'dialysate_flow_rate',
                 'heparin_dose', 'medications', 'attending_doctor', 'attending_nurse', 'nurse_notes']
        extra_kwargs = {
            'attending_doctor': {'required': False},
            'attending_nurse': {'required': False},
        }

class DialysisSessionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DialysisSession
        fields = ['post_bp_systolic', 'post_bp_diastolic', 'post_heart_rate', 'post_temperature',
                 'post_oxygen_saturation', 'ultrafiltration_volume', 'medications', 'complications',
                 'adverse_events', 'nurse_notes', 'doctor_notes', 'attending_doctor', 'attending_nurse']