import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TwoFactorSetup = () => {
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [step, setStep] = useState('setup'); // setup, verify, complete
    const [status, setStatus] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        checkStatus();

        // Prevent navigation away from this page if 2FA is not enabled and user is staff
        const handleBeforeUnload = (e) => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const staffRoles = ['admin', 'doctor', 'nurse', 'receptionist', 'technician'];
            const isStaff = staffRoles.includes(user.role);

            if (isStaff && status && !status.enabled && step !== 'complete') {
                e.preventDefault();
                e.returnValue = '2FA setup is mandatory. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [status, step]);

    // Auto-redirect staff users who already have 2FA enabled to dashboard
    useEffect(() => {
        if (status && status.enabled && step === 'setup') {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const staffRoles = ['admin', 'doctor', 'nurse', 'receptionist', 'technician'];
            const isStaff = staffRoles.includes(user.role);

            // Give user 3 seconds to see the "2FA is Already Enabled" message
            // before auto-redirecting (they can also click the button immediately)
            if (isStaff) {
                const timer = setTimeout(() => {
                    // Mark that we're navigating from 2FA page (to prevent redirect loops)
                    sessionStorage.setItem('2fa_just_verified', 'true');
                    navigate('/dashboard', { replace: true });
                }, 3000);

                return () => clearTimeout(timer);
            }
        }
    }, [status, step, navigate]);

    const checkStatus = async () => {
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
                setStatus(data);
            } else {
                console.error('Failed to check 2FA status:', response.status);
            }
        } catch (error) {
            console.error('Error checking 2FA status:', error);
        }
    };

    const handleSetup = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8000/api/two-factor/setup/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                // Use the base64 QR code directly from the backend
                // This prevents issues with adblockers blocking external QR code APIs
                setQrCode(data.qr_code);
                setSecret(data.secret);
                setStep('verify');
            } else {
                alert('Failed to setup 2FA');
            }
        } catch (error) {
            alert('Error setting up 2FA');
        }
        setLoading(false);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8000/api/two-factor/verify_setup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token: verificationCode })
            });

            const data = await response.json();
            if (response.ok) {
                setBackupCodes(data.backup_codes || []);
                setStep('complete');
            } else {
                alert(data.detail || 'Invalid verification code');
            }
        } catch (error) {
            alert('Error verifying code');
        }
        setLoading(false);
    };

    const handleDisable = async () => {
        if (!window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8000/api/two-factor/disable/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('2FA has been disabled');
                checkStatus();
                setStep('setup');
            } else {
                alert('Failed to disable 2FA');
            }
        } catch (error) {
            alert('Error disabling 2FA');
        }
        setLoading(false);
    };

    const copyBackupCodes = () => {
        const codes = backupCodes.join('\n');
        navigator.clipboard.writeText(codes);
        alert('Backup codes copied to clipboard!');
    };

    if (!status) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
                <div className="animate-pulse text-hospital-cyan text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
            <div className="max-w-4xl mx-auto py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Two-Factor Authentication
                    </h1>
                    <p className="text-gray-600">Enhance your account security</p>
                </div>

                {/* Redirect if 2FA is already enabled - no disable option for staff */}
                {status.enabled && step === 'setup' && (
                    <div className="medical-card mb-6">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-green-600 mb-2">2FA is Already Enabled</h3>
                            <p className="text-gray-600 mb-6">Your account is protected with two-factor authentication</p>
                            <button
                                onClick={() => {
                                    // Mark that we're navigating from 2FA page (to prevent redirect loops)
                                    sessionStorage.setItem('2fa_just_verified', 'true');
                                    // Navigate to dashboard using React Router
                                    navigate('/dashboard', { replace: true });
                                }}
                                className="btn-primary"
                            >
                                Go to Dashboard
                            </button>
                            <p className="text-sm text-gray-500 mt-3 animate-pulse">
                                Redirecting to dashboard in 3 seconds...
                            </p>
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Security Notice:</span> Two-Factor Authentication is mandatory for all staff members and cannot be disabled. Contact your administrator if you need assistance.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Setup Step */}
                {step === 'setup' && !status.enabled && (
                    <div className="medical-card">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-cyan">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-hospital-cyan mb-2">Secure Your Account</h2>
                            <p className="text-gray-600">Add an extra layer of security to your account</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold text-sm">1</div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">Install an Authenticator App</h4>
                                    <p className="text-gray-600 text-sm">Download Google Authenticator, Microsoft Authenticator, or Authy</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold text-sm">2</div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">Scan QR Code</h4>
                                    <p className="text-gray-600 text-sm">Use your app to scan the QR code we'll provide</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold text-sm">3</div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">Verify Setup</h4>
                                    <p className="text-gray-600 text-sm">Enter the 6-digit code to complete setup</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSetup}
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50"
                        >
                            {loading ? 'Setting up...' : 'Start Setup'}
                        </button>

                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-gray-600 text-center">
                                <span className="font-semibold">Security Notice:</span> Two-Factor Authentication is mandatory for all staff members to ensure the security of patient data and hospital systems.
                            </p>
                        </div>
                    </div>
                )}

                {/* Verify Step */}
                {step === 'verify' && (
                    <div className="medical-card">
                        <h2 className="text-2xl font-bold text-hospital-cyan mb-6 text-center">Scan QR Code</h2>

                        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-cyan-300 mb-6">
                            <img src={qrCode} alt="2FA QR Code" className="mx-auto w-64 h-64" />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Can't scan? Enter this code manually:</p>
                            <div className="bg-white p-3 rounded border border-blue-200 font-mono text-sm break-all">
                                {secret}
                            </div>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter the 6-digit code from your app
                                </label>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="input-field text-center text-2xl tracking-widest font-mono"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || verificationCode.length !== 6}
                                className="w-full btn-primary disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Complete Step */}
                {step === 'complete' && (
                    <div className="medical-card">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-green-600 mb-2">2FA Enabled Successfully!</h2>
                            <p className="text-gray-600">Your account is now more secure</p>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">Save Your Backup Codes</h3>
                                    <p className="text-sm text-yellow-700 mt-1">Store these codes in a safe place. You can use them to access your account if you lose your phone.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-gray-800">Backup Codes</h3>
                                <button onClick={copyBackupCodes} className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                                    Copy All
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {backupCodes.map((code, index) => (
                                    <div key={index} className="bg-white p-2 rounded border border-gray-200 font-mono text-sm text-center">
                                        {code}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                // Mark that we're navigating from 2FA page (to prevent redirect loops)
                                sessionStorage.setItem('2fa_just_verified', 'true');
                                // Navigate to dashboard using React Router
                                navigate('/dashboard', { replace: true });
                            }}
                            className="w-full btn-primary"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TwoFactorSetup;
