import React, { useState } from 'react';
import { ShieldAlert, FileCheck, Syringe } from 'lucide-react';

const PatientForm = ({ patient = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    patient_id: patient?.patient_id || '',
    first_name: patient?.first_name || '',
    last_name: patient?.last_name || '',
    date_of_birth: patient?.date_of_birth || '',
    gender: patient?.gender || '',
    blood_type: patient?.blood_type || '',
    phone_number: patient?.phone_number || '',
    email: patient?.email || '',
    address: patient?.address || '',
    emergency_contact_name: patient?.emergency_contact_name || '',
    emergency_contact_phone: patient?.emergency_contact_phone || '',
    primary_diagnosis: patient?.primary_diagnosis || '',
    comorbidities: patient?.comorbidities || '',
    allergies: patient?.allergies || '',
    current_medications: patient?.current_medications || '',
    dialysis_type: patient?.dialysis_type || '',
    vascular_access: patient?.vascular_access || '',
    dry_weight: patient?.dry_weight || '',
    target_weight_loss: patient?.target_weight_loss || '',
    is_emergency: patient?.is_emergency || false,
    // Infection Status
    hepatitis_b_status: patient?.hepatitis_b_status || 'unknown',
    hepatitis_c_status: patient?.hepatitis_c_status || 'unknown',
    hiv_status: patient?.hiv_status || 'unknown',
    last_infection_screening_date: patient?.last_infection_screening_date || '',
    hepatitis_b_vaccinated: patient?.hepatitis_b_vaccinated || false,
    // Consent
    consent_given: patient?.consent_given || false,
    consent_date: patient?.consent_date || '',
    consent_expiry_date: patient?.consent_expiry_date || '',
  });

  // Active section for accordion-style form
  const [activeSection, setActiveSection] = useState('basic');

  // Patient portal access (optional user account creation)
  const [createPortalAccess, setCreatePortalAccess] = useState(false);
  const [patientPassword, setPatientPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Generate a random secure password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPass = generatePassword();
    setPatientPassword(newPass);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Auto-generate patient_id if empty
    const submitData = { ...formData };
    if (!submitData.patient_id) {
      submitData.patient_id = `P${Date.now().toString().slice(-6)}`;
    }

    // Clean up empty date fields
    if (!submitData.last_infection_screening_date) delete submitData.last_infection_screening_date;
    if (!submitData.consent_date) delete submitData.consent_date;
    if (!submitData.consent_expiry_date) delete submitData.consent_expiry_date;

    // Add portal access data if enabled
    if (createPortalAccess && formData.email && patientPassword) {
      submitData.create_user_account = true;
      submitData.user_password = patientPassword;
    }

    onSubmit(submitData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Section toggle helper
  const SectionHeader = ({ id, icon: Icon, title, color = 'cyan' }) => (
    <button
      type="button"
      onClick={() => setActiveSection(activeSection === id ? '' : id)}
      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
        activeSection === id
          ? `bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800`
          : 'bg-gray-50 dark:bg-slate-800/60 border border-transparent hover:border-gray-200 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${activeSection === id ? `text-${color}-600 dark:text-${color}-400` : 'text-gray-500 dark:text-gray-400'}`} />
        <span className={`font-medium text-sm ${activeSection === id ? `text-${color}-700 dark:text-${color}-300` : 'text-gray-700 dark:text-gray-300'}`}>
          {title}
        </span>
      </div>
      <svg className={`w-4 h-4 transition-transform ${activeSection === id ? 'rotate-180' : ''} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="card max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        {patient ? 'Edit Patient' : 'Add New Patient'}
      </h2>

      {/* Basic Information - Always visible */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Patient ID *</label>
            <input type="text" name="patient_id" value={formData.patient_id} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name *</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="input-field" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth *</label>
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="input-field" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender *</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="input-field" required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="input-field" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emergency Contact Name *</label>
            <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className="input-field" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emergency Contact Phone *</label>
            <input type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blood Type</label>
            <select name="blood_type" value={formData.blood_type} onChange={handleChange} className="input-field">
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address *</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="input-field" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Diagnosis *</label>
          <textarea name="primary_diagnosis" value={formData.primary_diagnosis} onChange={handleChange} rows="2" className="input-field" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comorbidities</label>
            <textarea name="comorbidities" value={formData.comorbidities} onChange={handleChange} rows="2" className="input-field" placeholder="Other medical conditions" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allergies</label>
            <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows="2" className="input-field" placeholder="Known allergies" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Medications</label>
          <textarea name="current_medications" value={formData.current_medications} onChange={handleChange} rows="2" className="input-field" placeholder="List current medications" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vascular Access</label>
            <select name="vascular_access" value={formData.vascular_access} onChange={handleChange} className="input-field">
              <option value="">Select Access Type</option>
              <option value="av_fistula">AV Fistula</option>
              <option value="av_graft">AV Graft</option>
              <option value="tunneled_catheter">Tunneled Catheter (Permcath)</option>
              <option value="temporary_catheter">Temporary Catheter</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dry Weight (kg)</label>
            <input type="number" step="0.01" name="dry_weight" value={formData.dry_weight} onChange={handleChange} className="input-field" placeholder="e.g. 65.50" />
          </div>
        </div>
      </div>

      {/* Infection Status Section */}
      <div className="mb-4 p-4 rounded-xl border-2 border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10">
        <div className="flex items-center gap-2 mb-4">
          <Syringe className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
            🦠 Infection Status (Critical for Machine Segregation)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hepatitis B (HBsAg)</label>
            <select name="hepatitis_b_status" value={formData.hepatitis_b_status} onChange={handleChange} className="input-field">
              <option value="unknown">Unknown / Not Tested</option>
              <option value="negative">Negative</option>
              <option value="positive">Positive ⚠️</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hepatitis C (Anti-HCV)</label>
            <select name="hepatitis_c_status" value={formData.hepatitis_c_status} onChange={handleChange} className="input-field">
              <option value="unknown">Unknown / Not Tested</option>
              <option value="negative">Negative</option>
              <option value="positive">Positive ⚠️</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">HIV Status</label>
            <select name="hiv_status" value={formData.hiv_status} onChange={handleChange} className="input-field">
              <option value="unknown">Unknown / Not Tested</option>
              <option value="negative">Negative</option>
              <option value="positive">Positive ⚠️</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Screening Date</label>
            <input type="date" name="last_infection_screening_date" value={formData.last_infection_screening_date} onChange={handleChange} className="input-field" />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="hepatitis_b_vaccinated" checked={formData.hepatitis_b_vaccinated} onChange={handleChange}
                className="rounded border-gray-300 dark:border-slate-600 text-cyan-600 focus:ring-cyan-500 w-4 h-4" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hepatitis B Vaccinated</span>
            </label>
          </div>
        </div>
        {(formData.hepatitis_b_status === 'positive' || formData.hepatitis_c_status === 'positive' || formData.hiv_status === 'positive') && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
            <p className="text-sm font-medium text-red-800 dark:text-red-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              ⚠️ This patient requires ISOLATED/DEDICATED dialysis machines.
            </p>
          </div>
        )}
      </div>

      {/* Consent Section */}
      <div className="mb-4 p-4 rounded-xl border-2 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            📋 Consent Management
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center pt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="consent_given" checked={formData.consent_given} onChange={handleChange}
                className="rounded border-gray-300 dark:border-slate-600 text-cyan-600 focus:ring-cyan-500 w-4 h-4" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Consent Signed</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Consent Date</label>
            <input type="date" name="consent_date" value={formData.consent_date} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
            <input type="date" name="consent_expiry_date" value={formData.consent_expiry_date} onChange={handleChange} className="input-field" />
          </div>
        </div>
        {!formData.consent_given && (
          <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              ⚠️ Treatment cannot begin without valid consent (except emergencies).
            </p>
          </div>
        )}
      </div>

      {/* Patient Portal Access - Only show for new patients */}
      {!patient && formData.email && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">Patient Portal Access</h3>
              <p className="text-xs text-blue-700 dark:text-blue-400">Create login credentials for the patient</p>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={createPortalAccess}
                onChange={(e) => setCreatePortalAccess(e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Enable Portal Access</span>
            </label>
          </div>

          {createPortalAccess && (
            <div className="mt-3 space-y-3">
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Login Email:</strong> {formData.email}
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Password (min 6 characters)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="Enter patient password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-3 py-2 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-300 dark:hover:bg-blue-700 text-sm whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
                {patientPassword && (
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    ✓ Password set. Share these credentials with the patient securely.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_emergency"
            checked={formData.is_emergency}
            onChange={handleChange}
            className="rounded border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            🚨 Emergency Case
          </span>
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">{patient ? 'Update Patient' : 'Add Patient'}</button>
      </div>
    </form>
  );
};

export default PatientForm;