import React, { useState } from 'react';
import { sessionAPI } from '../api/sessions';

const SessionCompletionForm = ({ sessionId, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    post_bp_systolic: '',
    post_bp_diastolic: '',
    post_heart_rate: '',
    post_temperature: '',
    post_oxygen_saturation: '',
    ultrafiltration_volume: '',
    complications: '',
    adverse_events: '',
    doctor_notes: '',
    nurse_notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await sessionAPI.completeSession(sessionId, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Complete Dialysis Session</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>
          )}

          {/* Post-Dialysis Vitals */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4">Post-Dialysis Vitals</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">BP Systolic (mmHg)</label>
                <input
                  type="number"
                  name="post_bp_systolic"
                  value={formData.post_bp_systolic}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">BP Diastolic (mmHg)</label>
                <input
                  type="number"
                  name="post_bp_diastolic"
                  value={formData.post_bp_diastolic}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  name="post_heart_rate"
                  value={formData.post_heart_rate}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  name="post_temperature"
                  value={formData.post_temperature}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">O2 Saturation (%)</label>
                <input
                  type="number"
                  name="post_oxygen_saturation"
                  value={formData.post_oxygen_saturation}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ultrafiltration Volume (L)</label>
                <input
                  type="number"
                  step="0.01"
                  name="ultrafiltration_volume"
                  value={formData.ultrafiltration_volume}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Complications */}
          <div>
            <label className="block text-sm font-medium mb-1">Complications (if any)</label>
            <textarea
              name="complications"
              value={formData.complications}
              onChange={handleChange}
              rows="2"
              className="w-full border rounded px-3 py-2"
              placeholder="Describe any complications..."
            />
          </div>

          {/* Adverse Events */}
          <div>
            <label className="block text-sm font-medium mb-1">Adverse Events (if any)</label>
            <textarea
              name="adverse_events"
              value={formData.adverse_events}
              onChange={handleChange}
              rows="2"
              className="w-full border rounded px-3 py-2"
              placeholder="Describe any adverse events..."
            />
          </div>

          {/* Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nurse Notes</label>
              <textarea
                name="nurse_notes"
                value={formData.nurse_notes}
                onChange={handleChange}
                rows="3"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Doctor Notes</label>
              <textarea
                name="doctor_notes"
                value={formData.doctor_notes}
                onChange={handleChange}
                rows="3"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Completing...' : 'Complete Session'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionCompletionForm;
