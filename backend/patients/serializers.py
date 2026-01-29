from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    
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

    def validate_patient_id(self, value):
        if len(value) > 20:
            raise serializers.ValidationError("Patient ID must not exceed 20 characters.")
        return value
