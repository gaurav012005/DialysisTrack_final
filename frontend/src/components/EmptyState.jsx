import React from 'react';

const EmptyState = ({ title, message, actionButton }) => (
  <div className="text-center py-12">
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4">{message}</p>
    {actionButton}
  </div>
);

export default EmptyState;