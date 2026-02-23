import React, { useState } from 'react';
import SessionForm from './SessionForm';

const QueueCard = ({ patient, position, status, priority, emergency = false, onStatusChange, queueId, assignedMachine, assignedStaffName }) => {
  const [showSessionForm, setShowSessionForm] = useState(false);

  const statusColors = {
    waiting: 'bg-yellow-100 text-yellow-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const handleStartSession = () => {
    setShowSessionForm(true);
  };

  const handleSessionCreated = () => {
    setShowSessionForm(false);
    if (onStatusChange && queueId) {
      onStatusChange(queueId, 'in_progress');
    }
  };

  const handleEndSession = () => {
    if (onStatusChange && queueId) {
      onStatusChange(queueId, 'completed');
    }
  };

  const handleCancelSession = () => {
    if (confirm('Are you sure you want to cancel this session?')) {
      if (onStatusChange && queueId) {
        onStatusChange(queueId, 'cancelled');
      }
    }
  };

  return (
    <>
      <div className={`card ${emergency ? 'border-l-4 border-l-red-500' : ''}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${emergency ? 'bg-red-500' : 'bg-primary-500'
              } text-white font-bold text-lg`}>
              #{position}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {patient.first_name} {patient.last_name}
              </h3>
              <p className="text-gray-600">
                ID: {patient.patient_id} • Age: {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}
              </p>
              {(emergency || priority === 'emergency' || patient?.is_emergency) && (
                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">
                  🚨 Emergency
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || statusColors.waiting
              }`}>
              {status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Machine: {assignedMachine || 'Not assigned'}</span>
          <span>Staff: {assignedStaffName || 'Not assigned'}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex space-x-2">
          {status === 'waiting' && (
            <button
              onClick={handleStartSession}
              className="flex-1 btn-primary"
            >
              Start Session
            </button>
          )}
          {(status === 'in_progress' || status === 'in-progress') && (
            <button
              onClick={handleEndSession}
              className="flex-1 btn-success"
            >
              End Session
            </button>
          )}
          {(status === 'waiting' || status === 'in_progress' || status === 'in-progress') && (
            <button
              onClick={handleCancelSession}
              className="flex-1 btn-danger"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {showSessionForm && (
        <SessionForm
          queueId={queueId}
          patientId={patient.id}
          onSuccess={handleSessionCreated}
          onClose={() => setShowSessionForm(false)}
        />
      )}
    </>
  );
};

export default QueueCard;