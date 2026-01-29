import React, { useState } from 'react';
import axios from 'axios';

const TwoFactorSetup = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const initiate2FA = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post(
                'http://localhost:8000/api/two-factor/setup/',
                {},
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                }
            );
            setQrCode(response.data.qr_code);
            setSecret(response.data.secret);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to setup 2FA');
        }
        setLoading(false);
    };

    const verify2FA = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post(
                'http://localhost:8000/api/two-factor/verify_setup/',
                { token },
                { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
            );
            setBackupCodes(response.data.backup_codes);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid code. Please try again.');
        }
        setLoading(false);
    };

    const copyBackupCodes = () => {
        const text = backupCodes.join('\n');
        navigator.clipboard.writeText(text);
        alert('Backup codes copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">
                        Enable Two-Factor Authentication
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Introduction */}
                    {step === 1 && (
                        <div>
                            <p className="mb-4 text-gray-600">
                                Add an extra layer of security to your account by requiring a code
                                from your phone when you sign in.
                            </p>

                            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold mb-2 text-blue-900">What you'll need:</h3>
                                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                                    <li>A smartphone</li>
                                    <li>Authenticator app (Google Authenticator, Authy, or Microsoft Authenticator)</li>
                                    <li>A few minutes to complete setup</li>
                                </ul>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={initiate2FA}
                                    disabled={loading}
                                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                    {loading ? 'Setting up...' : 'Get Started'}
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: QR Code Scanning */}
                    {step === 2 && (
                        <div>
                            <p className="mb-4 text-gray-600">
                                Scan this QR code with your authenticator app:
                            </p>

                            {qrCode && (
                                <div className="mb-4">
                                    <img
                                        src={qrCode}
                                        alt="QR Code"
                                        className="mx-auto border-2 border-gray-200 rounded p-2"
                                        style={{ maxWidth: '300px' }}
                                    />
                                </div>
                            )}

                            <div className="mb-4 p-3 bg-gray-50 rounded">
                                <p className="text-sm text-gray-600 mb-1">
                                    Can't scan? Enter this key manually:
                                </p>
                                <code className="text-xs bg-gray-200 px-2 py-1 rounded block break-all">
                                    {secret}
                                </code>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter the 6-digit code from your app:
                                </label>
                                <input
                                    type="text"
                                    placeholder="000000"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-center text-2xl tracking-widest"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={verify2FA}
                                    disabled={loading || token.length !== 6}
                                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Enable'}
                                </button>
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Backup Codes */}
                    {step === 3 && (
                        <div>
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
                                <h3 className="text-lg font-bold text-green-800 mb-2">
                                    ✅ 2FA Enabled Successfully!
                                </h3>
                                <p className="text-sm text-green-700">
                                    Your account is now protected with two-factor authentication.
                                </p>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-semibold mb-2 text-gray-800">
                                    ⚠️ Save These Backup Codes
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Store these codes securely. Each code can only be used once if you lose access to your authenticator app.
                                </p>

                                <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-3">
                                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                                        {backupCodes.map((code, i) => (
                                            <div key={i} className="bg-white p-2 rounded border border-gray-300">
                                                {code}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={copyBackupCodes}
                                    className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 mb-2"
                                >
                                    📋 Copy All Codes
                                </button>

                                <p className="text-xs text-red-600">
                                    <strong>Warning:</strong> These codes won't be shown again. Make sure to save them now!
                                </p>
                            </div>

                            <button
                                onClick={onComplete}
                                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TwoFactorSetup;
