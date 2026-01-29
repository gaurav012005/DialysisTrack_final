from django.contrib import admin
from .models import Patient

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    # List display
    list_display = ['patient_id', 'get_full_name', 'phone_number', 'blood_type', 'is_emergency', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_emergency', 'blood_type', 'created_at']
    search_fields = ['patient_id', 'first_name', 'last_name', 'phone_number', 'email']
    ordering = ['-created_at']
    readonly_fields = ['patient_id', 'created_at', 'updated_at']
    
    # Fieldsets for better organization
    fieldsets = (
        ('🆔 Patient Identification', {
            'fields': ('patient_id', 'first_name', 'last_name', 'date_of_birth', 'gender')
        }),
        ('📞 Contact Information', {
            'fields': ('phone_number', 'email', 'address', 'emergency_contact_name', 'emergency_contact_phone')
        }),
        ('🩺 Medical Information', {
            'fields': ('blood_type', 'primary_diagnosis', 'comorbidities', 'allergies', 'current_medications')
        }),
        ('💉 Dialysis Information', {
            'fields': ('dialysis_type', 'vascular_access', 'dry_weight', 'target_weight_loss')
        }),
        ('⚠️ Status', {
            'fields': ('is_active', 'is_emergency')
        }),
        ('📅 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Custom actions
    actions = ['mark_as_emergency', 'remove_emergency', 'activate_patients', 'deactivate_patients']
    
    def get_full_name(self, obj):
        """Display full name"""
        return f"{obj.first_name} {obj.last_name}"
    get_full_name.short_description = 'Full Name'
    get_full_name.admin_order_field = 'first_name'
    
    def mark_as_emergency(self, request, queryset):
        """Mark patients as emergency"""
        updated = queryset.update(is_emergency=True)
        self.message_user(request, f'{updated} patient(s) marked as emergency.')
    mark_as_emergency.short_description = '🚨 Mark as Emergency'
    
    def remove_emergency(self, request, queryset):
        """Remove emergency status"""
        updated = queryset.update(is_emergency=False)
        self.message_user(request, f'{updated} patient(s) emergency status removed.')
    remove_emergency.short_description = '✅ Remove Emergency Status'
    
    def activate_patients(self, request, queryset):
        """Activate patients"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} patient(s) activated.')
    activate_patients.short_description = '✅ Activate Patients'
    
    def deactivate_patients(self, request, queryset):
        """Deactivate patients"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} patient(s) deactivated.')
    deactivate_patients.short_description = '❌ Deactivate Patients'