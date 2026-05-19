import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import RefreshButton from '../components/RefreshButton';
import { handleApiError, showSuccess } from '../utils/errorHandler';
import { FlaskConical, Pill, AlertTriangle, CheckCircle2, XCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const API = 'http://localhost:8000/api';
const getToken = () => localStorage.getItem('authToken');
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const ClinicalManagement = () => {
  const [tab, setTab] = useState('prescriptions');
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => { fetchData(); }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await fetch(`${API}/patients/`, { headers: authHeaders() });
      if (pRes.ok) { const d = await pRes.json(); setPatients(d.results || d || []); }

      if (tab === 'prescriptions') {
        const res = await fetch(`${API}/patients/prescriptions/`, { headers: authHeaders() });
        if (res.ok) { const d = await res.json(); setPrescriptions(d.results || d || []); }
      } else {
        const res = await fetch(`${API}/patients/lab-results/`, { headers: authHeaders() });
        if (res.ok) { const d = await res.json(); setLabResults(d.results || d || []); }
      }
    } catch (e) { handleApiError(e); }
    setLoading(false);
  };

  // Prescription Form
  const PrescriptionForm = () => {
    const [fd, setFd] = useState({ patient: '', session_duration_minutes: 240, frequency: '3_per_week', target_blood_flow_rate: 300, target_dialysate_flow_rate: 500, dialyzer_type: 'high_flux', dialyzer_model: '', heparin_dose: '', target_dry_weight: '', target_uf_volume: '', target_ktv: '1.2', dialysate_sodium: 140, dialysate_potassium: '2.0', dialysate_calcium: '2.5', dialysate_bicarbonate: 35, epo_dose: '', iron_dose: '', additional_medications: '', special_instructions: '', is_active: true, effective_date: new Date().toISOString().split('T')[0] });
    const handleSubmit = async (e) => {
      e.preventDefault();
      const body = { ...fd };
      if (!body.heparin_dose) delete body.heparin_dose;
      if (!body.target_dry_weight) delete body.target_dry_weight;
      if (!body.target_uf_volume) delete body.target_uf_volume;
      try {
        const res = await fetch(`${API}/patients/prescriptions/`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
        if (res.ok) { showSuccess('Prescription created!'); setShowForm(false); fetchData(); }
        else { const err = await res.json().catch(() => ({})); handleApiError(new Error(JSON.stringify(err))); }
      } catch (e) { handleApiError(e); }
    };
    return (
      <form onSubmit={handleSubmit} className="card max-w-3xl mx-auto space-y-4">
        <h3 className="text-lg font-bold dark:text-white flex items-center gap-2"><Pill className="w-5 h-5 text-cyan-500" /> New Prescription</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Patient *</label>
            <select value={fd.patient} onChange={e => setFd({...fd, patient: e.target.value})} className="input-field" required>
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.patient_id})</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency *</label>
            <select value={fd.frequency} onChange={e => setFd({...fd, frequency: e.target.value})} className="input-field">
              <option value="2_per_week">2x per week</option><option value="3_per_week">3x per week</option>
              <option value="4_per_week">4x per week</option><option value="daily">Daily</option><option value="as_needed">As needed</option>
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Duration (min)</label>
            <input type="number" value={fd.session_duration_minutes} onChange={e => setFd({...fd, session_duration_minutes: e.target.value})} className="input-field" min="60" max="480" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dialyzer Type</label>
            <select value={fd.dialyzer_type} onChange={e => setFd({...fd, dialyzer_type: e.target.value})} className="input-field">
              <option value="low_flux">Low Flux</option><option value="high_flux">High Flux</option><option value="super_flux">Super High Flux</option>
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Flow Rate (ml/min)</label>
            <input type="number" value={fd.target_blood_flow_rate} onChange={e => setFd({...fd, target_blood_flow_rate: e.target.value})} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dialysate Flow Rate (ml/min)</label>
            <input type="number" value={fd.target_dialysate_flow_rate} onChange={e => setFd({...fd, target_dialysate_flow_rate: e.target.value})} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Kt/V</label>
            <input type="number" step="0.01" value={fd.target_ktv} onChange={e => setFd({...fd, target_ktv: e.target.value})} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Effective Date *</label>
            <input type="date" value={fd.effective_date} onChange={e => setFd({...fd, effective_date: e.target.value})} className="input-field" required /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Instructions</label>
          <textarea value={fd.special_instructions} onChange={e => setFd({...fd, special_instructions: e.target.value})} className="input-field" rows="2" /></div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Create Prescription</button>
        </div>
      </form>
    );
  };

  // Lab Result Form
  const LabResultForm = () => {
    const [fd, setFd] = useState({ patient: '', test_date: new Date().toISOString().split('T')[0], blood_urea_nitrogen: '', serum_creatinine: '', pre_dialysis_bun: '', post_dialysis_bun: '', hemoglobin: '', hematocrit: '', serum_potassium: '', serum_sodium: '', serum_calcium: '', serum_phosphorus: '', hbsag: '', anti_hcv: '', hiv: '', notes: '' });
    const handleSubmit = async (e) => {
      e.preventDefault();
      const body = {};
      Object.entries(fd).forEach(([k, v]) => { if (v !== '' && v !== null) body[k] = v; });
      try {
        const res = await fetch(`${API}/patients/lab-results/`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
        if (res.ok) { showSuccess('Lab result saved!'); setShowForm(false); fetchData(); }
        else { const err = await res.json().catch(() => ({})); handleApiError(new Error(JSON.stringify(err))); }
      } catch (e) { handleApiError(e); }
    };
    return (
      <form onSubmit={handleSubmit} className="card max-w-3xl mx-auto space-y-4">
        <h3 className="text-lg font-bold dark:text-white flex items-center gap-2"><FlaskConical className="w-5 h-5 text-cyan-500" /> New Lab Result</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Patient *</label>
            <select value={fd.patient} onChange={e => setFd({...fd, patient: e.target.value})} className="input-field" required>
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.patient_id})</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Date *</label>
            <input type="date" value={fd.test_date} onChange={e => setFd({...fd, test_date: e.target.value})} className="input-field" required /></div>
        </div>
        <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
          <p className="text-xs font-bold text-cyan-700 dark:text-cyan-400 mb-2 uppercase">Dialysis Adequacy (Kt/V & URR)</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Pre-Dialysis BUN</label>
              <input type="number" step="0.01" value={fd.pre_dialysis_bun} onChange={e => setFd({...fd, pre_dialysis_bun: e.target.value})} className="input-field" placeholder="mg/dL" /></div>
            <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Post-Dialysis BUN</label>
              <input type="number" step="0.01" value={fd.post_dialysis_bun} onChange={e => setFd({...fd, post_dialysis_bun: e.target.value})} className="input-field" placeholder="mg/dL" /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">BUN (mg/dL)</label>
            <input type="number" step="0.01" value={fd.blood_urea_nitrogen} onChange={e => setFd({...fd, blood_urea_nitrogen: e.target.value})} className="input-field" /></div>
          <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Creatinine</label>
            <input type="number" step="0.01" value={fd.serum_creatinine} onChange={e => setFd({...fd, serum_creatinine: e.target.value})} className="input-field" /></div>
          <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hemoglobin (g/dL)</label>
            <input type="number" step="0.1" value={fd.hemoglobin} onChange={e => setFd({...fd, hemoglobin: e.target.value})} className="input-field" /></div>
          <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Potassium (mEq/L)</label>
            <input type="number" step="0.1" value={fd.serum_potassium} onChange={e => setFd({...fd, serum_potassium: e.target.value})} className="input-field" /></div>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2 uppercase">Infection Screening</p>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">HBsAg</label>
              <select value={fd.hbsag} onChange={e => setFd({...fd, hbsag: e.target.value})} className="input-field">
                <option value="">-</option><option value="negative">Negative</option><option value="positive">Positive</option>
              </select></div>
            <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Anti-HCV</label>
              <select value={fd.anti_hcv} onChange={e => setFd({...fd, anti_hcv: e.target.value})} className="input-field">
                <option value="">-</option><option value="negative">Negative</option><option value="positive">Positive</option>
              </select></div>
            <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">HIV</label>
              <select value={fd.hiv} onChange={e => setFd({...fd, hiv: e.target.value})} className="input-field">
                <option value="">-</option><option value="negative">Negative</option><option value="positive">Positive</option>
              </select></div>
          </div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea value={fd.notes} onChange={e => setFd({...fd, notes: e.target.value})} className="input-field" rows="2" /></div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Save Lab Result</button>
        </div>
      </form>
    );
  };

  if (loading) return <LoadingSpinner message="Loading clinical data..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Clinical Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Prescriptions, Lab Results & Dialysis Adequacy</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add {tab === 'prescriptions' ? 'Prescription' : 'Lab Result'}</button>
          <RefreshButton onClick={fetchData} loading={loading} />
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2">
        {[{ key: 'prescriptions', label: '💊 Prescriptions', icon: Pill }, { key: 'lab-results', label: '🧪 Lab Results', icon: FlaskConical }].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setShowForm(false); }}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${tab === t.key
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25 dark:shadow-cyan-400/20'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {showForm ? (tab === 'prescriptions' ? <PrescriptionForm /> : <LabResultForm />) : (
        <>
          {/* Prescriptions Table */}
          {tab === 'prescriptions' && (
            <div className="card">
              {prescriptions.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No prescriptions found. Click "Add Prescription" to create one.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead><tr>
                      {['Patient', 'Frequency', 'Duration', 'Dialyzer', 'Blood Flow', 'Kt/V Target', 'Status', 'Effective'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {prescriptions.map(rx => (
                        <tr key={rx.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{rx.patient_name || `Patient #${rx.patient}`}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{rx.frequency?.replace(/_/g, ' ')}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{rx.session_duration_minutes} min</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{rx.dialyzer_type?.replace(/_/g, ' ')}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{rx.target_blood_flow_rate} ml/min</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{rx.target_ktv || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${rx.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                              {rx.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{rx.effective_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Lab Results Table */}
          {tab === 'lab-results' && (
            <div className="card">
              {labResults.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No lab results found. Click "Add Lab Result" to create one.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead><tr>
                      {['Patient', 'Date', 'Hb (g/dL)', 'K+ (mEq/L)', 'Cr (mg/dL)', 'URR %', 'Kt/V', 'Critical'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {labResults.map(lab => (
                        <tr key={lab.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors ${lab.is_critical ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{lab.patient_name || `Patient #${lab.patient}`}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{lab.test_date}</td>
                          <td className="px-4 py-3 text-sm"><span className={lab.hemoglobin && parseFloat(lab.hemoglobin) < 8 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-700 dark:text-gray-300'}>{lab.hemoglobin || '-'}</span></td>
                          <td className="px-4 py-3 text-sm"><span className={lab.serum_potassium && parseFloat(lab.serum_potassium) > 6 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-700 dark:text-gray-300'}>{lab.serum_potassium || '-'}</span></td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{lab.serum_creatinine || '-'}</td>
                          <td className="px-4 py-3 text-sm"><span className={lab.urr !== null && lab.urr < 65 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-green-600 dark:text-green-400'}>{lab.urr !== null ? `${lab.urr}%` : '-'}</span></td>
                          <td className="px-4 py-3 text-sm"><span className={lab.ktv_estimated !== null && lab.ktv_estimated < 1.2 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-green-600 dark:text-green-400'}>{lab.ktv_estimated || '-'}</span></td>
                          <td className="px-4 py-3">{lab.is_critical ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800/50">
                              <AlertTriangle className="w-3 h-3" /> Critical
                            </span>
                          ) : <span className="text-xs text-green-600 dark:text-green-400">Normal</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClinicalManagement;
