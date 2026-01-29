import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-lg animate-pulse">{message}</div>
  </div>
);

export default LoadingSpinner;