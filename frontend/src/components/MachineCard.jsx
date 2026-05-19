import React from 'react';

const MachineCard = ({ machine, onStatusChange, onDelete }) => {
  const statusConfig = {
    available:      { color: 'bg-green-500',  label: 'Available' },
    in_use:         { color: 'bg-blue-500',   label: 'In Use' },
    maintenance:    { color: 'bg-red-500',    label: 'Maintenance' },
    cleaning:       { color: 'bg-yellow-500', label: 'Cleaning' },
    out_of_service: { color: 'bg-gray-600',   label: 'Out of Service' },
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

        {/* Current Patient — always visible, updates after End Session */}
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-800">Current Patient:</p>
          {machine.status === 'in_use' && machine.currentPatient ? (
            <>
              <p className="text-sm font-semibold text-blue-700">{machine.currentPatient}</p>
              {machine.sessionStart && (
                <p className="text-xs text-gray-500">Started: {machine.sessionStart}</p>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-400 italic">No patient assigned</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        {machine.status === 'available' && (
          <button
            onClick={() => onStatusChange && onStatusChange(machine.id, 'start_use')}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm"
          >
            Start Use
          </button>
        )}

        {machine.status === 'in_use' && (
          <button
            onClick={() => onStatusChange && onStatusChange(machine.id, 'end_session')}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm"
          >
            End Session
          </button>
        )}

        {machine.status === 'maintenance' && (
          <>
            <div className="flex-1 bg-orange-50 border border-orange-300 text-orange-700 py-2 px-3 rounded text-xs text-center font-medium">
              🔧 Under Maintenance — session not possible
            </div>
            <button
              onClick={() => onStatusChange && onStatusChange(machine.id, 'complete_maintenance')}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded text-sm"
            >
              Complete Maintenance
            </button>
          </>
        )}

        {machine.status === 'cleaning' && (
          <button
            onClick={() => onStatusChange && onStatusChange(machine.id, 'complete_cleaning')}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 px-3 rounded text-sm"
          >
            Complete Cleaning
          </button>
        )}

        {/* Maintenance button only for available/in_use machines */}
        {(machine.status === 'available' || machine.status === 'in_use') && (
          <button
            onClick={() => onStatusChange && onStatusChange(machine.id, 'maintenance')}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm"
          >
            Maintenance
          </button>
        )}
      </div>


      {onDelete && (
        <div className="mt-2 flex">
          <button
            onClick={() => {
              if (window.confirm(`Remove machine "${machine.name}" from the system?`)) {
                onDelete(machine.id);
              }
            }}
            className="w-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-1 px-3 rounded text-sm font-medium transition-colors duration-200"
          >
            Remove Machine
          </button>
        </div>
      )}
    </div>
  );
};

export default MachineCard;