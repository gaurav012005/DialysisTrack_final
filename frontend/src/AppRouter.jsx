import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { usePermissions } from './components/RoleGuard';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PatientRegister from './pages/PatientRegister';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Queue from './pages/Queue';
import Machines from './pages/Machines';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import BillingPage from './pages/BillingPage';
import Sessions from './pages/Sessions';
import PatientDashboard from './pages/PatientDashboard';
import PatientAppointments from './pages/PatientAppointments';
import TwoFactorSetup from './pages/TwoFactorSetup';
import NotFound from './pages/NotFound';
import AmbulanceManagement from './pages/AmbulanceManagement';
import DriverDashboard from './pages/DriverDashboard';
import TrackAmbulance from './pages/TrackAmbulance';
import AuditLogs from './pages/AuditLogs';

// Protected Route with Role Check and 2FA Setup Enforcement
const ProtectedRoute = ({ children, requiredModule }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const { hasModuleAccess } = usePermissions();
  const [checking2FA, setChecking2FA] = React.useState(true);
  const [has2FA, setHas2FA] = React.useState(false);

  React.useEffect(() => {
    const check2FAStatus = async () => {
      if (!isAuthenticated || !user) {
        setChecking2FA(false);
        return;
      }

      // Check if user is staff
      const staffRoles = ['admin', 'doctor', 'nurse', 'receptionist', 'technician'];
      const isStaff = staffRoles.includes(user.role);

      if (!isStaff || user.role === 'driver') {
        // Non-staff users don't need 2FA
        setHas2FA(true);
        setChecking2FA(false);
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:8000/api/two-factor/status/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Handle 401 Unauthorized - token is invalid/expired
        if (response.status === 401) {
          console.warn('Token expired or invalid, logging out...');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setHas2FA(data.enabled || false);
        } else {
          console.error('Failed to check 2FA status:', response.status);
          setHas2FA(false);
        }
      } catch (error) {
        console.error('Error checking 2FA status:', error);
        setHas2FA(false);
      }
      setChecking2FA(false);
    };

    check2FAStatus();
  }, [isAuthenticated, user]);

  if (loading || checking2FA) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if staff user has completed 2FA SETUP (not verification)
  // Verification is handled at login with grace period
  const staffRoles = ['admin', 'doctor', 'nurse', 'receptionist', 'technician'];
  const isStaff = user && staffRoles.includes(user.role);
  const isOn2FASetupPage = window.location.pathname === '/2fa-setup';

  // Check if user just completed 2FA verification
  const just2FAVerified = sessionStorage.getItem('2fa_just_verified') === 'true';

  // Only redirect to 2FA setup if:
  // 1. User is staff
  // 2. User does NOT have 2FA enabled
  // 3. User is NOT already on the 2FA setup page
  // 4. User did NOT just complete 2FA verification
  if (isStaff && !has2FA && !isOn2FASetupPage && !just2FAVerified) {
    // Redirect staff without 2FA SETUP to setup page
    return <Navigate to="/2fa-setup" />;
  }

  // Clear the flag ONLY if it was used to bypass the redirect above
  // This prevents clearing it too early when navigating from 2FA setup page
  if (just2FAVerified && (!isStaff || has2FA || isOn2FASetupPage)) {
    sessionStorage.removeItem('2fa_just_verified');
  }

  // Allow staff with 2FA enabled to view the 2FA setup page
  // (they will see "2FA is Already Enabled" message and can click "Go to Dashboard")

  if (requiredModule && !hasModuleAccess(requiredModule)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this module.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Public Route
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const AppRouter = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><PatientRegister /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requiredModule="dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="patients"
            element={
              <ProtectedRoute requiredModule="patients">
                <Patients />
              </ProtectedRoute>
            }
          />
          <Route
            path="queue"
            element={
              <ProtectedRoute requiredModule="queue">
                <Queue />
              </ProtectedRoute>
            }
          />
          <Route
            path="machines"
            element={
              <ProtectedRoute requiredModule="machines">
                <Machines />
              </ProtectedRoute>
            }
          />
          <Route
            path="staff"
            element={
              <ProtectedRoute requiredModule="staff">
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute requiredModule="reports">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="billing"
            element={
              <ProtectedRoute requiredModule="billing">
                <BillingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="sessions"
            element={
              <ProtectedRoute requiredModule="queue">
                <Sessions />
              </ProtectedRoute>
            }
          />
          {/* Patient Portal - NEW! */}
          <Route
            path="patient-portal"
            element={
              <ProtectedRoute>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          {/* Patient-specific routes */}
          <Route
            path="2fa-setup"
            element={
              <ProtectedRoute>
                <TwoFactorSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="appointments"
            element={
              <ProtectedRoute requiredModule="appointments">
                <PatientAppointments />
              </ProtectedRoute>
            }
          />
          {/* Fleet / Ambulance Routes */}
          <Route
            path="ambulances"
            element={
              <ProtectedRoute requiredModule="fleet">
                <AmbulanceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="driver-dashboard"
            element={
              <ProtectedRoute requiredModule="fleet">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="track-ambulance/:id"
            element={
              <ProtectedRoute>
                <TrackAmbulance />
              </ProtectedRoute>
            }
          />
          <Route
            path="track-ambulance"
            element={
              <ProtectedRoute>
                <TrackAmbulance />
              </ProtectedRoute>
            }
          />
          {/* Audit Logs (Admin Only) */}
          <Route
            path="audit-logs"
            element={
              <ProtectedRoute requiredModule="reports">
                <AuditLogs />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRouter;
