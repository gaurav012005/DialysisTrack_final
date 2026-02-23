import React, { useState, useEffect } from 'react';
import PatientForm from '../components/PatientForm';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import RefreshButton from '../components/RefreshButton';
import { handleApiError, showSuccess } from '../utils/errorHandler';

const Patients = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <LoadingSpinner message="Loading patients..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage patient records and information</p>
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
        patients.length === 0 ? (
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
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age/Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {patient.first_name} {patient.last_name}
                              {patient.is_emergency && (
                                <span className="ml-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                  Emergency
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {patient.patient_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} / {patient.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${patient.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {patient.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(patient)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Patients;