import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [appointments, setAppointments] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [bills, setBills] = useState([]);

    const API_URL = 'http://localhost:8000/api/patients/dashboard';

    useEffect(() => {
        fetchDashboardOverview();
    }, []);

    const fetchDashboardOverview = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/overview/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDashboardData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            alert('Error loading dashboard. Please login as a patient.');
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/appointments/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/sessions/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(response.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const fetchBills = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/bills/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBills(response.data);
        } catch (error) {
            console.error('Error fetching bills:', error);
        }
    };

    const downloadSessionSummary = async (sessionId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `${API_URL}/${sessionId}/download-session-summary/`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `session_summary_${sessionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            alert('Session summary downloaded successfully!');
        } catch (error) {
            console.error('Error downloading session summary:', error);
            alert('Failed to download session summary');
        }
    };

    const downloadReceipt = async (billId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `${API_URL}/${billId}/download-receipt/`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt_${billId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            alert('Receipt downloaded successfully!');
        } catch (error) {
            console.error('Error downloading receipt:', error);
            alert('Failed to download receipt');
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'appointments' && appointments.length === 0) {
            fetchAppointments();
        } else if (tab === 'sessions' && sessions.length === 0) {
            fetchSessions();
        } else if (tab === 'bills' && bills.length === 0) {
            fetchBills();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600">Failed to load dashboard</p>
                    <button
                        onClick={fetchDashboardOverview}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Patient Portal</h1>
                <p className="text-gray-600 mt-2">
                    Welcome, {dashboardData.patient_info.name}!
                </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['overview', 'appointments', 'sessions', 'bills'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`${activeTab === tab
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600">Total Sessions</div>
                            <div className="text-2xl font-bold text-gray-900 mt-2">
                                {dashboardData.statistics.total_sessions}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600">Total Paid</div>
                            <div className="text-2xl font-bold text-green-600 mt-2">
                                ₹{dashboardData.statistics.total_paid.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600">Pending Amount</div>
                            <div className="text-2xl font-bold text-red-600 mt-2">
                                ₹{dashboardData.statistics.pending_amount.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600">Next Appointment</div>
                            <div className="text-lg font-bold text-blue-600 mt-2">
                                {dashboardData.statistics.next_appointment || 'None'}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
                        </div>
                        <div className="p-6">
                            {dashboardData.upcoming_appointments.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.upcoming_appointments.map((apt) => (
                                        <div key={apt.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-semibold text-gray-800">{apt.date}</div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        Shift: {apt.shift} | Time: {apt.scheduled_time || 'TBD'}
                                                    </div>
                                                    {apt.notes && (
                                                        <div className="text-sm text-gray-500 mt-1">{apt.notes}</div>
                                                    )}
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
                            )}
                        </div>
                    </div>

                    {/* Pending Bills */}
                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Pending Bills</h2>
                        </div>
                        <div className="p-6">
                            {dashboardData.pending_bills.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.pending_bills.map((bill) => (
                                        <div key={bill.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-semibold text-gray-800">Bill #{bill.bill_number}</div>
                                                    <div className="text-sm text-gray-600 mt-1">Date: {bill.date}</div>
                                                    <div className="text-sm text-gray-600">
                                                        Total: ₹{bill.total_amount.toFixed(2)} | Paid: ₹{bill.paid_amount.toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-red-600">
                                                        ₹{bill.balance_amount.toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Balance Due</div>
                                                    <button
                                                        onClick={() => downloadReceipt(bill.id)}
                                                        className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                                                    >
                                                        Download Receipt
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No pending bills</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Recent Sessions</h2>
                        </div>
                        <div className="p-6">
                            {dashboardData.recent_sessions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Date</th>
                                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Duration</th>
                                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Pre Weight</th>
                                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Post Weight</th>
                                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.recent_sessions.map((session) => (
                                                <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-sm text-gray-800">{session.date}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">{session.duration} min</td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">{session.pre_weight} kg</td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">{session.post_weight} kg</td>
                                                    <td className="py-3 px-4">
                                                        <button
                                                            onClick={() => downloadSessionSummary(session.id)}
                                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            Download Summary
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No session history</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">All Appointments</h2>
                    </div>
                    <div className="p-6">
                        {appointments.length > 0 ? (
                            <div className="space-y-4">
                                {appointments.map((apt) => (
                                    <div key={apt.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold text-gray-800">{apt.date}</div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    Shift: {apt.shift} | Time: {apt.scheduled_time || 'TBD'}
                                                </div>
                                                {apt.notes && (
                                                    <div className="text-sm text-gray-500 mt-1">{apt.notes}</div>
                                                )}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                    apt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No appointments found</p>
                        )}
                    </div>
                </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Session History</h2>
                    </div>
                    <div className="p-6">
                        {sessions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Date & Time</th>
                                            <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Duration</th>
                                            <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Machine</th>
                                            <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Weight Loss</th>
                                            <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessions.map((session) => (
                                            <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-sm text-gray-800">
                                                    {session.date} {session.time}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {session.duration_minutes} min
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {session.machine_number || 'N/A'}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {(session.pre_dialysis_weight - session.post_dialysis_weight).toFixed(2)} kg
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => downloadSessionSummary(session.id)}
                                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Download
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No sessions found</p>
                        )}
                    </div>
                </div>
            )}

            {/* Bills Tab */}
            {activeTab === 'bills' && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Bills & Payments</h2>
                    </div>
                    <div className="p-6">
                        {bills.length > 0 ? (
                            <div className="space-y-4">
                                {bills.map((bill) => (
                                    <div key={bill.id} className={`p-4 rounded-lg border ${bill.balance_amount > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                                        }`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800">Bill #{bill.bill_number}</div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    Date: {bill.bill_date}
                                                </div>
                                                <div className="mt-2 text-sm">
                                                    <div>Total Amount: ₹{bill.total_amount.toFixed(2)}</div>
                                                    <div>Paid Amount: ₹{bill.paid_amount.toFixed(2)}</div>
                                                    <div className="font-semibold">
                                                        Balance: ₹{bill.balance_amount.toFixed(2)}
                                                    </div>
                                                </div>

                                                {bill.payments.length > 0 && (
                                                    <div className="mt-3 p-2 bg-white rounded border">
                                                        <div className="text-xs font-medium text-gray-700 mb-1">Payment History:</div>
                                                        {bill.payments.map((payment) => (
                                                            <div key={payment.id} className="text-xs text-gray-600">
                                                                {payment.payment_date}: ₹{payment.amount.toFixed(2)} ({payment.payment_mode})
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <button
                                                    onClick={() => downloadReceipt(bill.id)}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                                >
                                                    Download Receipt
                                                </button>
                                                <div className={`mt-2 text-xs text-center font-medium ${bill.balance_amount > 0 ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                    {bill.balance_amount > 0 ? 'Pending' : 'Paid'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No bills found</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;

