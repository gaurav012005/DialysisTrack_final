import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../api/sessions';
import { useAuth } from '../context/AuthContext';
import SessionDetails from '../components/SessionDetails';
import PatientSessionHistory from '../components/PatientSessionHistory';
import LoadingSpinner from '../components/LoadingSpinner';

const Sessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await sessionAPI.getAll();
      setSessions(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    return session.queue_details?.status === filter;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Dialysis Sessions</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
          >
            All
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={filter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'btn-primary' : 'btn-secondary'}
          >
            Completed
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No sessions found</p>
          <p className="text-gray-400 mt-2">Start a dialysis session from the Queue page</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pre BP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post BP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(session.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{session.patient_details?.first_name} {session.patient_details?.last_name}</div>
                        <div className="text-sm text-gray-500">{session.patient_details?.patient_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${session.queue_details?.status === 'completed' ? 'bg-green-100 text-green-800' :
                        session.queue_details?.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {session.queue_details?.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.pre_bp_systolic || session.pre_bp_diastolic ?
                        `${session.pre_bp_systolic || 'N/A'}/${session.pre_bp_diastolic || 'N/A'}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.post_bp_systolic ? `${session.post_bp_systolic}/${session.post_bp_diastolic}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.queue_details?.total_session_time ? `${Math.round(session.queue_details.total_session_time)} min` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedSession(session.id)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setSelectedPatient({ id: session.patient, name: `${session.patient_details?.first_name} ${session.patient_details?.last_name}` })}
                        className="text-green-600 hover:text-green-800"
                      >
                        History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedSession && (
        <SessionDetails
          sessionId={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Patient History</h2>
              <button onClick={() => setSelectedPatient(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6">
              <PatientSessionHistory
                patientId={selectedPatient.id}
                patientName={selectedPatient.name}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sessions;
