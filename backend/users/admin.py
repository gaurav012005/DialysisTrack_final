from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # List display
    list_display = ['username', 'email', 'get_full_name', 'role', 'department', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['role', 'department', 'is_active', 'is_staff', 'is_superuser', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']
    ordering = ['-date_joined']
    
    # Fieldsets for detail view
    fieldsets = (
        ('🔐 Login Information', {
            'fields': ('username', 'email', 'password')
        }),
        ('👤 Personal Information', {
            'fields': ('first_name', 'last_name', 'phone_number', 'date_of_birth', 'address')
        }),
        ('🏥 Professional Information', {
            'fields': ('role', 'department', 'hire_date')
        }),
        ('✅ Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('📅 Important Dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    # Fieldsets for add user
    add_fieldsets = (
        ('🔐 Login Information', {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
        ('👤 Personal Information', {
            'fields': ('first_name', 'last_name', 'phone_number')
        }),
        ('🏥 Professional Information', {
            'fields': ('role', 'department')
        }),
    )
    
    # Custom actions
    actions = ['activate_users', 'deactivate_users', 'make_staff', 'remove_staff']
    
    def get_full_name(self, obj):
        """Display full name"""
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
    get_full_name.short_description = 'Full Name'
    
    def activate_users(self, request, queryset):
        """Activate selected users"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} user(s) activated successfully.')
    activate_users.short_description = '✅ Activate selected users'
    
    def deactivate_users(self, request, queryset):
        """Deactivate selected users"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} user(s) deactivated successfully.')
    deactivate_users.short_description = '❌ Deactivate selected users'
    
    def make_staff(self, request, queryset):
        """Make selected users staff"""
        updated = queryset.update(is_staff=True)
        self.message_user(request, f'{updated} user(s) granted staff access.')
    make_staff.short_description = '👔 Grant staff access'
    
    def remove_staff(self, request, queryset):
        """Remove staff access"""
        updated = queryset.update(is_staff=False)
        self.message_user(request, f'{updated} user(s) staff access removed.')
    remove_staff.short_description = '🚫 Remove staff access'