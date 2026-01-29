import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../api/sessions';
import SessionDetails from './SessionDetails';
import LoadingSpinner from './LoadingSpinner';

const PatientSessionHistory = ({ patientId, patientName }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [patientId]);

  const loadHistory = async () => {
    try {
      const response = await sessionAPI.getPatientHistory(patientId);
      setSessions(response.data);
    } catch (error) {
      console.error('Error loading session history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Dialysis Session History - {patientName}</h2>
      
      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No session history found</div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-lg font-semibold">
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      session.queue_details?.status === 'completed' ? 'bg-green-100 text-green-800' :
                      session.queue_details?.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.queue_details?.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Pre BP:</span>
                      <span className="ml-2 font-medium">{session.pre_bp_systolic || 'N/A'}/{session.pre_bp_diastolic || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Post BP:</span>
                      <span className="ml-2 font-medium">
                        {session.post_bp_systolic ? `${session.post_bp_systolic}/${session.post_bp_diastolic}` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">UF Volume:</span>
                      <span className="ml-2 font-medium">{session.ultrafiltration_volume || 'N/A'} L</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium">
                        {session.queue_details?.total_session_time ? `${Math.round(session.queue_details.total_session_time)} min` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {session.complications && (
                    <div className="mt-2 text-sm text-red-600">
                      ⚠️ Complications noted
                    </div>
                  )}

                  <div className="mt-2 text-sm text-gray-600">
                    <span>Doctor: {session.attending_doctor_details?.username || session.attending_doctor_details?.first_name || 'N/A'}</span>
                    <span className="mx-2">|</span>
                    <span>Nurse: {session.attending_nurse_details?.username || session.attending_nurse_details?.first_name || 'N/A'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSession(session.id)}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSession && (
        <SessionDetails
          sessionId={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};

export default PatientSessionHistory;
