from django.contrib import admin
from .models import Ambulance, AmbulanceRide


@admin.register(Ambulance)
class AmbulanceAdmin(admin.ModelAdmin):
    list_display = ('vehicle_number', 'driver', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('vehicle_number',)


@admin.register(AmbulanceRide)
class AmbulanceRideAdmin(admin.ModelAdmin):
    list_display = ('id', 'ambulance', 'patient', 'status', 'dispatched_by', 'created_at')
    list_filter = ('status',)
    search_fields = ('ambulance__vehicle_number',)
