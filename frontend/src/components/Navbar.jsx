import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from './RoleGuard';
import ThemeToggle from './ThemeToggle';
import {
  Crown, Stethoscope, Heart, Wrench, ClipboardList,
  Building2, User, AlertTriangle, BarChart3, PlusCircle, Truck
} from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { userRole } = usePermissions();

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      doctor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      nurse: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      technician: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
      receptionist: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
      patient: 'bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-300',
      driver: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-300';
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: Crown,
      doctor: Stethoscope,
      nurse: Heart,
      technician: Wrench,
      receptionist: ClipboardList,
      patient: Building2,
      driver: Truck
    };
    const IconComponent = icons[role] || User;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-lg border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="mr-4 md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600 dark:text-cyan-400">
                Dialysis<span className="text-gray-600 dark:text-gray-300">Track</span>
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <span className="text-gray-700 dark:text-gray-200">
                Welcome, {user?.first_name} {user?.last_name}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1.5 ${getRoleColor(userRole)}`}>
                {getRoleIcon(userRole)}
                <span className="capitalize">{userRole}</span>
              </span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Role-specific quick actions */}
            {userRole === 'nurse' && (
              <button className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 md:px-3 rounded text-sm flex items-center">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Emergency</span>
              </button>
            )}
            {userRole === 'doctor' && (
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 md:px-3 rounded text-sm flex items-center">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Reports</span>
              </button>
            )}
            {userRole === 'receptionist' && (
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-2 py-1 md:px-3 rounded text-sm flex items-center">
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">New Patient</span>
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg transition-colors duration-200 text-sm md:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;