from django.contrib import admin
from .models import Queue, QueueSettings, DialysisSession

class DialysisSessionInline(admin.TabularInline):
    """Inline editor for dialysis sessions"""
    model = DialysisSession
    extra = 0
    fields = ['attending_doctor', 'attending_nurse', 'blood_flow_rate', 'dialysate_flow_rate']
    readonly_fields = ['created_at']

@admin.register(Queue)
class QueueAdmin(admin.ModelAdmin):
    # List display
    list_display = ['queue_number', 'patient', 'get_status_display', 'get_priority_display', 'assigned_machine', 'check_in_time', 'estimated_wait_time']
    list_filter = ['status', 'priority', 'check_in_time']
    search_fields = ['queue_number', 'patient__first_name', 'patient__last_name', 'patient__patient_id']
    ordering = ['priority', 'check_in_time']
    readonly_fields = ['queue_number', 'check_in_time', 'created_at', 'updated_at']
    inlines = [DialysisSessionInline]
    
    # Fieldsets
    fieldsets = (
        ('🎫 Queue Information', {
            'fields': ('queue_number', 'patient', 'appointment', 'status', 'priority')
        }),
        ('🏥 Treatment Details', {
            'fields': ('assigned_machine', 'assigned_staff', 'check_in_time', 'estimated_wait_time', 'actual_start_time', 'actual_end_time')
        }),
        ('💉 Session Notes', {
            'fields': ('blood_pressure', 'weight_before', 'weight_after', 'notes'),
            'classes': ('collapse',)
        }),
        ('📅 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Custom actions
    actions = ['mark_waiting', 'mark_in_progress', 'mark_completed', 'mark_cancelled', 'set_high_priority', 'set_normal_priority']
    
    def get_status_display(self, obj):
        """Display status with icons"""
        status_icons = {
            'waiting': '⏳',
            'in_progress': '🔄',
            'completed': '✅',
            'cancelled': '❌'
        }
        icon = status_icons.get(obj.status, '⚪')
        return f"{icon} {obj.get_status_display()}"
    get_status_display.short_description = 'Status'
    
    def get_priority_display(self, obj):
        """Display priority with icons"""
        priority_icons = {
            'emergency': '🚨',
            'high': '🔴',
            'normal': '🟢',
            'low': '🔵'
        }
        icon = priority_icons.get(obj.priority, '⚪')
        return f"{icon} {obj.get_priority_display()}"
    get_priority_display.short_description = 'Priority'
    
    def mark_waiting(self, request, queryset):
        """Mark as waiting"""
        updated = queryset.update(status='waiting')
        self.message_user(request, f'{updated} queue entry(s) marked as waiting.')
    mark_waiting.short_description = '⏳ Mark as Waiting'
    
    def mark_in_progress(self, request, queryset):
        """Mark as in progress"""
        updated = queryset.update(status='in_progress')
        self.message_user(request, f'{updated} queue entry(s) marked as in progress.')
    mark_in_progress.short_description = '🔄 Mark as In Progress'
    
    def mark_completed(self, request, queryset):
        """Mark as completed"""
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} queue entry(s) marked as completed.')
    mark_completed.short_description = '✅ Mark as Completed'
    
    def mark_cancelled(self, request, queryset):
        """Mark as cancelled"""
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} queue entry(s) marked as cancelled.')
    mark_cancelled.short_description = '❌ Mark as Cancelled'
    
    def set_high_priority(self, request, queryset):
        """Set high priority"""
        updated = queryset.update(priority='high')
        self.message_user(request, f'{updated} queue entry(s) set to high priority.')
    set_high_priority.short_description = '🔴 Set High Priority'
    
    def set_normal_priority(self, request, queryset):
        """Set normal priority"""
        updated = queryset.update(priority='normal')
        self.message_user(request, f'{updated} queue entry(s) set to normal priority.')
    set_normal_priority.short_description = '🟢 Set Normal Priority'

@admin.register(QueueSettings)
class QueueSettingsAdmin(admin.ModelAdmin):
    list_display = ['max_emergency_cases', 'auto_assign_machines', 'id']
    
    def has_add_permission(self, request):
        # Only allow one settings instance
        return not QueueSettings.objects.exists()

@admin.register(DialysisSession)
class DialysisSessionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'queue', 'attending_doctor', 'attending_nurse', 'created_at']
    list_filter = ['created_at', 'attending_doctor', 'attending_nurse']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__patient_id']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('👤 Patient & Queue', {
            'fields': ('patient', 'queue')
        }),
        ('👨‍⚕️ Medical Staff', {
            'fields': ('attending_doctor', 'attending_nurse', 'created_by')
        }),
        ('💉 Pre-Dialysis Vitals', {
            'fields': ('pre_bp_systolic', 'pre_bp_diastolic', 'pre_heart_rate', 'pre_temperature', 'pre_oxygen_saturation')
        }),
        ('💉 Post-Dialysis Vitals', {
            'fields': ('post_bp_systolic', 'post_bp_diastolic', 'post_heart_rate', 'post_temperature', 'post_oxygen_saturation')
        }),
        ('⚙️ Dialysis Parameters', {
            'fields': ('blood_flow_rate', 'dialysate_flow_rate', 'ultrafiltration_volume', 'heparin_dose')
        }),
        ('💊 Medications & Notes', {
            'fields': ('medications', 'nurse_notes', 'doctor_notes')
        }),
        ('⚠️ Complications', {
            'fields': ('complications', 'adverse_events'),
            'classes': ('collapse',)
        }),
        ('📅 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )