import React, { useState } from 'react';

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
    is_emergency: patient?.is_emergency || false
  });

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

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {patient ? 'Edit Patient' : 'Add New Patient'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient ID *
          </label>
          <input
            type="text"
            name="patient_id"
            value={formData.patient_id}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender *
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact Name *
          </label>
          <input
            type="text"
            name="emergency_contact_name"
            value={formData.emergency_contact_name}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact Phone *
          </label>
          <input
            type="tel"
            name="emergency_contact_phone"
            value={formData.emergency_contact_phone}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blood Type
          </label>
          <select
            name="blood_type"
            value={formData.blood_type}
            onChange={handleChange}
            className="input-field"
          >
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

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address *
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows="2"
          className="input-field"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Diagnosis *
        </label>
        <textarea
          name="primary_diagnosis"
          value={formData.primary_diagnosis}
          onChange={handleChange}
          rows="2"
          className="input-field"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comorbidities
          </label>
          <textarea
            name="comorbidities"
            value={formData.comorbidities}
            onChange={handleChange}
            rows="2"
            className="input-field"
            placeholder="Other medical conditions"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allergies
          </label>
          <textarea
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            rows="2"
            className="input-field"
            placeholder="Known allergies"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Medications
        </label>
        <textarea
          name="current_medications"
          value={formData.current_medications}
          onChange={handleChange}
          rows="2"
          className="input-field"
          placeholder="List current medications"
        />
      </div>

      {/* Patient Portal Access - Only show for new patients */}
      {!patient && formData.email && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Patient Portal Access</h3>
              <p className="text-xs text-blue-700">Create login credentials for the patient</p>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={createPortalAccess}
                onChange={(e) => setCreatePortalAccess(e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-blue-800">Enable Portal Access</span>
            </label>
          </div>

          {createPortalAccess && (
            <div className="mt-3 space-y-3">
              <div className="text-sm text-blue-800">
                <strong>Login Email:</strong> {formData.email}
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
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
                    className="px-3 py-2 bg-blue-200 text-blue-800 rounded-lg hover:bg-blue-300 text-sm whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
                {patientPassword && (
                  <p className="text-xs text-green-700 mt-1">
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
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Emergency Case
          </span>
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {patient ? 'Update Patient' : 'Add Patient'}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;