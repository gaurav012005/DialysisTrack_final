import React from 'react';
import { usePermissions } from './RoleGuard';

const ActionButton = ({ 
  children, 
  onClick, 
  module, 
  action = 'edit', 
  className = '', 
  variant = 'primary',
  disabled = false,
  ...props 
}) => {
  const { hasActionAccess } = usePermissions();
  
  // Check if user has permission for this action
  if (!hasActionAccess(module, action)) {
    return null; // Don't render button if no permission
  }
  
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
  };
  
  const variantClasses = variants[variant] || variants.primary;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ActionButton;