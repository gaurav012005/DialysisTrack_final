import React, { useState } from 'react';
import axios from 'axios';

const TwoFactorVerify = ({ onSuccess, onCancel, userId }) => {
    const [code, setCode] = useState('');
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                'http://localhost:8000/api/two-factor/verify_login/',
                { token: code },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                }
            );

            if (response.data.success) {
                if (response.data.backup_code_used) {
                    alert(`Backup code accepted! ${response.data.backup_codes_remaining} codes remaining.`);
                }
                onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid code. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Two-Factor Authentication</h2>
                    <p className="text-gray-600 mt-2">
                        {useBackupCode
                            ? 'Enter one of your backup codes'
                            : 'Enter the 6-digit code from your authenticator app'
                        }
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder={useBackupCode ? 'ABCD1234' : '000000'}
                        value={code}
                        onChange={(e) => {
                            if (useBackupCode) {
                                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8));
                            } else {
                                setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                            }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={useBackupCode ? 8 : 6}
                        autoFocus
                    />
                </div>

                <button
                    onClick={handleVerify}
                    disabled={loading || (useBackupCode ? code.length !== 8 : code.length !== 6)}
                    className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium mb-4"
                >
                    {loading ? 'Verifying...' : 'Verify'}
                </button>

                <div className="text-center">
                    <button
                        onClick={() => {
                            setUseBackupCode(!useBackupCode);
                            setCode('');
                            setError('');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        {useBackupCode
                            ? '← Use authenticator code'
                            : 'Lost your device? Use backup code →'
                        }
                    </button>
                </div>

                {onCancel && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={onCancel}
                            className="text-sm text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                        <strong>💡 Tip:</strong> The code changes every 30 seconds. Make sure to use the current code from your app.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorVerify;
