import React from 'react';

const MachineCard = ({ machine, onStatusChange }) => {
  const statusConfig = {
    available: { color: 'bg-green-500', label: 'Available' },
    'in-use': { color: 'bg-blue-500', label: 'In Use' },
    maintenance: { color: 'bg-red-500', label: 'Maintenance' },
    cleaning: { color: 'bg-yellow-500', label: 'Cleaning' }
  };

  const config = statusConfig[machine.status] || statusConfig.available;

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg">{machine.name}</h3>
        <span className={`${config.color} text-white px-3 py-1 rounded-full text-sm font-medium`}>
          {config.label}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="font-medium">{machine.type || 'Hemodialysis'}</span>
        </div>
        <div className="flex justify-between">
          <span>Last Maintenance:</span>
          <span className="font-medium">{machine.lastMaintenance || 'Not set'}</span>
        </div>
        <div className="flex justify-between">
          <span>Next Maintenance:</span>
          <span className="font-medium">{machine.nextMaintenance || 'Not scheduled'}</span>
        </div>
        
        {machine.currentPatient && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">Current Patient:</p>
            <p className="text-sm">{machine.currentPatient}</p>
            <p className="text-xs text-gray-500">Started: {machine.sessionStart}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex space-x-2">
        {machine.status === 'available' && (
          <button 
            onClick={() => {
              if (onStatusChange) {
                onStatusChange(machine.id, 'in_use');
              }
            }}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm"
          >
            Start Use
          </button>
        )}
        {machine.status === 'in_use' && (
          <button 
            onClick={() => {
              if (onStatusChange) {
                onStatusChange(machine.id, 'available');
              }
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm"
          >
            End Session
          </button>
        )}
        {machine.status === 'maintenance' && (
          <button 
            onClick={() => {
              if (onStatusChange) {
                onStatusChange(machine.id, 'available');
              }
            }}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded text-sm"
          >
            Complete Maintenance
          </button>
        )}
        <button 
          onClick={() => {
            if (onStatusChange) {
              onStatusChange(machine.id, 'maintenance');
            }
          }}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm"
        >
          Maintenance
        </button>
      </div>
    </div>
  );
};

export default MachineCard;