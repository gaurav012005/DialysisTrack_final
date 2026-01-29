import React from 'react';

const RefreshButton = ({ onClick, loading }) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className="btn-secondary"
  >
    {loading ? 'Refreshing...' : 'Refresh'}
  </button>
);

export default RefreshButton;