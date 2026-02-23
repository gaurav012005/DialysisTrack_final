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
                'patients': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                'appointments': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                'dialysis_queue': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                'machines': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                'reports': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                'staff': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                'billing': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                'users': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                'two_factor': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                'fleet': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            },
            'doctor': {
                'patients': ['GET', 'POST', 'PUT', 'PATCH'],
                'appointments': ['GET', 'POST', 'PUT', 'PATCH'],
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
                'reports': ['GET'],  # View billing reports
                'fleet': ['GET'], # Tracking ambulance
            },
            'patient': {
                'appointments': ['GET'],  # View own appointments only
                'billing': ['GET'],  # View own billing only
                'reports': ['GET'],  # View own treatment reports
                'dialysis_queue': ['GET'], # Patients need to view queue
                'fleet': ['GET'], # Tracking ambulance
            }
        }
        
        # Admin has full access - return early
        if user_role == 'admin':
            return True
            
        # Get role permissions
        role_perms = permissions_map.get(user_role, {})
        
        # Extract app name from view - check app_name attribute first
        app_name = getattr(view, 'app_name', None)
        
        # Fallback to view name pattern matching if app_name is not explicitly set
        if not app_name:
            if 'patient' in view_name:
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
            elif 'fleet' in view_name or 'ambulance' in view_name or 'ride' in view_name:
                app_name = 'fleet'
            elif 'user' in view_name:
                app_name = 'users'
            elif 'twofactor' in view_name:
                app_name = 'two_factor'
            
        if app_name and app_name in role_perms:
            allowed_methods = role_perms[app_name]
            return method in allowed_methods
            
        # If we couldn't determine the app name or role has no explicit perms,
        # fail safe by denying access
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