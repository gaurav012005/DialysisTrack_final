import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { handleApiError } from '../utils/errorHandler';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/reports/dashboard-stats/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const downloadReport = async (reportType, format) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:8000/api/reports/export/?type=${reportType}&format=${format}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${reportType}_report.${format}`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();

        // Cleanup after download
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);

        alert(`${filename} downloaded successfully!`);
      } else {
        const errorText = await response.text();
        if (response.status === 400 && errorText.includes('not available')) {
          alert(`${format.toUpperCase()} export is not available. Please use CSV format or install required packages.`);
        } else {
          throw new Error('Export failed');
        }
      }
    } catch (error) {
      handleApiError(error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Generating report..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate and export system reports</p>
        </div>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.patients?.total || 0}</div>
            <div className="text-gray-600">Total Patients</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.queue?.total_waiting || 0}</div>
            <div className="text-gray-600">Waiting in Queue</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{stats.queue?.total_in_progress || 0}</div>
            <div className="text-gray-600">Active Sessions</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.machines?.available_machines || 0}</div>
            <div className="text-gray-600">Available Machines</div>
          </div>
        </div>
      )}

      {/* Export Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients Report */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">📋 Patients Report</h3>
          <p className="text-gray-600 mb-4">Export complete patient database with medical information</p>
          <div className="space-y-2">
            <button
              onClick={() => downloadReport('patients', 'pdf')}
              className="w-full btn-primary"
              disabled={loading}
            >
              📄 Download PDF
            </button>
            <button
              onClick={() => downloadReport('patients', 'excel')}
              className="w-full btn-secondary"
              disabled={loading}
            >
              📊 Download Excel
            </button>
            <button
              onClick={() => downloadReport('patients', 'csv')}
              className="w-full btn-secondary"
              disabled={loading}
            >
              📈 Download CSV
            </button>
          </div>
        </div>

        {/* Queue Report */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">🔄 Queue Report</h3>
          <p className="text-gray-600 mb-4">Export today's queue status and wait times</p>
          <div className="space-y-2">
            <button
              onClick={() => downloadReport('queue', 'pdf')}
              className="w-full btn-primary"
              disabled={loading}
            >
              📄 Download PDF
            </button>
            <button
              onClick={() => downloadReport('queue', 'csv')}
              className="w-full btn-secondary"
              disabled={loading}
            >
              📈 Download CSV
            </button>
          </div>
        </div>

        {/* Machines Report */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">⚙️ Machines Report</h3>
          <p className="text-gray-600 mb-4">Export machine utilization and maintenance data</p>
          <div className="space-y-2">
            <button
              onClick={() => downloadReport('machines', 'pdf')}
              className="w-full btn-primary"
              disabled={loading}
            >
              📄 Download PDF
            </button>
            <button
              onClick={() => downloadReport('machines', 'csv')}
              className="w-full btn-secondary"
              disabled={loading}
            >
              📈 Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* Quick Analytics */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">📊 Quick Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Today's Performance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Completed Sessions:</span>
                <span className="font-medium">{stats?.queue?.total_completed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Cases:</span>
                <span className="font-medium text-red-600">{stats?.patients?.emergency || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Patients Today:</span>
                <span className="font-medium">{stats?.patients?.active_today || 0}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Equipment Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Machines:</span>
                <span className="font-medium">{stats?.machines?.total_machines || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>In Use:</span>
                <span className="font-medium text-blue-600">{stats?.machines?.in_use_machines || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Available:</span>
                <span className="font-medium text-green-600">{stats?.machines?.available_machines || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;