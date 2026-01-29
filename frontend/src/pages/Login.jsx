import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SmallInstallButton from '../components/SmallInstallButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const { login, setUser: setAuthUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Check if 2FA setup is required (staff without 2FA)
      if (result.requires_2fa_setup) {
        // Store tokens since they need to be authenticated to set up 2FA
        localStorage.setItem('authToken', result.access);
        localStorage.setItem('refreshToken', result.refresh);
        localStorage.setItem('user', JSON.stringify(result.user));
        alert(result.message || '2FA setup is mandatory. Please complete setup to continue.');
        navigate('/2fa-setup');
      } else if (result.requires_2fa) {
        // 2FA is enabled, require verification
        setRequires2FA(true);
        setTempToken(result.temp_token);
      } else {
        // Normal login - go to dashboard (non-staff users)
        navigate('/dashboard');
      }
    } else {
      alert(result.error || 'Login failed');
    }
    setLoading(false);
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/two-factor/verify_login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ token: twoFactorCode })
      });

      const data = await response.json();

      if (response.ok) {
        // Store the final tokens and user data
        localStorage.setItem('authToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Mark that 2FA was just verified (to prevent redirect loops)
        sessionStorage.setItem('2fa_just_verified', 'true');

        // Update the auth context with the user data
        setAuthUser(data.user);

        // Navigate to dashboard using React Router (no page reload)
        navigate('/dashboard', { replace: true });
      } else {
        alert(data.detail || 'Invalid 2FA code');
      }
    } catch (error) {
      alert('Error verifying 2FA code');
    }
    setLoading(false);
  };

  if (requires2FA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Dialysis<span className="text-primary-600">Track</span>
            </h1>
            <p className="text-gray-600">Two-Factor Authentication</p>
          </div>

          {/* 2FA Card */}
          <div className="medical-card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-cyan">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-hospital-cyan mb-2">Enter Verification Code</h2>
              <p className="text-gray-600">Enter the 6-digit code from your authenticator app</p>
            </div>

            <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || twoFactorCode.length !== 6}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setTwoFactorCode('');
                  setTempToken('');
                }}
                className="w-full btn-secondary"
              >
                Back to Login
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 text-center">
                <span className="font-semibold">💡 Tip:</span> Open your authenticator app (Google Authenticator, Authy, etc.) to get your code
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
      {/* Small Install Button - Top Left Corner */}
      <SmallInstallButton />

      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Dialysis<span className="text-primary-600">Track</span>
          </h1>
          <p className="text-gray-600">Hospital Management System</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-2xl font-bold text-center mb-6">Staff Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold">🔒 Secure Login:</span> This system uses two-factor authentication for enhanced security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;