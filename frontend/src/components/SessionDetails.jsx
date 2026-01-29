import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../api/sessions';
import LoadingSpinner from './LoadingSpinner';

const SessionDetails = ({ sessionId, onClose }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const response = await sessionAPI.getById(sessionId);
      setSession(response.data);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!session) return <div>Session not found</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Dialysis Session Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="font-medium">Name:</span> {session.patient_details?.first_name} {session.patient_details?.last_name}</div>
              <div><span className="font-medium">Patient ID:</span> {session.patient_details?.patient_id}</div>
              <div><span className="font-medium">Blood Type:</span> {session.patient_details?.blood_type}</div>
              <div><span className="font-medium">Date:</span> {new Date(session.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Pre-Dialysis Vitals */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-green-700">Pre-Dialysis Vitals</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Blood Pressure</div>
                <div className="text-lg font-semibold">{session.pre_bp_systolic || 'N/A'}/{session.pre_bp_diastolic || 'N/A'} mmHg</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Heart Rate</div>
                <div className="text-lg font-semibold">{session.pre_heart_rate || 'N/A'} bpm</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Temperature</div>
                <div className="text-lg font-semibold">{session.pre_temperature || 'N/A'}°C</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">O2 Saturation</div>
                <div className="text-lg font-semibold">{session.pre_oxygen_saturation || 'N/A'}%</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Weight Before</div>
                <div className="text-lg font-semibold">{session.queue_details?.weight_before || 'N/A'} kg</div>
              </div>
            </div>
          </div>

          {/* Dialysis Parameters */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-blue-700">Dialysis Parameters</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Blood Flow Rate</div>
                <div className="text-lg font-semibold">{session.blood_flow_rate || 'N/A'} ml/min</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Dialysate Flow</div>
                <div className="text-lg font-semibold">{session.dialysate_flow_rate || 'N/A'} ml/min</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Ultrafiltration</div>
                <div className="text-lg font-semibold">{session.ultrafiltration_volume || 'N/A'} L</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Heparin Dose</div>
                <div className="text-lg font-semibold">{session.heparin_dose || 'N/A'} Units</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Machine</div>
                <div className="text-lg font-semibold">{session.queue_details?.assigned_machine || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Post-Dialysis Vitals */}
          {session.post_bp_systolic && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-purple-700">Post-Dialysis Vitals</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Blood Pressure</div>
                  <div className="text-lg font-semibold">{session.post_bp_systolic}/{session.post_bp_diastolic} mmHg</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Heart Rate</div>
                  <div className="text-lg font-semibold">{session.post_heart_rate} bpm</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Temperature</div>
                  <div className="text-lg font-semibold">{session.post_temperature}°C</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">O2 Saturation</div>
                  <div className="text-lg font-semibold">{session.post_oxygen_saturation}%</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Weight After</div>
                  <div className="text-lg font-semibold">{session.queue_details?.weight_after} kg</div>
                </div>
              </div>
            </div>
          )}

          {/* Medications */}
          {session.medications && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Medications Administered</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{session.medications}</p>
            </div>
          )}

          {/* Complications */}
          {session.complications && (
            <div className="border rounded-lg p-4 bg-yellow-50">
              <h3 className="font-semibold text-lg mb-2 text-yellow-800">Complications</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{session.complications}</p>
            </div>
          )}

          {/* Staff Notes */}
          <div className="grid grid-cols-2 gap-4">
            {session.nurse_notes && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Nurse Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{session.nurse_notes}</p>
                {session.attending_nurse_details && (
                  <div className="mt-2 text-sm text-gray-500">
                    By: {session.attending_nurse_details.username || session.attending_nurse_details.first_name}
                  </div>
                )}
              </div>
            )}
            {session.doctor_notes && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Doctor Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{session.doctor_notes}</p>
                {session.attending_doctor_details && (
                  <div className="mt-2 text-sm text-gray-500">
                    By: {session.attending_doctor_details.username || session.attending_doctor_details.first_name}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Session Timing */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Session Timing</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><span className="font-medium">Start:</span> {session.queue_details?.actual_start_time ? new Date(session.queue_details.actual_start_time).toLocaleString() : 'N/A'}</div>
              <div><span className="font-medium">End:</span> {session.queue_details?.actual_end_time ? new Date(session.queue_details.actual_end_time).toLocaleString() : 'N/A'}</div>
              <div><span className="font-medium">Duration:</span> {session.queue_details?.total_session_time ? `${Math.round(session.queue_details.total_session_time)} min` : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;
