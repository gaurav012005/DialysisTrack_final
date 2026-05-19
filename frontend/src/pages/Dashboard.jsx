import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import RefreshButton from '../components/RefreshButton';
import { handleApiError, showSuccess } from '../utils/errorHandler';
import { useAuth } from '../context/AuthContext';
import config from '../config/environment';
import { Users, RefreshCw, Settings, Building2, BarChart3, ShieldAlert, FileCheck, FlaskConical, Syringe, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

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

  // Clinical alert states
  const [clinicalAlerts, setClinicalAlerts] = useState({
    infectionPositive: { count: 0, patients: [] },
    consentExpired: { count: 0, patients: [] },
    screeningOverdue: { count: 0, patients: [] },
    criticalLabs: []
  });

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

        // Fetch clinical alerts (only for medical staff)
        if (user?.role && ['admin', 'doctor', 'nurse', 'technician', 'receptionist'].includes(user.role)) {
          await fetchClinicalAlerts();
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

  const fetchClinicalAlerts = async () => {
    try {
      // Fetch infection-positive patients
      const infectionRes = await fetchWithAuth(`${config.API_BASE_URL}patients/infection_positive/`);
      if (infectionRes.ok) {
        const data = await infectionRes.json();
        setClinicalAlerts(prev => ({
          ...prev,
          infectionPositive: { count: data.count || 0, patients: data.patients || [] }
        }));
      }
    } catch (e) { console.warn('Infection fetch failed:', e); }

    try {
      // Fetch consent expired
      const consentRes = await fetchWithAuth(`${config.API_BASE_URL}patients/consent_expired/`);
      if (consentRes.ok) {
        const data = await consentRes.json();
        setClinicalAlerts(prev => ({
          ...prev,
          consentExpired: { count: data.count || 0, patients: data.patients || [] }
        }));
      }
    } catch (e) { console.warn('Consent fetch failed:', e); }

    try {
      // Fetch screening overdue
      const screeningRes = await fetchWithAuth(`${config.API_BASE_URL}patients/screening_overdue/`);
      if (screeningRes.ok) {
        const data = await screeningRes.json();
        setClinicalAlerts(prev => ({
          ...prev,
          screeningOverdue: { count: data.count || 0, patients: data.patients || [] }
        }));
      }
    } catch (e) { console.warn('Screening fetch failed:', e); }

    try {
      // Fetch critical lab alerts
      const criticalRes = await fetchWithAuth(`${config.API_BASE_URL}patients/lab-results/critical_alerts/`);
      if (criticalRes.ok) {
        const data = await criticalRes.json();
        setClinicalAlerts(prev => ({
          ...prev,
          criticalLabs: data.results || data || []
        }));
      }
    } catch (e) { console.warn('Critical labs fetch failed:', e); }
  };


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

  const hasAnyClinicalAlert = clinicalAlerts.infectionPositive.count > 0 ||
    clinicalAlerts.consentExpired.count > 0 ||
    clinicalAlerts.screeningOverdue.count > 0 ||
    clinicalAlerts.criticalLabs.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Welcome to Dialysis Queue Management System</p>
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

      {/* Clinical Alerts Section */}
      {user?.role && ['admin', 'doctor', 'nurse', 'technician', 'receptionist'].includes(user.role) && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
            Clinical Alerts & Compliance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Infection Positive Alert */}
            <div className={`card border-l-4 ${clinicalAlerts.infectionPositive.count > 0 ? 'border-l-red-500' : 'border-l-green-500'}`} style={{ transform: 'none' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${clinicalAlerts.infectionPositive.count > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                  <Syringe className={`w-5 h-5 ${clinicalAlerts.infectionPositive.count > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Infection+</p>
                  <p className={`text-2xl font-bold ${clinicalAlerts.infectionPositive.count > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {clinicalAlerts.infectionPositive.count}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {clinicalAlerts.infectionPositive.count > 0 ? 'Need isolated machines' : 'All clear'}
              </p>
            </div>

            {/* Consent Expired Alert */}
            <div className={`card border-l-4 ${clinicalAlerts.consentExpired.count > 0 ? 'border-l-amber-500' : 'border-l-green-500'}`} style={{ transform: 'none' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${clinicalAlerts.consentExpired.count > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                  <FileCheck className={`w-5 h-5 ${clinicalAlerts.consentExpired.count > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Consent Due</p>
                  <p className={`text-2xl font-bold ${clinicalAlerts.consentExpired.count > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                    {clinicalAlerts.consentExpired.count}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {clinicalAlerts.consentExpired.count > 0 ? 'Need consent renewal' : 'All consents valid'}
              </p>
            </div>

            {/* Screening Overdue Alert */}
            <div className={`card border-l-4 ${clinicalAlerts.screeningOverdue.count > 0 ? 'border-l-orange-500' : 'border-l-green-500'}`} style={{ transform: 'none' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${clinicalAlerts.screeningOverdue.count > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                  <FlaskConical className={`w-5 h-5 ${clinicalAlerts.screeningOverdue.count > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Screening Due</p>
                  <p className={`text-2xl font-bold ${clinicalAlerts.screeningOverdue.count > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                    {clinicalAlerts.screeningOverdue.count}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {clinicalAlerts.screeningOverdue.count > 0 ? 'Overdue >3 months' : 'All screening current'}
              </p>
            </div>

            {/* Critical Lab Alert */}
            <div className={`card border-l-4 ${clinicalAlerts.criticalLabs.length > 0 ? 'border-l-rose-500' : 'border-l-green-500'}`} style={{ transform: 'none' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${clinicalAlerts.criticalLabs.length > 0 ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                  <AlertTriangle className={`w-5 h-5 ${clinicalAlerts.criticalLabs.length > 0 ? 'text-rose-600 dark:text-rose-400 heartbeat-animation' : 'text-green-600 dark:text-green-400'}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Critical Labs</p>
                  <p className={`text-2xl font-bold ${clinicalAlerts.criticalLabs.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-green-600 dark:text-green-400'}`}>
                    {clinicalAlerts.criticalLabs.length}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {clinicalAlerts.criticalLabs.length > 0 ? 'Urgent attention needed' : 'No critical values'}
              </p>
            </div>
          </div>

          {/* Expanded Critical Lab Details */}
          {clinicalAlerts.criticalLabs.length > 0 && (
            <div className="card border border-rose-200 dark:border-rose-800/50" style={{ transform: 'none' }}>
              <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Critical Lab Values — Immediate Action Required
              </h3>
              <div className="space-y-2">
                {clinicalAlerts.criticalLabs.slice(0, 5).map((lab, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {lab.patient_name || 'Unknown'}
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      {lab.is_potassium_critical && (
                        <span className="badge-danger text-xs">K+ {lab.serum_potassium} mEq/L</span>
                      )}
                      {lab.is_hemoglobin_low && (
                        <span className="badge-danger text-xs">Hb {lab.hemoglobin} g/dL</span>
                      )}
                      <span className="text-gray-500 dark:text-gray-400">{lab.test_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Recent Activities</h2>
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activities</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                  <div className="flex-1">
                    <p className="font-medium dark:text-gray-200">{activity.patient}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/patients" className="p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-200 block text-center">
              <div className="flex justify-center mb-2"><Users className="w-6 h-6 text-blue-500" /></div>
              <div className="font-medium dark:text-gray-200">Add Patient</div>
            </Link>
            <Link to="/queue" className="p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transition-colors duration-200 block text-center">
              <div className="flex justify-center mb-2"><RefreshCw className="w-6 h-6 text-green-500" /></div>
              <div className="font-medium dark:text-gray-200">Manage Queue</div>
            </Link>
            <Link to="/patients" className="p-4 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/30 rounded-lg border border-cyan-200 dark:border-cyan-800 transition-colors duration-200 block text-center">
              <div className="flex justify-center mb-2"><FlaskConical className="w-6 h-6 text-cyan-500" /></div>
              <div className="font-medium dark:text-gray-200">Clinical Data</div>
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