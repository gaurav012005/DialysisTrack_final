import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../api/sessions';
import { useAuth } from '../context/AuthContext';
import SessionDetails from '../components/SessionDetails';
import PatientSessionHistory from '../components/PatientSessionHistory';
import ClinicalDataPanel from '../components/ClinicalDataPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import { downloadSessionPDF } from '../utils/pdfDownload';
import { FileText, Loader2, X, FlaskConical } from 'lucide-react';

const Sessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filter, setFilter]                 = useState('all');
  const [searchTerm, setSearchTerm]         = useState('');
  const [downloadingId, setDownloadingId]   = useState(null);
  const [clinicalPatient, setClinicalPatient] = useState(null);

  useEffect(() => { loadSessions(); }, []);

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
    const matchesFilter = filter === 'all' || session.queue_details?.status === filter;
    const patientName   = `${session.patient_details?.first_name || ''} ${session.patient_details?.last_name || ''}`.toLowerCase();
    const patientId     = (session.patient_details?.patient_id || '').toLowerCase();
    const matchesSearch = !searchTerm || patientName.includes(searchTerm.toLowerCase()) || patientId.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  /* ── PDF download for a single session row ── */
  const handleDownloadPDF = async (session) => {
    setDownloadingId(session.id);
    await new Promise(r => setTimeout(r, 50));
    try {
      downloadSessionPDF({
        id:   session.id,
        date: session.created_at,
        time: new Date(session.created_at).toTimeString().slice(0, 8),
        duration_minutes:    session.queue_details?.total_session_time
                               ? Math.round(session.queue_details.total_session_time) : null,
        machine_number:      session.queue_details?.assigned_machine || null,
        pre_dialysis_weight:  session.queue_details?.weight_before   || null,
        post_dialysis_weight: session.queue_details?.weight_after    || null,
        pre_bp_systolic:   session.pre_bp_systolic,
        pre_bp_diastolic:  session.pre_bp_diastolic,
        post_bp_systolic:  session.post_bp_systolic,
        post_bp_diastolic: session.post_bp_diastolic,
        pre_heart_rate:    session.pre_heart_rate,
        post_heart_rate:   session.post_heart_rate,
        ultrafiltration_volume: session.ultrafiltration_volume,
        complications: session.complications,
        notes: session.nurse_notes || session.doctor_notes,
      }, {
        name: `${session.patient_details?.first_name || ''} ${session.patient_details?.last_name || ''}`.trim(),
        patient_id: session.patient_details?.patient_id || 'N/A',
      });
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  /* ── Delete session ── */
  const handleDeleteSession = async (sessionId, patientName) => {
    if (!window.confirm(`Are you sure you want to completely delete this session for ${patientName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/sessions/${sessionId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok || response.status === 204) {
        setSessions(sessions.filter(s => s.id !== sessionId));
      } else {
        const errorText = await response.text();
        alert(`Failed to delete session: ${errorText}`);
      }
    } catch (err) {
      console.error('Delete session error:', err);
      alert('An error occurred while trying to delete the session.');
    }
  };

  /* ── Status badge ── */
  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
      status === 'completed'
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        : status === 'in_progress'
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    }`}>
      {status}
    </span>
  );

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Dialysis Sessions</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')}         className={filter === 'all'         ? 'btn-primary' : 'btn-secondary'}>All</button>
          <button onClick={() => setFilter('in_progress')} className={filter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}>In Progress</button>
          <button onClick={() => setFilter('completed')}   className={filter === 'completed'   ? 'btn-primary' : 'btn-secondary'}>Completed</button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by patient name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      {/* ── Sessions table ── */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredSessions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No sessions found</p>
          <p className="text-gray-400 dark:text-gray-500 mt-2">Start a dialysis session from the Queue page</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  {['Date', 'Patient', 'Status', 'Pre BP', 'Post BP', 'Duration', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      {new Date(session.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {session.patient_details?.first_name} {session.patient_details?.last_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {session.patient_details?.patient_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={session.queue_details?.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {session.pre_bp_systolic || session.pre_bp_diastolic
                        ? `${session.pre_bp_systolic || 'N/A'}/${session.pre_bp_diastolic || 'N/A'}`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {session.post_bp_systolic
                        ? `${session.post_bp_systolic}/${session.post_bp_diastolic}`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {session.queue_details?.total_session_time
                        ? `${Math.round(session.queue_details.total_session_time)} min`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* View session details */}
                        <button
                          onClick={() => setSelectedSession(session.id)}
                          className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300
                                     text-sm font-medium transition-colors"
                        >
                          View
                        </button>

                        {/* Clinical data */}
                        <button
                          onClick={() => setClinicalPatient(
                            clinicalPatient?.id === session.patient ? null : {
                              id: session.patient,
                              name: `${session.patient_details?.first_name || ''} ${session.patient_details?.last_name || ''}`.trim()
                            }
                          )}
                          className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                            clinicalPatient?.id === session.patient
                              ? 'text-teal-700 dark:text-teal-300 font-bold'
                              : 'text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300'
                          }`}
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          Clinical
                        </button>

                        {/* Patient history */}
                        <button
                          onClick={() => setSelectedPatient({
                            id:   session.patient,
                            name: `${session.patient_details?.first_name || ''} ${session.patient_details?.last_name || ''}`.trim()
                          })}
                          className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300
                                     text-sm font-medium transition-colors"
                        >
                          History
                        </button>

                        {/* Download session PDF */}
                        <button
                          onClick={() => handleDownloadPDF(session)}
                          disabled={downloadingId === session.id}
                          className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-800
                                     dark:text-violet-400 dark:hover:text-violet-300
                                     text-sm font-medium transition-colors
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {downloadingId === session.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <FileText className="w-3.5 h-3.5" />
                          }
                          {downloadingId === session.id ? 'PDF…' : 'PDF'}
                        </button>

                        {/* Delete Session */}
                        {user?.role !== 'patient' && (
                          <button
                            onClick={() => handleDeleteSession(session.id, `${session.patient_details?.first_name || ''} ${session.patient_details?.last_name || ''}`.trim())}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300
                                       text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clinical Data Panel — inline below sessions table */}
      {clinicalPatient && (
        <div className="mt-4" style={{ animation: 'slideDown 0.3s ease-out' }}>
          <ClinicalDataPanel
            patientId={clinicalPatient.id}
            patientName={clinicalPatient.name}
            onClose={() => setClinicalPatient(null)}
          />
        </div>
      )}

      {/* ── Session Details modal ── */}
      {selectedSession && (
        <SessionDetails
          sessionId={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {/* ── Patient History modal — dark themed ── */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl
                          max-w-5xl w-full max-h-[90vh] overflow-hidden
                          border border-gray-200 dark:border-slate-700
                          flex flex-col">
            {/* Modal header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700
                            px-6 py-4 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Patient History</h2>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white
                           hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal body */}
            <div className="p-6 overflow-y-auto">
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
