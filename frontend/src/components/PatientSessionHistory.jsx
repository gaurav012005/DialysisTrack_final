import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../api/sessions';
import SessionDetails from './SessionDetails';
import LoadingSpinner from './LoadingSpinner';
import { downloadSessionPDF } from '../utils/pdfDownload';
import { FileText, Loader2 } from 'lucide-react';

const PatientSessionHistory = ({ patientId, patientName }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

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

  /** Build a normalised session object for the PDF generator */
  const buildPdfSession = (session) => ({
    id: session.id,
    date: session.created_at,
    time: new Date(session.created_at).toTimeString().slice(0, 8),
    duration_minutes: session.queue_details?.total_session_time
      ? Math.round(session.queue_details.total_session_time)
      : null,
    machine_number: session.queue_details?.assigned_machine || null,
    pre_dialysis_weight:  session.queue_details?.weight_before   || null,
    post_dialysis_weight: session.queue_details?.weight_after    || null,
    pre_bp_systolic:   session.pre_bp_systolic,
    pre_bp_diastolic:  session.pre_bp_diastolic,
    post_bp_systolic:  session.post_bp_systolic,
    post_bp_diastolic: session.post_bp_diastolic,
    pre_heart_rate:    session.pre_heart_rate,
    post_heart_rate:   session.post_heart_rate,
    pre_temperature:   session.pre_temperature,
    post_temperature:  session.post_temperature,
    ultrafiltration_volume: session.ultrafiltration_volume,
    complications: session.complications,
    notes: session.nurse_notes || session.doctor_notes,
  });

  const handleDownloadPDF = async (session) => {
    setDownloadingId(session.id);
    await new Promise(r => setTimeout(r, 50)); // let spinner render
    try {
      downloadSessionPDF(buildPdfSession(session), { name: patientName });
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Dialysis Session History &ndash; {patientName}
      </h2>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No session history found
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const status   = session.queue_details?.status;
            const duration = session.queue_details?.total_session_time;

            return (
              <div
                key={session.id}
                className="border border-gray-200 dark:border-slate-600 rounded-xl p-4
                           bg-white dark:bg-slate-800/60
                           hover:shadow-md dark:hover:shadow-slate-700/40
                           transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-4">
                  {/* ── Left: session info ── */}
                  <div className="flex-1 min-w-0">
                    {/* Date + Status badge */}
                    <div className="flex items-center flex-wrap gap-3 mb-3">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {new Date(session.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {status}
                      </span>
                    </div>

                    {/* Vitals grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Pre BP:</span>
                        <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                          {session.pre_bp_systolic || 'N/A'}/{session.pre_bp_diastolic || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Post BP:</span>
                        <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                          {session.post_bp_systolic
                            ? `${session.post_bp_systolic}/${session.post_bp_diastolic}`
                            : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">UF Volume:</span>
                        <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                          {session.ultrafiltration_volume || 'N/A'} L
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                        <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                          {duration ? `${Math.round(duration)} min` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Complications */}
                    {session.complications && (
                      <div className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                        ⚠️ Complications noted
                      </div>
                    )}

                    {/* Doctor / Nurse */}
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>Doctor: {session.attending_doctor_details?.username || session.attending_doctor_details?.first_name || 'N/A'}</span>
                      <span className="mx-2 text-gray-300 dark:text-slate-600">|</span>
                      <span>Nurse: {session.attending_nurse_details?.username || session.attending_nurse_details?.first_name || 'N/A'}</span>
                    </div>
                  </div>

                  {/* ── Right: action buttons ── */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {/* View Details — matches the dark teal btn-primary style */}
                    <button
                      onClick={() => setSelectedSession(session.id)}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      View Details
                    </button>

                    {/* Download PDF — btn-secondary outline style, same width */}
                    <button
                      onClick={() => handleDownloadPDF(session)}
                      disabled={downloadingId === session.id}
                      className="btn-secondary px-4 py-2 text-sm flex items-center justify-center gap-1.5
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {downloadingId === session.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        : <FileText className="w-3.5 h-3.5 shrink-0" />
                      }
                      {downloadingId === session.id ? 'Generating…' : 'Download PDF'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
