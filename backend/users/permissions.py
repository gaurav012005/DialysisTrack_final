from rest_framework import permissions

class HospitalRolePermission(permissions.BasePermission):
    """
    Real-world hospital role-based access control
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = request.user.role
        method = request.method
        view_name = view.__class__.__name__.lower()
        
        # Define real hospital role permissions
        permissions_map = {
            'admin': {
                'all': True  # Full system access
            },
            'doctor': {
                'patients': ['GET', 'POST', 'PUT', 'PATCH'],
                'appointments': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                'dialysis_queue': ['GET', 'POST', 'PUT', 'PATCH'],
                'machines': ['GET'],
                'reports': ['GET'],
                'staff': ['GET'],
                'billing': ['GET']
            },
            'nurse': {
                'patients': ['GET', 'PUT', 'PATCH'],
                'dialysis_queue': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                'machines': ['GET', 'PUT', 'PATCH'],
                'appointments': ['GET', 'PUT', 'PATCH'],
                'reports': ['GET'],
                'staff': ['GET']
            },
            'technician': {
                'machines': ['GET', 'POST', 'PUT', 'PATCH'],  # Full machine management
                'dialysis_queue': ['GET', 'PUT', 'PATCH'],  # View and update queue status
                'patients': ['GET'],  # View patient basic info
                'reports': ['GET']  # View machine reports
            },
            'receptionist': {
                'patients': ['GET', 'POST', 'PUT', 'PATCH'],  # Patient registration & updates
                'appointments': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],  # Full appointment management
                'billing': ['GET', 'POST', 'PUT', 'PATCH'],  # Full billing operations
                'dialysis_queue': ['GET'],  # View queue for scheduling
                'staff': ['GET'],  # View staff availability
                'reports': ['GET']  # View billing reports
            },
            'patient': {
                'appointments': ['GET'],  # View own appointments only
                'billing': ['GET'],  # View own billing only
                'reports': ['GET']  # View own treatment reports
            }
        }
        
        # Admin has full access - return early
        if user_role == 'admin':
            return True
            
        # Get role permissions
        role_perms = permissions_map.get(user_role, {})
        
        # Extract app name from view - check app_name attribute first
        app_name = None
        
        # First, check if view has app_name attribute (most reliable)
        if hasattr(view, 'app_name'):
            app_name = view.app_name
        # Fallback to view name pattern matching
        elif 'patient' in view_name:
            app_name = 'patients'
        elif 'appointment' in view_name:
            app_name = 'appointments'
        elif 'session' in view_name or 'queue' in view_name:
            app_name = 'dialysis_queue'
        elif 'machine' in view_name:
            app_name = 'machines'
        elif 'staff' in view_name:
            app_name = 'staff'
        elif 'billing' in view_name:
            app_name = 'billing'
        elif 'report' in view_name:
            app_name = 'reports'
            
        if app_name and app_name in role_perms:
            allowed_methods = role_perms[app_name]
            return method in allowed_methods
            
        return False
    
    def has_object_permission(self, request, view, obj):
        """Object-level permissions for patient data access"""
        user_role = request.user.role
        
        # Admin and medical staff can access all records
        if user_role in ['admin', 'doctor', 'nurse']:
            return True
            
        # Patients can only access their own records
        if user_role == 'patient':
            if hasattr(obj, 'patient'):
                return obj.patient.user == request.user
            elif hasattr(obj, 'user'):
                return obj.user == request.user
                
        # Receptionist can access patient records for admin purposes
        if user_role == 'receptionist':
            return True
            
        return False

class IsAdminOrDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'doctor']

class IsMedicalStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'doctor', 'nurse']

class IsPatientOrMedicalStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'doctor', 'nurse', 'patient']