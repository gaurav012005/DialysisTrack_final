from rest_framework import serializers
from .models import Ambulance, AmbulanceRide


class AmbulanceSerializer(serializers.ModelSerializer):
    driver_name = serializers.SerializerMethodField()

    class Meta:
        model = Ambulance
        fields = ['id', 'vehicle_number', 'driver', 'driver_name', 'status', 'created_at', 'updated_at']

    def get_driver_name(self, obj):
        if obj.driver:
            return f"{obj.driver.first_name} {obj.driver.last_name}"
        return None


class AmbulanceRideSerializer(serializers.ModelSerializer):
    ambulance_number = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    dispatched_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AmbulanceRide
        fields = [
            'id', 'ambulance', 'ambulance_number', 'patient', 'patient_name',
            'pickup_address', 'status', 'dispatched_by', 'dispatched_by_name',
            'driver_lat', 'driver_lng', 'created_at', 'updated_at'
        ]

    def get_ambulance_number(self, obj):
        return obj.ambulance.vehicle_number if obj.ambulance else None

    def get_patient_name(self, obj):
        if obj.patient:
            user = obj.patient.user
            return f"{user.first_name} {user.last_name}" if user else str(obj.patient)
        return None

    def get_dispatched_by_name(self, obj):
        if obj.dispatched_by:
            return f"{obj.dispatched_by.first_name} {obj.dispatched_by.last_name}"
        return None
