from django.contrib import admin
from .models import StaffSchedule

@admin.register(StaffSchedule)
class StaffScheduleAdmin(admin.ModelAdmin):
    list_display = ['staff', 'shift_date', 'shift_type', 'is_present']
    list_filter = ['shift_type', 'is_present']
    search_fields = ['staff__username']