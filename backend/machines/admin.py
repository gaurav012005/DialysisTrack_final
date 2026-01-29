from django.contrib import admin
from .models import DialysisMachine

@admin.register(DialysisMachine)
class DialysisMachineAdmin(admin.ModelAdmin):
    # List display
    list_display = ['machine_id', 'name', 'get_status_display', 'machine_type', 'manufacturer', 'last_maintenance_date', 'is_available']
    list_filter = ['status', 'machine_type', 'manufacturer', 'last_maintenance_date']
    search_fields = ['machine_id', 'name', 'manufacturer', 'model']
    ordering = ['machine_id']
    readonly_fields = ['machine_id', 'created_at', 'updated_at']
    
    # Fieldsets
    fieldsets = (
        ('🏥 Machine Information', {
            'fields': ('machine_id', 'name', 'machine_type', 'status')
        }),
        ('🔧 Technical Details', {
            'fields': ('manufacturer', 'model', 'serial_number', 'purchase_date', 'warranty_expiry')
        }),
        ('🛠️ Maintenance', {
            'fields': ('last_maintenance_date', 'next_maintenance_date', 'maintenance_interval_days')
        }),
        ('📊 Usage Statistics', {
            'fields': ('total_sessions', 'total_operating_hours', 'current_patient', 'current_session_start'),
            'classes': ('collapse',)
        }),
        ('📝 Additional Information', {
            'fields': ('water_quality_required', 'power_requirements', 'weight', 'dimensions', 'notes'),
            'classes': ('collapse',)
        }),
        ('📅 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Custom actions
    actions = ['mark_available', 'mark_in_use', 'mark_maintenance', 'mark_out_of_service']
    
    def get_status_display(self, obj):
        """Display status with color coding"""
        status_colors = {
            'available': '🟢',
            'in_use': '🔵',
            'maintenance': '🟡',
            'out_of_service': '🔴'
        }
        icon = status_colors.get(obj.status, '⚪')
        return f"{icon} {obj.get_status_display()}"
    get_status_display.short_description = 'Status'
    
    def is_available(self, obj):
        """Check if machine is available"""
        return obj.status == 'available'
    is_available.boolean = True
    is_available.short_description = 'Available?'
    
    def mark_available(self, request, queryset):
        """Mark machines as available"""
        updated = queryset.update(status='available')
        self.message_user(request, f'{updated} machine(s) marked as available.')
    mark_available.short_description = '🟢 Mark as Available'
    
    def mark_in_use(self, request, queryset):
        """Mark machines as in use"""
        updated = queryset.update(status='in_use')
        self.message_user(request, f'{updated} machine(s) marked as in use.')
    mark_in_use.short_description = '🔵 Mark as In Use'
    
    def mark_maintenance(self, request, queryset):
        """Mark machines for maintenance"""
        updated = queryset.update(status='maintenance')
        self.message_user(request, f'{updated} machine(s) marked for maintenance.')
    mark_maintenance.short_description = '🟡 Mark for Maintenance'
    
    def mark_out_of_service(self, request, queryset):
        """Mark machines as out of service"""
        updated = queryset.update(status='out_of_service')
        self.message_user(request, f'{updated} machine(s) marked as out of service.')
    mark_out_of_service.short_description = '🔴 Mark Out of Service'