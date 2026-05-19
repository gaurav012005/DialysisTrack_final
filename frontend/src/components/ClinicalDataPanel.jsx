import React, { useState, useEffect } from 'react';
import { handleApiError, showSuccess } from '../utils/errorHandler';
import { downloadPrescriptionPDF, downloadLabReportPDF } from '../utils/pdfDownload';
import { FlaskConical, Pill, AlertTriangle, Plus, X, Download, Loader2 } from 'lucide-react';

const API = 'http://localhost:8000/api';
const getToken = () => localStorage.getItem('authToken');
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

/**
 * ClinicalDataPanel — embeddable prescriptions + lab results for a single patient.
 * Props:
 *   patientId   – required, the patient PK
 *   patientName – display name (optional)
 *   onClose     – callback to close / collapse the panel
 */
const ClinicalDataPanel = ({ patientId, patientName, onClose, readOnly = false }) => {
  const [tab, setTab] = useState('prescriptions');
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const patientInfo = { name: patientName || 'Patient', patient_id: '' };

  useEffect(() => { 
    if (patientId) {
      fetchData(); 
    } else {
      setLoading(false);
    }
  }, [patientId, tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'prescriptions') {
        const res = await fetch(`${API}/patients/prescriptions/?patient=${patientId}`, { headers: authHeaders() });
        if (res.ok) { const d = await res.json(); setPrescriptions((d.results || d || []).filter(r => String(r.patient) === String(patientId))); }
      } else {
        const res = await fetch(`${API}/patients/lab-results/?patient=${patientId}`, { headers: authHeaders() });
        if (res.ok) { const d = await res.json(); setLabResults((d.results || d || []).filter(r => String(r.patient) === String(patientId))); }
      }
    } catch (e) { handleApiError(e); }
    setLoading(false);
  };

  /* ── Prescription Form ── */
  const PrescriptionForm = () => {
    const [fd, setFd] = useState({ patient: patientId, session_duration_minutes: 240, frequency: '3_per_week', target_blood_flow_rate: 300, target_dialysate_flow_rate: 500, dialyzer_type: 'high_flux', dialyzer_model: '', heparin_dose: '', target_dry_weight: '', target_uf_volume: '', target_ktv: '1.2', dialysate_sodium: 140, dialysate_potassium: '2.0', dialysate_calcium: '2.5', dialysate_bicarbonate: 35, epo_dose: '', iron_dose: '', additional_medications: '', special_instructions: '', is_active: true, effective_date: new Date().toISOString().split('T')[0] });
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <h4 className="text-sm font-bold dark:text-white flex items-center gap-2"><Pill className="w-4 h-4 text-cyan-500" /> New Prescription</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Frequency *</label>
            <select value={fd.frequency} onChange={e => setFd({...fd, frequency: e.target.value})} className="input-field text-sm">
              <option value="2_per_week">2x / week</option><option value="3_per_week">3x / week</option>
              <option value="4_per_week">4x / week</option><option value="daily">Daily</option><option value="as_needed">As needed</option>
            </select></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Duration (min)</label>
            <input type="number" value={fd.session_duration_minutes} onChange={e => setFd({...fd, session_duration_minutes: e.target.value})} className="input-field text-sm" min="60" max="480" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Dialyzer Type</label>
            <select value={fd.dialyzer_type} onChange={e => setFd({...fd, dialyzer_type: e.target.value})} className="input-field text-sm">
              <option value="low_flux">Low Flux</option><option value="high_flux">High Flux</option><option value="super_flux">Super High Flux</option>
            </select></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Blood Flow (ml/min)</label>
            <input type="number" value={fd.target_blood_flow_rate} onChange={e => setFd({...fd, target_blood_flow_rate: e.target.value})} className="input-field text-sm" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Dialysate Flow (ml/min)</label>
            <input type="number" value={fd.target_dialysate_flow_rate} onChange={e => setFd({...fd, target_dialysate_flow_rate: e.target.value})} className="input-field text-sm" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Kt/V</label>
            <input type="number" step="0.01" value={fd.target_ktv} onChange={e => setFd({...fd, target_ktv: e.target.value})} className="input-field text-sm" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Effective Date *</label>
            <input type="date" value={fd.effective_date} onChange={e => setFd({...fd, effective_date: e.target.value})} className="input-field text-sm" required /></div>
        </div>
        <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Special Instructions</label>
          <textarea value={fd.special_instructions} onChange={e => setFd({...fd, special_instructions: e.target.value})} className="input-field text-sm" rows="2" /></div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-3 py-1.5">Cancel</button>
          <button type="submit" className="btn-primary text-sm px-3 py-1.5">Create</button>
        </div>
      </form>
    );
  };

  /* ── Lab Result Form ── */
  const LabResultForm = () => {
    const [fd, setFd] = useState({ patient: patientId, test_date: new Date().toISOString().split('T')[0], blood_urea_nitrogen: '', serum_creatinine: '', pre_dialysis_bun: '', post_dialysis_bun: '', hemoglobin: '', hematocrit: '', serum_potassium: '', serum_sodium: '', serum_calcium: '', serum_phosphorus: '', hbsag: '', anti_hcv: '', hiv: '', notes: '' });
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <h4 className="text-sm font-bold dark:text-white flex items-center gap-2"><FlaskConical className="w-4 h-4 text-cyan-500" /> New Lab Result</h4>
        <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Test Date *</label>
          <input type="date" value={fd.test_date} onChange={e => setFd({...fd, test_date: e.target.value})} className="input-field text-sm" required /></div>
        <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
          <p className="text-xs font-bold text-cyan-700 dark:text-cyan-400 mb-2 uppercase">Dialysis Adequacy (Kt/V & URR)</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Pre-Dialysis BUN</label>
              <input type="number" step="0.01" value={fd.pre_dialysis_bun} onChange={e => setFd({...fd, pre_dialysis_bun: e.target.value})} className="input-field text-sm" placeholder="mg/dL" /></div>
            <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Post-Dialysis BUN</label>
              <input type="number" step="0.01" value={fd.post_dialysis_bun} onChange={e => setFd({...fd, post_dialysis_bun: e.target.value})} className="input-field text-sm" placeholder="mg/dL" /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">BUN</label>
            <input type="number" step="0.01" value={fd.blood_urea_nitrogen} onChange={e => setFd({...fd, blood_urea_nitrogen: e.target.value})} className="input-field text-sm" /></div>
          <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Creatinine</label>
            <input type="number" step="0.01" value={fd.serum_creatinine} onChange={e => setFd({...fd, serum_creatinine: e.target.value})} className="input-field text-sm" /></div>
          <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hemoglobin</label>
            <input type="number" step="0.1" value={fd.hemoglobin} onChange={e => setFd({...fd, hemoglobin: e.target.value})} className="input-field text-sm" /></div>
          <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Potassium</label>
            <input type="number" step="0.1" value={fd.serum_potassium} onChange={e => setFd({...fd, serum_potassium: e.target.value})} className="input-field text-sm" /></div>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2 uppercase">Infection Screening</p>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">HBsAg</label>
              <select value={fd.hbsag} onChange={e => setFd({...fd, hbsag: e.target.value})} className="input-field text-sm">
                <option value="">-</option><option value="negative">Negative</option><option value="positive">Positive</option>
              </select></div>
            <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Anti-HCV</label>
              <select value={fd.anti_hcv} onChange={e => setFd({...fd, anti_hcv: e.target.value})} className="input-field text-sm">
                <option value="">-</option><option value="negative">Negative</option><option value="positive">Positive</option>
              </select></div>
            <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">HIV</label>
              <select value={fd.hiv} onChange={e => setFd({...fd, hiv: e.target.value})} className="input-field text-sm">
                <option value="">-</option><option value="negative">Negative</option><option value="positive">Positive</option>
              </select></div>
          </div>
        </div>
        <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</label>
          <textarea value={fd.notes} onChange={e => setFd({...fd, notes: e.target.value})} className="input-field text-sm" rows="2" /></div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-3 py-1.5">Cancel</button>
          <button type="submit" className="btn-primary text-sm px-3 py-1.5">Save</button>
        </div>
      </form>
    );
  };

  if (!patientId && !loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 text-center animate-in">
        <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-1">No Clinical Profile</h3>
        <p className="text-gray-500 dark:text-gray-400">Your patient profile has not been fully linked to a clinical record yet.</p>
        {onClose && (
          <button onClick={onClose} className="mt-4 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium">
            Close Panel
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden animate-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-700 dark:to-teal-700">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <FlaskConical className="w-4 h-4" /> Clinical Data
          </h3>
          {patientName && <p className="text-cyan-100 text-xs mt-0.5">{patientName}</p>}
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors">
              <Plus className="w-3 h-3" /> Add {tab === 'prescriptions' ? 'Rx' : 'Lab'}
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-md hover:bg-white/20 text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-700">
        {[
          { key: 'prescriptions', label: '💊 Prescriptions', icon: Pill },
          { key: 'lab-results', label: '🧪 Lab Results', icon: FlaskConical },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setShowForm(false); }}
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-all duration-200 border-b-2 ${
              tab === t.key
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-900/10'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
          </div>
        ) : showForm ? (
          tab === 'prescriptions' ? <PrescriptionForm /> : <LabResultForm />
        ) : (
          <>
            {/* Prescriptions */}
            {tab === 'prescriptions' && (
              prescriptions.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">No prescriptions yet.</p>
              ) : (
                <div className="space-y-2">
                  {prescriptions.map(rx => (
                    <div key={rx.id} className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/40 border border-gray-100 dark:border-slate-600">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {rx.frequency?.replace(/_/g, ' ')} · {rx.session_duration_minutes} min
                        </span>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          rx.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>{rx.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>Dialyzer: {rx.dialyzer_type?.replace(/_/g, ' ')}</span>
                        <span>Flow: {rx.target_blood_flow_rate} ml/min</span>
                        <span>Kt/V: {rx.target_ktv || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400 dark:text-gray-500">Effective: {rx.effective_date}</p>
                        <button
                          onClick={() => {
                            setDownloadingId(`rx-${rx.id}`);
                            setTimeout(() => {
                              try { downloadPrescriptionPDF(rx, patientInfo); } catch(e) { console.error(e); }
                              setDownloadingId(null);
                            }, 50);
                          }}
                          disabled={downloadingId === `rx-${rx.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
                            bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-300 dark:hover:bg-cyan-900/50
                            transition-colors disabled:opacity-50"
                        >
                          {downloadingId === `rx-${rx.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                          PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Lab Results */}
            {tab === 'lab-results' && (
              labResults.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">No lab results yet.</p>
              ) : (
                <div className="space-y-2">
                  {labResults.map(lab => (
                    <div key={lab.id} className={`p-3 rounded-lg border ${
                      lab.is_critical
                        ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'
                        : 'bg-gray-50 dark:bg-slate-700/40 border-gray-100 dark:border-slate-600'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{lab.test_date}</span>
                        {lab.is_critical ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800/50">
                            <AlertTriangle className="w-3 h-3" /> Critical
                          </span>
                        ) : <span className="text-xs text-green-600 dark:text-green-400">Normal</span>}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <span className={`${lab.hemoglobin && parseFloat(lab.hemoglobin) < 8 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                          Hb: {lab.hemoglobin || '-'} g/dL</span>
                        <span className={`${lab.serum_potassium && parseFloat(lab.serum_potassium) > 6 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                          K+: {lab.serum_potassium || '-'} mEq/L</span>
                        <span className={`${lab.urr !== null && lab.urr < 65 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-green-600 dark:text-green-400'}`}>
                          URR: {lab.urr !== null ? `${lab.urr}%` : '-'}</span>
                        <span className={`${lab.ktv_estimated !== null && lab.ktv_estimated < 1.2 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-green-600 dark:text-green-400'}`}>
                          Kt/V: {lab.ktv_estimated || '-'}</span>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => {
                            setDownloadingId(`lab-${lab.id}`);
                            setTimeout(() => {
                              try { downloadLabReportPDF(lab, patientInfo); } catch(e) { console.error(e); }
                              setDownloadingId(null);
                            }, 50);
                          }}
                          disabled={downloadingId === `lab-${lab.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
                            bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-300 dark:hover:bg-cyan-900/50
                            transition-colors disabled:opacity-50"
                        >
                          {downloadingId === `lab-${lab.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                          PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClinicalDataPanel;
