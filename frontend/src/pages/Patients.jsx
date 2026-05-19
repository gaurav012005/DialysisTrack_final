import React, { useState, useEffect } from 'react';
import PatientForm from '../components/PatientForm';
import ClinicalDataPanel from '../components/ClinicalDataPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import RefreshButton from '../components/RefreshButton';
import { handleApiError, showSuccess } from '../utils/errorHandler';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, FlaskConical, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../components/RoleGuard';

const Patients = () => {
  const navigate = useNavigate();
  const { hasModuleAccess, userRole } = usePermissions();
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, infection, consent_expired, screening_overdue
  const [clinicalPatient, setClinicalPatient] = useState(null); // patient whose clinical panel is open

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/patients/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data.results || data || []);
      } else {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      handleApiError(error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (patientData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Sending patient data:', patientData);

      const response = await fetch('http://localhost:8000/api/patients/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patientData)
      });

      if (response.ok) {
        const newPatient = await response.json();
        setPatients([...patients, newPatient]);
        setShowForm(false);

        // Show portal access credentials if created
        if (patientData.create_user_account && patientData.user_password) {
          alert(`Patient added successfully!\n\n🔐 Patient Portal Credentials:\nEmail: ${patientData.email}\nPassword: ${patientData.user_password}\n\nPlease share these credentials with the patient securely.`);
        } else {
          showSuccess('Patient added successfully!');
        }
      } else {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (typeof errorData === 'object') {
            errorMessage = Object.values(errorData).flat().join(', ');
          }
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }

        alert(`Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      if (!error.message.includes('HTTP')) {
        alert(`Network error: ${error.message}`);
      }
    }
  };

  const handleEditPatient = async (patientData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8000/api/patients/${editingPatient.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patientData)
      });

      if (response.ok) {
        const updatedPatient = await response.json();
        setPatients(patients.map(p =>
          p.id === editingPatient.id ? updatedPatient : p
        ));
        setEditingPatient(null);
        setShowForm(false);
        showSuccess('Patient updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      handleApiError(error);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDelete = async (patientId) => {
    if (confirm('Are you sure you want to delete this patient?')) {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`http://localhost:8000/api/patients/${patientId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setPatients(patients.filter(p => p.id !== patientId));
          showSuccess('Patient deleted successfully!');
        } else {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
          throw new Error(errorData.detail || `HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
        handleApiError(error);

      }
    }
  };

  // Get infection status badge
  const getInfectionBadge = (patient) => {
    const isPositive = patient.is_infection_positive || 
      patient.hepatitis_b_status === 'positive' || 
      patient.hepatitis_c_status === 'positive' || 
      patient.hiv_status === 'positive';

    if (isPositive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800/50">
          <XCircle className="w-3 h-3" /> Positive
        </span>
      );
    }
    
    const allNegative = patient.hepatitis_b_status === 'negative' && 
      patient.hepatitis_c_status === 'negative' && 
      patient.hiv_status === 'negative';
    
    if (allNegative) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800/50">
          <CheckCircle2 className="w-3 h-3" /> Clear
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        <AlertTriangle className="w-3 h-3" /> Unknown
      </span>
    );
  };

  // Get consent badge
  const getConsentBadge = (patient) => {
    if (patient.is_consent_valid || (patient.consent_given && !patient.consent_expiry_date)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800/50">
          <CheckCircle2 className="w-3 h-3" /> Valid
        </span>
      );
    }
    if (patient.consent_given && patient.consent_expiry_date) {
      const isExpired = new Date(patient.consent_expiry_date) < new Date();
      if (isExpired) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
            <AlertTriangle className="w-3 h-3" /> Expired
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800/50">
          <CheckCircle2 className="w-3 h-3" /> Valid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800/50">
        <XCircle className="w-3 h-3" /> Missing
      </span>
    );
  };

  // Filter patients
  const filteredPatients = patients.filter(p => {
    if (filter === 'infection') {
      return p.is_infection_positive || p.hepatitis_b_status === 'positive' || p.hepatitis_c_status === 'positive' || p.hiv_status === 'positive';
    }
    if (filter === 'consent_expired') {
      return !p.consent_given || !p.is_consent_valid;
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Loading patients..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Patient Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Manage patient records and information</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Add New Patient
          </button>
          <RefreshButton onClick={fetchPatients} loading={loading} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Patients', count: patients.length },
          { key: 'infection', label: '🦠 Infection+', count: patients.filter(p => p.is_infection_positive || p.hepatitis_b_status === 'positive' || p.hepatitis_c_status === 'positive' || p.hiv_status === 'positive').length },
          { key: 'consent_expired', label: '📋 Consent Due', count: patients.filter(p => !p.consent_given || !p.is_consent_valid).length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === tab.key
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25 dark:shadow-cyan-400/20'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {showForm ? (
        <PatientForm
          patient={editingPatient}
          onSubmit={editingPatient ? handleEditPatient : handleAddPatient}
          onCancel={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}
        />
      ) : (
        /* Patients Table */
        filteredPatients.length === 0 ? (
          <EmptyState
            title="No Patients Found"
            message="No patients are currently registered in the system."
            actionButton={
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Add First Patient
              </button>
            }
          />
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Age/Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Infection
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Consent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {patient.first_name} {patient.last_name}
                              {patient.is_emergency && (
                                <span className="ml-2 inline-block bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                                  Emergency
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {patient.patient_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {patient.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} / {patient.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getInfectionBadge(patient)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getConsentBadge(patient)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${patient.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          }`}>
                          {patient.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setClinicalPatient(clinicalPatient?.id === patient.id ? null : patient)}
                          className={`inline-flex items-center gap-1 transition-colors ${
                            clinicalPatient?.id === patient.id
                              ? 'text-teal-700 dark:text-teal-300 font-bold'
                              : 'text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300'
                          }`}
                          title="View Clinical Data"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          Clinical
                        </button>
                        <button
                          onClick={() => handleEdit(patient)}
                          className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                        {hasModuleAccess('fleet') && (
                          <button
                            onClick={() => navigate('/ambulances')}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Book Ambulance"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Clinical Data Panel — slides in below the table for the selected patient */}
      {clinicalPatient && !showForm && (
        <div className="mt-4 animate-in" style={{ animation: 'slideDown 0.3s ease-out' }}>
          <ClinicalDataPanel
            patientId={clinicalPatient.id}
            patientName={`${clinicalPatient.first_name} ${clinicalPatient.last_name} (${clinicalPatient.patient_id})`}
            onClose={() => setClinicalPatient(null)}
          />
        </div>
      )}
    </div>
  );
};

export default Patients;