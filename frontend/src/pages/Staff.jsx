import React, { useState, useEffect } from 'react';
import AddStaffModal from '../components/AddStaffModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import RefreshButton from '../components/RefreshButton';
import toast from '../utils/toast';

const Staff = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/auth/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const staffData = data.results || data || [];

        // Transform user data to staff format
        const transformedStaff = staffData.map(user => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role || 'Staff',
          department: user.department || (user.role === 'doctor' ? 'Nephrology' : 'Dialysis'),
          shift: 'Morning',
          status: user.is_active ? 'active' : 'off'
        }));

        setStaffMembers(transformedStaff);
      } else {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteStaff = async (staffId, staffName) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${staffName} from the system?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/auth/users/${staffId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Staff member removed successfully');
        fetchStaff();
      } else {
        const errorText = await response.text();
        toast.error(`Failed to delete staff: ${errorText}`);
      }
    } catch (error) {
      toast.error(`Error deleting staff: ${error.message}`);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading staff..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage hospital staff and shifts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add Staff Member
          </button>
          <RefreshButton onClick={fetchStaff} loading={loading} />
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="🔍 Search staff by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="technician">Technician</option>
            <option value="receptionist">Receptionist</option>
            <option value="driver">Driver</option>
            <option value="patient">Patient</option>
          </select>
        </div>
      </div>

      {/* Staff Grid */}
      {(() => {
        const filtered = staffMembers.filter(s => {
          const matchesSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesRole = !roleFilter || s.role === roleFilter;
          return matchesSearch && matchesRole;
        });

        if (filtered.length === 0) {
          return (
            <EmptyState
              title="No Staff Members Found"
              message={searchTerm || roleFilter ? 'No staff match your search criteria.' : 'No staff members are currently registered.'}
              actionButton={
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                  Add First Staff Member
                </button>
              }
            />
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(staff => (
            <div key={staff.id} className="card text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                {staff.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{staff.name}</h3>
              <p className="text-gray-600">{staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Department:</span>
                  <span className="font-medium">{staff.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shift:</span>
                  <span className="font-medium">{staff.shift}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${staff.status === 'active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {staff.status === 'active' ? 'On Duty' : 'Off Duty'}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setEditingStaff(staff)}
                  className="flex-1 btn-secondary text-sm py-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleStaffStatus(staff.id, staff.status === 'active' ? 'off' : 'active', fetchStaff)}
                  className={`flex-1 text-sm py-2 rounded ${staff.status === 'active'
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                  {staff.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteStaff(staff.id, staff.name)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        );
      })()}

      {/* Shift Schedule */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Current Shift Schedule</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patients Assigned
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffMembers.filter(s => s.status === 'active').map(staff => (
                <tr key={staff.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {staff.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staff.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staff.shift}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staff.shift === 'Morning' ? '6:00 AM - 2:00 PM' :
                      staff.shift === 'Evening' ? '2:00 PM - 10:00 PM' :
                        '10:00 PM - 6:00 AM'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.floor(Math.random() * 5) + 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Staff Modal */}
      <AddStaffModal
        isOpen={showAddModal || editingStaff !== null}
        onClose={() => {
          setShowAddModal(false);
          setEditingStaff(null);
        }}
        onAdd={() => {
          fetchStaff(); // Refresh the list
        }}
        editingStaff={editingStaff}
      />
    </div>
  );
};

const toggleStaffStatus = async (staffId, newStatus, fetchStaff) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`http://localhost:8000/api/auth/users/${staffId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_active: newStatus === 'active' })
    });

    if (response.ok) {
      fetchStaff();
      toast.success('Staff status updated!');
    } else {
      const errorText = await response.text();
      throw new Error(`Failed to update staff: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Failed to update staff status:', error);
    toast.error(`Error updating staff status: ${error.message}`);
  }
};

export default Staff;