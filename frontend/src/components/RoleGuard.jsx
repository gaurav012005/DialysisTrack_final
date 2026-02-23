import React from 'react';
import { useAuth } from '../context/AuthContext';

// Role-based access control configuration
const ROLE_PERMISSIONS = {
  admin: {
    modules: ['dashboard', 'patients', 'queue', 'machines', 'staff', 'billing', 'reports', 'fleet'],
    actions: {
      patients: ['view', 'add', 'edit', 'delete'],
      queue: ['view', 'add', 'edit', 'delete'],
      machines: ['view', 'add', 'edit', 'delete'],
      staff: ['view', 'add', 'edit', 'delete'],
      billing: ['view', 'add', 'edit', 'delete'],
      reports: ['view', 'export'],
      fleet: ['view', 'add', 'edit', 'delete']
    }
  },
  doctor: {
    modules: ['dashboard', 'patients', 'queue', 'machines', 'reports'],
    actions: {
      patients: ['view', 'add', 'edit'],
      queue: ['view', 'edit'],
      machines: ['view'],
      reports: ['view', 'export']
    }
  },
  nurse: {
    modules: ['dashboard', 'patients', 'queue', 'machines'],
    actions: {
      patients: ['view', 'edit'],
      queue: ['view', 'add', 'edit', 'delete'],
      machines: ['view', 'edit']
    }
  },
  technician: {
    modules: ['dashboard', 'machines', 'queue'],
    actions: {
      machines: ['view', 'add', 'edit'],
      queue: ['view', 'edit']
    }
  },
  receptionist: {
    modules: ['dashboard', 'patients', 'billing', 'fleet'],
    actions: {
      patients: ['view', 'add', 'edit'],
      billing: ['view', 'add', 'edit'],
      fleet: ['view', 'add', 'edit']
    }
  },
  patient: {
    modules: ['dashboard', 'appointments', 'billing', 'reports', 'fleet'],
    actions: {
      appointments: ['view'],
      billing: ['view'],
      reports: ['view'],
      fleet: ['view']
    }
  },
  driver: {
    modules: ['fleet'],
    actions: {
      fleet: ['view', 'edit']
    }
  }
};

// Component to check if user has access to a module
export const RoleGuard = ({ children, module, action = 'view', fallback = null }) => {
  const { user } = useAuth();

  if (!user || !user.role) {
    return fallback;
  }

  const userPermissions = ROLE_PERMISSIONS[user.role];

  if (!userPermissions) {
    return fallback;
  }

  // Check module access
  if (!userPermissions.modules.includes(module)) {
    return fallback;
  }

  // Check action access
  if (action !== 'view' && userPermissions.actions[module]) {
    if (!userPermissions.actions[module].includes(action)) {
      return fallback;
    }
  }

  return children;
};

// Hook to check permissions
export const usePermissions = () => {
  const { user } = useAuth();

  const hasModuleAccess = (module) => {
    if (!user || !user.role) return false;
    const permissions = ROLE_PERMISSIONS[user.role];
    return permissions ? permissions.modules.includes(module) : false;
  };

  const hasActionAccess = (module, action) => {
    if (!user || !user.role) return false;
    const permissions = ROLE_PERMISSIONS[user.role];
    if (!permissions || !permissions.actions[module]) return false;
    return permissions.actions[module].includes(action);
  };

  const getAccessibleModules = () => {
    if (!user || !user.role) return [];
    const permissions = ROLE_PERMISSIONS[user.role];
    return permissions ? permissions.modules : [];
  };

  return {
    hasModuleAccess,
    hasActionAccess,
    getAccessibleModules,
    userRole: user?.role
  };
};

export default RoleGuard;