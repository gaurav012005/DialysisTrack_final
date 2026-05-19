from rest_framework import serializers
from .models import Patient, DialysisPrescription, LabResult

class PatientSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    is_infection_positive = serializers.ReadOnlyField()
    requires_isolated_machine = serializers.ReadOnlyField()
    is_consent_valid = serializers.ReadOnlyField()
    active_prescription = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_age(self, obj):
        from datetime import date
        if obj.date_of_birth:
            today = date.today()
            return today.year - obj.date_of_birth.year - (
                (today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day)
            )
        return None
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    def get_active_prescription(self, obj):
        """Return the patient's current active prescription summary"""
        prescription = obj.prescriptions.filter(is_active=True).first()
        if prescription:
            return {
                'id': prescription.id,
                'frequency': prescription.get_frequency_display(),
                'duration_minutes': prescription.session_duration_minutes,
                'blood_flow_rate': prescription.target_blood_flow_rate,
                'dialyzer_type': prescription.get_dialyzer_type_display(),
                'prescribed_by': prescription.prescribed_by.get_full_name() if prescription.prescribed_by else None,
                'effective_date': prescription.effective_date,
            }
        return None

    def validate_patient_id(self, value):
        if len(value) > 20:
            raise serializers.ValidationError("Patient ID must not exceed 20 characters.")
        return value


class DialysisPrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    prescribed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = DialysisPrescription
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"
    
    def get_prescribed_by_name(self, obj):
        if obj.prescribed_by:
            return obj.prescribed_by.get_full_name()
        return None


class LabResultSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    ordered_by_name = serializers.SerializerMethodField()
    urr = serializers.ReadOnlyField()
    ktv_estimated = serializers.ReadOnlyField()
    is_potassium_critical = serializers.ReadOnlyField()
    is_hemoglobin_low = serializers.ReadOnlyField()
    
    class Meta:
        model = LabResult
        fields = '__all__'
        read_only_fields = ('created_at', 'is_critical')
    
    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"
    
    def get_ordered_by_name(self, obj):
        if obj.ordered_by:
            return obj.ordered_by.get_full_name()
        return None
