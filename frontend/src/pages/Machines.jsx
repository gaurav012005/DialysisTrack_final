import React, { useState, useEffect } from 'react';
import MachineCard from '../components/MachineCard';
import AddMachineModal from '../components/AddMachineModal';
import LoadingSpinner from '../components/LoadingSpinner';
import RefreshButton from '../components/RefreshButton';
import EmptyState from '../components/EmptyState';
import { handleApiError, showSuccess } from '../utils/errorHandler';

const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/machines/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const machinesData = data.results || data || [];

        // Transform API data to frontend format
        const transformedMachines = machinesData.map(machine => {
          console.log('Machine data:', machine); // Debug log
          return {
            id: machine.id,
            name: machine.name || `Machine ${machine.machine_id}`,
            type: machine.machine_type ? machine.machine_type.charAt(0).toUpperCase() + machine.machine_type.slice(1) : 'Hemodialysis',
            status: machine.status,
            lastMaintenance: machine.last_maintenance_date || 'Not set',
            nextMaintenance: machine.next_maintenance_date || 'Not set',
            currentPatient: machine.current_patient_details ? `${machine.current_patient_details.first_name} ${machine.current_patient_details.last_name}` : null,
            sessionStart: machine.current_session_start ? new Date(machine.current_session_start).toLocaleTimeString() : null
          };
        });

        console.log('Transformed machines:', transformedMachines); // Debug log
        setMachines(transformedMachines);
      } else {
        console.error('Failed to fetch machines:', response.status, response.statusText);
        if (response.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          return;
        }
        // Use fallback data if API fails
        setMachines([
          {
            id: 1,
            name: 'Dialysis Machine 1',
            type: 'Hemodialysis',
            status: 'available',
            lastMaintenance: '2025-09-18',
            nextMaintenance: '2025-12-17',
            currentPatient: null,
            sessionStart: null
          },
          {
            id: 2,
            name: 'Dialysis Machine 2',
            type: 'Hemodialysis',
            status: 'in_use',
            lastMaintenance: '2025-09-18',
            nextMaintenance: '2025-12-17',
            currentPatient: 'John Smith',
            sessionStart: '10:00 AM'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch machines:', error);
      // Use fallback data on error
      setMachines([
        {
          id: 1,
          name: 'Dialysis Machine 1',
          type: 'Hemodialysis',
          status: 'available',
          lastMaintenance: '2024-01-15',
          nextMaintenance: '2024-02-15',
          currentPatient: null,
          sessionStart: null
        },
        {
          id: 2,
          name: 'Dialysis Machine 2',
          type: 'Hemodialysis',
          status: 'in_use',
          lastMaintenance: '2024-01-10',
          nextMaintenance: '2024-02-10',
          currentPatient: 'John Smith',
          sessionStart: '10:00 AM'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateMachineStatus = async (machineId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/machines/${machineId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchMachines();
        showSuccess('Machine status updated successfully');
      } else {
        handleApiError(null, response);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading machines..." />;
  }

  const statusCount = machines.reduce((acc, machine) => {
    acc[machine.status] = (acc[machine.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dialysis Machines</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage and monitor dialysis equipment</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add New Machine
          </button>
          <RefreshButton onClick={fetchMachines} loading={loading} />
        </div>
      </div>

      {/* Machine Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{machines.length}</div>
          <div className="text-gray-600">Total Machines</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{statusCount.available || 0}</div>
          <div className="text-gray-600">Available</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{statusCount['in-use'] || 0}</div>
          <div className="text-gray-600">In Use</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{statusCount.maintenance || 0}</div>
          <div className="text-gray-600">Maintenance</div>
        </div>
      </div>

      {/* Machines Grid */}
      {machines.length === 0 ? (
        <EmptyState
          title="No Machines Found"
          message="No dialysis machines are currently registered in the system."
          actionButton={
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add First Machine
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {machines.map(machine => (
            <MachineCard
              key={machine.id}
              machine={machine}
              onStatusChange={updateMachineStatus}
            />
          ))}
        </div>
      )}

      {/* Add Machine Modal */}
      <AddMachineModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(newMachine) => {
          fetchMachines(); // Refresh the list
        }}
      />

      {/* Maintenance Schedule */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Maintenance Schedule</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Machine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {machines.map(machine => (
                <tr key={machine.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {machine.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {machine.lastMaintenance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {machine.nextMaintenance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${machine.status === 'available' ? 'bg-green-100 text-green-800' :
                      machine.status === 'in-use' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {machine.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Machines;