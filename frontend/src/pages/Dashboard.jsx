import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import RefreshButton from '../components/RefreshButton';
import { handleApiError, showSuccess } from '../utils/errorHandler';
import { useAuth } from '../context/AuthContext';
import config from '../config/environment';
import { Users, RefreshCw, Settings, Building2, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Patients', value: '0', color: 'blue', icon: Users },
    { label: 'In Queue', value: '0', color: 'yellow', icon: RefreshCw },
    { label: 'Active Sessions', value: '0', color: 'green', icon: Settings },
    { label: 'Available Machines', value: '0', color: 'gray', icon: Building2 }
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
            { label: 'Total Patients', value: data.patients?.total || '0', color: 'blue', icon: Users },
            { label: 'In Queue', value: data.queue?.total_waiting || '0', color: 'yellow', icon: RefreshCw },
            { label: 'Active Sessions', value: data.queue?.total_in_progress || '0', color: 'green', icon: Settings },
            { label: 'Available Machines', value: data.machines?.available_machines || '0', color: 'gray', icon: Building2 }
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Welcome to Dialysis Queue Management System</p>
        </div>
        <RefreshButton
          onClick={() => window.location.reload()}
          loading={loading}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="card text-center">
              <div className="flex justify-center mb-2">
                <IconComponent className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          );
        })}
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
            <Link to="/patients" className="p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-200 block text-center">
              <div className="flex justify-center mb-2"><Users className="w-6 h-6 text-blue-500" /></div>
              <div className="font-medium dark:text-gray-200">Add Patient</div>
            </Link>
            <Link to="/queue" className="p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transition-colors duration-200 block text-center">
              <div className="flex justify-center mb-2"><RefreshCw className="w-6 h-6 text-green-500" /></div>
              <div className="font-medium dark:text-gray-200">Manage Queue</div>
            </Link>
            <Link to="/machines" className="p-4 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800 transition-colors duration-200 block text-center">
              <div className="flex justify-center mb-2"><Settings className="w-6 h-6 text-yellow-500" /></div>
              <div className="font-medium dark:text-gray-200">View Machines</div>
            </Link>
            <Link to="/reports" className="p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors duration-200 block text-center">
              <div className="flex justify-center mb-2"><BarChart3 className="w-6 h-6 text-purple-500" /></div>
              <div className="font-medium dark:text-gray-200">Generate Report</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;