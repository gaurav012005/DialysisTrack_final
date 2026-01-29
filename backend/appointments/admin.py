from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['patient', 'appointment_date', 'shift', 'status']
    list_filter = ['status', 'appointment_date', 'shift']
    search_fields = ['patient__first_name', 'patient__last_name']