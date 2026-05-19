from django.contrib import admin
from .models import Patient, DialysisPrescription, LabResult

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    # List display
    list_display = ['patient_id', 'get_full_name', 'phone_number', 'blood_type', 'hepatitis_b_status', 'consent_given', 'is_emergency', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_emergency', 'blood_type', 'hepatitis_b_status', 'hepatitis_c_status', 'hiv_status', 'consent_given', 'created_at']
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
        ('🦠 Infection Status (CRITICAL for Machine Segregation)', {
            'fields': ('hepatitis_b_status', 'hepatitis_c_status', 'hiv_status', 'last_infection_screening_date', 'hepatitis_b_vaccinated'),
            'description': 'Hep B+ patients MUST use dedicated/isolated machines.'
        }),
        ('📋 Consent', {
            'fields': ('consent_given', 'consent_date', 'consent_expiry_date'),
            'description': 'Treatment cannot begin without valid consent.'
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


@admin.register(DialysisPrescription)
class DialysisPrescriptionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'frequency', 'session_duration_minutes', 'dialyzer_type', 'is_active', 'effective_date', 'prescribed_by']
    list_filter = ['is_active', 'frequency', 'dialyzer_type', 'effective_date']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__patient_id']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('👤 Patient & Doctor', {
            'fields': ('patient', 'prescribed_by', 'is_active', 'effective_date', 'expiry_date')
        }),
        ('⚙️ Session Parameters', {
            'fields': ('session_duration_minutes', 'frequency', 'target_blood_flow_rate', 'target_dialysate_flow_rate')
        }),
        ('🔬 Dialyzer', {
            'fields': ('dialyzer_type', 'dialyzer_model')
        }),
        ('💊 Anticoagulation', {
            'fields': ('heparin_dose', 'heparin_frequency')
        }),
        ('🎯 Targets', {
            'fields': ('target_dry_weight', 'target_uf_volume', 'target_ktv')
        }),
        ('🧪 Dialysate Composition', {
            'fields': ('dialysate_sodium', 'dialysate_potassium', 'dialysate_calcium', 'dialysate_bicarbonate'),
            'classes': ('collapse',)
        }),
        ('💉 Additional Medications', {
            'fields': ('epo_dose', 'iron_dose', 'additional_medications', 'special_instructions'),
            'classes': ('collapse',)
        }),
    )


@admin.register(LabResult)
class LabResultAdmin(admin.ModelAdmin):
    list_display = ['patient', 'test_date', 'hemoglobin', 'serum_potassium', 'serum_creatinine', 'get_urr', 'get_ktv', 'is_critical']
    list_filter = ['is_critical', 'test_date']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__patient_id']
    readonly_fields = ['created_at', 'is_critical']
    
    fieldsets = (
        ('👤 Patient Info', {
            'fields': ('patient', 'test_date', 'ordered_by', 'is_critical')
        }),
        ('🫘 Kidney Function', {
            'fields': ('blood_urea_nitrogen', 'serum_creatinine')
        }),
        ('📊 Dialysis Adequacy (Kt/V & URR)', {
            'fields': ('pre_dialysis_bun', 'post_dialysis_bun'),
            'description': 'Enter pre & post BUN to auto-calculate Kt/V and URR'
        }),
        ('🩸 CBC', {
            'fields': ('hemoglobin', 'hematocrit', 'wbc_count', 'platelet_count')
        }),
        ('⚡ Electrolytes', {
            'fields': ('serum_sodium', 'serum_potassium', 'serum_calcium', 'serum_phosphorus', 'serum_bicarbonate')
        }),
        ('🔬 Iron Studies', {
            'fields': ('serum_ferritin', 'transferrin_saturation'),
            'classes': ('collapse',)
        }),
        ('🧬 Other', {
            'fields': ('serum_albumin', 'pth'),
            'classes': ('collapse',)
        }),
        ('🦠 Infection Screening', {
            'fields': ('hbsag', 'anti_hcv', 'hiv'),
            'description': 'Results auto-update patient infection status'
        }),
        ('📝 Notes', {
            'fields': ('notes',)
        }),
    )
    
    def get_urr(self, obj):
        urr = obj.urr
        if urr is not None:
            color = 'green' if urr >= 65 else 'red'
            return f"{urr}%"
        return '-'
    get_urr.short_description = 'URR %'
    
    def get_ktv(self, obj):
        ktv = obj.ktv_estimated
        if ktv is not None:
            return f"{ktv}"
        return '-'
    get_ktv.short_description = 'Kt/V'

