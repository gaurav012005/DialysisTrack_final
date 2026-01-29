import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from './RoleGuard';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { hasModuleAccess, userRole } = usePermissions();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      onClose && onClose();
    }
  }, [location.pathname]);

  // Define all menu items with role requirements
  const allMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', module: 'dashboard' },
    { path: '/patients', label: 'Patients', icon: '👥', module: 'patients' },
    { path: '/queue', label: 'Dialysis Queue', icon: '🔄', module: 'queue' },
    { path: '/sessions', label: 'Session Details', icon: '📋', module: 'queue' },
    { path: '/machines', label: 'Machines', icon: '⚙️', module: 'machines' },
    { path: '/staff', label: 'Staff Management', icon: '👩⚕️', module: 'staff' },
    { path: '/billing', label: 'Billing', icon: '💰', module: 'billing' },
    { path: '/reports', label: 'Reports', icon: '📈', module: 'reports' },
  ];

  // Patient-specific menu items
  const patientMenuItems = [
    { path: '/dashboard', label: 'My Dashboard', icon: '📊', module: 'dashboard' },
    { path: '/appointments', label: 'My Appointments', icon: '📅', module: 'appointments' },
    { path: '/billing', label: 'My Bills', icon: '💰', module: 'billing' },
    { path: '/reports', label: 'My Reports', icon: '📈', module: 'reports' },
  ];

  // Filter menu items based on user role
  const menuItems = userRole === 'patient'
    ? patientMenuItems.filter(item => hasModuleAccess(item.module))
    : allMenuItems.filter(item => hasModuleAccess(item.module));

  const isActive = (path) => location.pathname === path;

  // Role-based sidebar title
  const getSidebarTitle = () => {
    const titles = {
      admin: 'Admin Panel',
      doctor: 'Doctor Portal',
      nurse: 'Nurse Station',
      technician: 'Tech Console',
      receptionist: 'Reception Desk',
      patient: 'Patient Portal'
    };
    return titles[userRole] || 'Hospital System';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 min-h-screen bg-gray-800 text-white p-4
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="mb-8 flex justify-between items-start">
          <div className="w-full">
            <h2 className="text-xl font-bold text-center">{getSidebarTitle()}</h2>
            <p className="text-sm text-gray-400 text-center mt-1 capitalize">
              {userRole} Access
            </p>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Role indicator */}
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-gray-700 rounded-lg">
          <div className="text-xs text-gray-400">Logged in as:</div>
          <div className="text-sm font-semibold capitalize">{userRole}</div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;