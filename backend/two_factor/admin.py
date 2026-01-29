from django.contrib import admin
from django_otp.plugins.otp_totp.models import TOTPDevice
from .models import BackupCode


@admin.register(BackupCode)
class BackupCodeAdmin(admin.ModelAdmin):
    list_display = ['user', 'masked_code', 'is_used', 'created_at', 'used_at']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'used_at']
    
    def masked_code(self, obj):
        """Show masked code for security"""
        return f"{obj.code[:2]}******"
    masked_code.short_description = 'Code'
    
    def has_add_permission(self, request):
        """Prevent manual creation - use API only"""
        return False


# Customize TOTP Device admin
class TOTPDeviceAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'confirmed', 'created_at']
    list_filter = ['confirmed']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['key', 'created_at']
    
    def created_at(self, obj):
        return obj.t0  # django-otp uses t0 as timestamp
    created_at.short_description = 'Created'


# Unregister default and register custom
admin.site.unregister(TOTPDevice)
admin.site.register(TOTPDevice, TOTPDeviceAdmin)
