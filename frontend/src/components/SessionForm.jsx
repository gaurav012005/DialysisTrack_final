import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../api/sessions';

const SessionForm = ({ queueId, patientId, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    queue: queueId,
    patient: patientId,
    pre_bp_systolic: '',
    pre_bp_diastolic: '',
    pre_heart_rate: '',
    pre_temperature: '',
    pre_oxygen_saturation: '',
    blood_flow_rate: '',
    dialysate_flow_rate: '',
    heparin_dose: '',
    medications: '',
    nurse_notes: '',
    assigned_machine: '',
    assigned_staff: ''
  });
  const [machines, setMachines] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMachinesAndStaff();
  }, []);

  const fetchMachinesAndStaff = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');

      // Fetch machines
      const machinesRes = await fetch('http://localhost:8000/api/machines/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (machinesRes.ok) {
        const machinesData = await machinesRes.json();
        setMachines((machinesData.results || machinesData).filter(m => m.status === 'available'));
      }

      // Fetch staff (doctors and nurses)
      const staffRes = await fetch('http://localhost:8000/api/auth/users/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff((staffData.results || staffData).filter(u => ['doctor', 'nurse'].includes(u.role)));
      }
    } catch (err) {
      console.error('Error fetching machines/staff:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First update queue with machine and staff assignment
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      if (formData.assigned_machine || formData.assigned_staff) {
        await fetch(`http://localhost:8000/api/queue/${queueId}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            assigned_machine: formData.assigned_machine,
            assigned_staff: formData.assigned_staff || null
          })
        });
      }

      // Then create session
      await sessionAPI.create(formData);
      onSuccess();
    } catch (err) {
      console.error('Session creation error:', err.response?.data);
      const errorMsg = err.response?.data?.detail ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        'Failed to create session';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Start Dialysis Session</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>
          )}

          {/* Pre-Dialysis Vitals */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4">Resource Assignment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Assign Machine</label>
                <select
                  name="assigned_machine"
                  value={formData.assigned_machine}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">-- Select Machine --</option>
                  {machines.map(m => (
                    <option key={m.id} value={m.machine_id}>
                      {m.machine_id} - {m.machine_type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign Staff</label>
                <select
                  name="assigned_staff"
                  value={formData.assigned_staff}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">-- Select Staff --</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pre-Dialysis Vitals */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4">Pre-Dialysis Vitals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">BP Systolic (mmHg)</label>
                <input
                  type="number"
                  name="pre_bp_systolic"
                  value={formData.pre_bp_systolic}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">BP Diastolic (mmHg)</label>
                <input
                  type="number"
                  name="pre_bp_diastolic"
                  value={formData.pre_bp_diastolic}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  name="pre_heart_rate"
                  value={formData.pre_heart_rate}
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
                  name="pre_temperature"
                  value={formData.pre_temperature}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">O2 Saturation (%)</label>
                <input
                  type="number"
                  name="pre_oxygen_saturation"
                  value={formData.pre_oxygen_saturation}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dialysis Parameters */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4">Dialysis Parameters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Blood Flow Rate (ml/min)</label>
                <input
                  type="number"
                  name="blood_flow_rate"
                  value={formData.blood_flow_rate}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dialysate Flow Rate (ml/min)</label>
                <input
                  type="number"
                  name="dialysate_flow_rate"
                  value={formData.dialysate_flow_rate}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heparin Dose (Units)</label>
                <input
                  type="number"
                  step="0.01"
                  name="heparin_dose"
                  value={formData.heparin_dose}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Medications */}
          <div>
            <label className="block text-sm font-medium mb-1">Medications Administered</label>
            <textarea
              name="medications"
              value={formData.medications}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded px-3 py-2"
              placeholder="List all medications given..."
            />
          </div>

          {/* Nurse Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Nurse Notes</label>
            <textarea
              name="nurse_notes"
              value={formData.nurse_notes}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded px-3 py-2"
              placeholder="Any observations or notes..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Start Session'}
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

export default SessionForm;
