import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import RefreshButton from '../components/RefreshButton';
import { handleApiError, showSuccess } from '../utils/errorHandler';
import { useAuth } from '../context/AuthContext';
import config from '../config/environment';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Patients', value: '0', color: 'blue', icon: '👥' },
    { label: 'In Queue', value: '0', color: 'yellow', icon: '🔄' },
    { label: 'Active Sessions', value: '0', color: 'green', icon: '⚙️' },
    { label: 'Available Machines', value: '0', color: 'gray', icon: '🏥' }
  ]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshToken, logout, user } = useAuth();
  const navigate = useNavigate();

  // Helper function to make authenticated requests with token refresh
  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // If 401, try to refresh the token
    if (response.status === 401) {
      try {
        token = await refreshToken();
        // Retry the request with new token
        return fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
      } catch (refreshError) {
        // Refresh failed, redirect to login
        logout();
        navigate('/login');
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('No authentication token found');
          navigate('/login');
          return;
        }

        const response = await fetchWithAuth(`${config.API_BASE_URL}reports/dashboard-stats/`);

        if (response.ok) {
          const data = await response.json();

          setStats([
            { label: 'Total Patients', value: data.patients?.total || '0', color: 'blue', icon: '👥' },
            { label: 'In Queue', value: data.queue?.total_waiting || '0', color: 'yellow', icon: '🔄' },
            { label: 'Active Sessions', value: data.queue?.total_in_progress || '0', color: 'green', icon: '⚙️' },
            { label: 'Available Machines', value: data.machines?.available_machines || '0', color: 'gray', icon: '🏥' }
          ]);

          // Fetch recent activities
          const queueResponse = await fetchWithAuth(`${config.API_BASE_URL}queue/?ordering=-created_at`);

          if (queueResponse.ok) {
            const queueData = await queueResponse.json();
            console.log('Queue data for activities:', queueData);
            const activities = (queueData.results || queueData).slice(0, 4).map(item => {
              const timeAgo = getTimeAgo(new Date(item.created_at));
              let action = 'Added to queue';
              let type = 'info';

              if (item.status === 'in_progress') {
                action = 'Session started';
                type = 'success';
              } else if (item.status === 'completed') {
                action = 'Session completed';
                type = 'success';
              } else if (item.priority === 'emergency') {
                action = 'Emergency case added';
                type = 'error';
              }

              return {
                patient: item.patient?.first_name ? `${item.patient.first_name} ${item.patient.last_name}` : item.patient_name || 'Unknown Patient',
                action,
                time: timeAgo,
                type
              };
            });
            setRecentActivities(activities);
          }
        } else {
          console.error('Failed to fetch dashboard data:', response.status, response.statusText);
          handleApiError(new Error(`HTTP ${response.status}`));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, refreshToken, logout]);


  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const dashboardData = {
    stats: stats,
    recentActivities: recentActivities
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to Dialysis Queue Management System</p>
        </div>
        <RefreshButton
          onClick={() => window.location.reload()}
          loading={loading}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat, index) => (
          <div key={index} className="card text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activities</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.patient}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/patients" className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors duration-200 block text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">Add Patient</div>
            </Link>
            <Link to="/queue" className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors duration-200 block text-center">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-medium">Manage Queue</div>
            </Link>
            <Link to="/machines" className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors duration-200 block text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium">View Machines</div>
            </Link>
            <Link to="/reports" className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors duration-200 block text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Generate Report</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;