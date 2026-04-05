from django.contrib import admin
from .models import Notification, AuditLog, PasswordResetToken


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'notification_type', 'is_read', 'email_sent', 'created_at']
    list_filter = ['notification_type', 'is_read', 'email_sent']
    search_fields = ['title', 'message', 'user__email']


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'module', 'description', 'ip_address', 'created_at']
    list_filter = ['action', 'module']
    search_fields = ['description', 'user__email']
    readonly_fields = ['user', 'action', 'module', 'description', 'ip_address', 'created_at']


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'is_used', 'created_at', 'expires_at']
    list_filter = ['is_used']
