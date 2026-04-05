import React, { useState, useEffect } from 'react';
import QueueCard from '../components/QueueCard';
import AddPatientToQueueModal from '../components/AddPatientToQueueModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import RefreshButton from '../components/RefreshButton';
import { AlertTriangle, Search } from 'lucide-react';

const Queue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/queue/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const queueData = data.results || data || [];

        // Add position to each queue item
        const queueWithPositions = queueData.map((item, index) => ({
          ...item,
          position: item.queue_number || (index + 1)
        }));

        setQueue(queueWithPositions);
      } else {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading queue..." />;
  }

  const moveToNext = async (queueId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/queue/${queueId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (response.ok) {
        setQueue(queue.map(item =>
          item.id === queueId
            ? { ...item, status: 'completed' }
            : item
        ));
      }
    } catch (error) {
      console.error('Failed to update queue status:', error);
    }
  };

  const updateQueueStatus = async (queueId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use specific endpoints for start/complete actions
      let endpoint = `http://localhost:8000/api/queue/${queueId}/`;
      let method = 'PATCH';
      let body = { status: newStatus };

      if (newStatus === 'in_progress') {
        endpoint = `http://localhost:8000/api/queue/${queueId}/start_treatment/`;
        method = 'POST';
        body = {};
      } else if (newStatus === 'completed') {
        endpoint = `http://localhost:8000/api/queue/${queueId}/complete_treatment/`;
        method = 'POST';
        body = {};
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        fetchQueue(); // Refresh the queue
      } else {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to update queue status:', error);
      alert(`Error updating queue: ${error.message}`);
    }
  };

  const markAllEmergency = async () => {
    if (!confirm('Mark all waiting patients as emergency? This will prioritize them in the queue.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const waitingPatients = queue.filter(item => item.status === 'waiting');

      for (const patient of waitingPatients) {
        const response = await fetch(`http://localhost:8000/api/queue/${patient.id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ priority: 'emergency' })
        });

        if (!response.ok) {
          console.error(`Failed to update patient ${patient.id}`);
        }
      }

      fetchQueue();
      alert(`${waitingPatients.length} patients marked as emergency`);
    } catch (error) {
      console.error('Failed to mark patients as emergency:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Apply search & filter
  const searchFiltered = queue.filter(item => {
    const patientName = `${item.patient?.first_name || ''} ${item.patient?.last_name || ''}`.toLowerCase();
    const matchesSearch = !searchTerm || patientName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const emergencyCases = searchFiltered.filter(item =>
    item.priority === 'emergency' || item.patient?.is_emergency
  ).sort((a, b) => new Date(a.check_in_time) - new Date(b.check_in_time));

  const regularCases = searchFiltered.filter(item =>
    item.priority !== 'emergency' && !item.patient?.is_emergency
  ).sort((a, b) => new Date(a.check_in_time) - new Date(b.check_in_time));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Queue Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Real-time dialysis queue and patient status</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Status</option>
            <option value="waiting">Waiting</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{queue.length}</div>
          <div className="text-gray-600">Total in Queue</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{emergencyCases.length}</div>
          <div className="text-gray-600">Emergency Cases</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {queue.filter(item => item.status === 'in_progress' || item.status === 'in-progress').length}
          </div>
          <div className="text-gray-600">Active Sessions</div>
        </div>
      </div>

      {/* Emergency Cases */}
      {emergencyCases.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Emergency Cases (Priority)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyCases.map(item => (
              <QueueCard
                key={item.id}
                queueId={item.id}
                patient={item.patient}
                position={item.position}
                status={item.status}
                priority={item.priority}
                emergency={item.priority === 'emergency' || item.patient?.is_emergency}
                assignedMachine={item.assigned_machine}
                assignedStaffName={item.assigned_staff_name}
                onStatusChange={updateQueueStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Queue */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Regular Queue</h2>
        {regularCases.length === 0 ? (
          <EmptyState
            title="No Patients in Queue"
            message="The queue is currently empty. Add patients to get started."
            actionButton={
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Add First Patient
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularCases.map(item => (
              <QueueCard
                key={item.id}
                queueId={item.id}
                patient={item.patient}
                position={item.position}
                status={item.status}
                priority={item.priority}
                emergency={item.priority === 'emergency' || item.patient?.is_emergency}
                assignedMachine={item.assigned_machine}
                assignedStaffName={item.assigned_staff_name}
                onStatusChange={updateQueueStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Queue Controls */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Queue Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add Patient to Queue
          </button>
          <RefreshButton onClick={fetchQueue} loading={loading} />
          <button
            onClick={() => markAllEmergency()}
            className="btn-danger"
          >
            Emergency Mode
          </button>
        </div>
      </div>

      {/* Add Patient to Queue Modal */}
      <AddPatientToQueueModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(newQueueEntry) => {
          fetchQueue(); // Refresh the list
        }}
      />
    </div>
  );
};

export default Queue;