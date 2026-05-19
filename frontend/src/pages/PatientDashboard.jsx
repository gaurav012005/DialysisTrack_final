import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Download, FileText, Receipt, Loader2 } from 'lucide-react';
import { downloadReceiptPDF, downloadSessionPDF } from '../utils/pdfDownload';
import ClinicalDataPanel from '../components/ClinicalDataPanel';

const PatientDashboard = () => {
    const [loading, setLoading]           = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [activeTab, setActiveTab]       = useState('overview');
    const [appointments, setAppointments] = useState([]);
    const [sessions, setSessions]         = useState([]);
    const [bills, setBills]               = useState([]);
    const [downloadingId, setDownloadingId] = useState(null);

    const API_URL = 'http://localhost:8000/api/patients/dashboard';

    /* ─── API helpers ─────────────────────────────────────────────── */
    const authHeader = () => {
        const token = localStorage.getItem('authToken');
        return { Authorization: `Bearer ${token}` };
    };

    const fetchDashboardOverview = useCallback(async () => {
        try {
            const r = await axios.get(`${API_URL}/overview/`, { headers: authHeader() });
            setDashboardData(r.data);
        } catch (e) {
            console.error('Dashboard fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAppointments = async () => {
        try {
            const r = await axios.get(`${API_URL}/appointments/`, { headers: authHeader() });
            setAppointments(r.data);
        } catch (e) { console.error(e); }
    };

    const fetchSessions = async () => {
        try {
            const r = await axios.get(`${API_URL}/sessions/`, { headers: authHeader() });
            setSessions(r.data);
        } catch (e) { console.error(e); }
    };

    const fetchBills = async () => {
        try {
            const r = await axios.get(`${API_URL}/bills/`, { headers: authHeader() });
            setBills(r.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchDashboardOverview(); }, [fetchDashboardOverview]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'appointments' && appointments.length === 0) fetchAppointments();
        else if (tab === 'sessions'  && sessions.length === 0)      fetchSessions();
        else if (tab === 'bills'     && bills.length === 0)          fetchBills();
    };

    /* ─── PDF download handlers ───────────────────────────────────── */
    const handleDownloadReceipt = async (bill) => {
        const key = `receipt-${bill.id}`;
        setDownloadingId(key);
        await new Promise(r => setTimeout(r, 50)); // allow re-render before heavy work
        try {
            const patient = dashboardData?.patient_info || {};
            downloadReceiptPDF(bill, {
                name: patient.name, patient_id: patient.patient_id, phone: patient.phone,
            });
        } catch (e) { console.error('receipt PDF error:', e); }
        finally { setDownloadingId(null); }
    };

    const handleDownloadSession = async (session) => {
        const key = `session-${session.id}`;
        setDownloadingId(key);
        await new Promise(r => setTimeout(r, 50));
        try {
            const patient = dashboardData?.patient_info || {};
            downloadSessionPDF(session, {
                name: patient.name, patient_id: patient.patient_id, blood_type: patient.blood_type,
            });
        } catch (e) { console.error('session PDF error:', e); }
        finally { setDownloadingId(null); }
    };

    /* ─── Shared download button ──────────────────────────────────── */
    const PdfBtn = ({ id, label, icon: Icon, onClick, variant = 'blue' }) => {
        const isLoading = downloadingId === id;
        const variants = {
            blue:   'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
            green:  'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600',
            purple: 'bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600',
        };
        return (
            <button
                onClick={onClick}
                disabled={isLoading}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold
                    shadow-sm transition-all duration-200 select-none
                    disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]}`}
            >
                {isLoading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    : <Icon className="w-3.5 h-3.5 shrink-0" />
                }
                <span>{isLoading ? 'Generating…' : label}</span>
            </button>
        );
    };

    /* ─── Loading / error states ──────────────────────────────────── */
    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-600 dark:text-cyan-400 mx-auto" />
                <p className="mt-3 text-gray-600 dark:text-gray-400">Loading dashboard…</p>
            </div>
        </div>
    );

    if (!dashboardData) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <p className="text-red-600 dark:text-red-400 mb-3">Failed to load dashboard</p>
                <button onClick={fetchDashboardOverview}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                    Retry
                </button>
            </div>
        </div>
    );

    const { patient_info: pi, statistics: st,
            upcoming_appointments: upcomingApts,
            pending_bills: pendingBills,
            recent_sessions: recentSessions } = dashboardData;

    /* ─── Stat card ────────────────────────────────────────────────── */
    const StatCard = ({ label, value, color = 'text-gray-900 dark:text-white' }) => (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    );

    /* ─── Tab classes ───────────────────────────────────────────────── */
    const tabCls = (t) => `whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
        activeTab === t
            ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-slate-500'
    }`;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 transition-colors duration-200">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Patient Portal</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Welcome back, <span className="font-semibold text-cyan-600 dark:text-cyan-400">{pi?.name}</span>
                </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex gap-6 overflow-x-auto">
                    {['overview', 'clinical', 'appointments', 'sessions', 'bills'].map(t => (
                        <button key={t} onClick={() => handleTabChange(t)} className={tabCls(t)}>{t}</button>
                    ))}
                </nav>
            </div>

            {/* ══════════════ OVERVIEW ══════════════ */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Total Sessions"   value={st.total_sessions}                          color="text-gray-900 dark:text-white" />
                        <StatCard label="Total Paid"       value={`Rs.${st.total_paid?.toLocaleString() ?? 0}`} color="text-emerald-600 dark:text-emerald-400" />
                        <StatCard label="Pending Amount"   value={`Rs.${st.pending_amount?.toLocaleString() ?? 0}`} color="text-red-600 dark:text-red-400" />
                        <StatCard label="Next Appointment" value={st.next_appointment || 'None'}              color="text-cyan-600 dark:text-cyan-400" />
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
                            <h2 className="font-semibold text-gray-800 dark:text-white">Upcoming Appointments</h2>
                        </div>
                        <div className="p-5 space-y-3">
                            {upcomingApts?.length > 0 ? upcomingApts.map(apt => (
                                <div key={apt.id} className="flex justify-between items-start p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100">{apt.date}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                            {apt.shift} shift · {apt.scheduled_time || 'TBD'}
                                        </p>
                                        {apt.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{apt.notes}</p>}
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300">
                                        {apt.status}
                                    </span>
                                </div>
                            )) : <p className="text-gray-400 dark:text-gray-500 text-center py-4">No upcoming appointments</p>}
                        </div>
                    </div>

                    {/* Pending Bills */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
                            <h2 className="font-semibold text-gray-800 dark:text-white">Pending Bills</h2>
                        </div>
                        <div className="p-5 space-y-3">
                            {pendingBills?.length > 0 ? pendingBills.map(bill => (
                                <div key={bill.id} className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100">Bill #{bill.bill_number}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            Total: Rs.{Number(bill.total_amount).toFixed(2)} · Paid: Rs.{Number(bill.paid_amount).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-red-600 dark:text-red-400 font-bold text-sm">
                                            Rs.{Number(bill.balance_amount).toFixed(2)} due
                                        </span>
                                        <PdfBtn
                                            id={`receipt-${bill.id}`}
                                            label="Receipt PDF"
                                            icon={Receipt}
                                            onClick={() => handleDownloadReceipt(bill)}
                                            variant="blue"
                                        />
                                    </div>
                                </div>
                            )) : <p className="text-gray-400 dark:text-gray-500 text-center py-4">No pending bills</p>}
                        </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
                            <h2 className="font-semibold text-gray-800 dark:text-white">Recent Sessions</h2>
                        </div>
                        <div className="overflow-x-auto">
                            {recentSessions?.length > 0 ? (
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-slate-700">
                                            {['Date', 'Duration', 'Pre Weight', 'Post Weight', 'Download'].map(h => (
                                                <th key={h} className="text-left py-2 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentSessions.map(s => (
                                            <tr key={s.id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{s.date}</td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{s.duration} min</td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{s.pre_weight} kg</td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{s.post_weight} kg</td>
                                                <td className="py-3 px-4">
                                                    <PdfBtn
                                                        id={`session-${s.id}`}
                                                        label="Session PDF"
                                                        icon={FileText}
                                                        onClick={() => handleDownloadSession(s)}
                                                        variant="green"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="text-gray-400 dark:text-gray-500 text-center py-6">No session history</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════ APPOINTMENTS ══════════════ */}
            {activeTab === 'appointments' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
                        <h2 className="font-semibold text-gray-800 dark:text-white">All Appointments</h2>
                    </div>
                    <div className="p-5 space-y-3">
                        {appointments.length > 0 ? appointments.map(apt => (
                            <div key={apt.id} className="flex justify-between items-start p-3 rounded-lg bg-gray-50 dark:bg-slate-700/40 border border-gray-100 dark:border-slate-600">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{apt.date}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{apt.shift} · {apt.scheduled_time || 'TBD'}</p>
                                    {apt.notes && <p className="text-xs text-gray-400 dark:text-gray-500">{apt.notes}</p>}
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    apt.status === 'completed' ? 'bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300' :
                                    apt.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                }`}>{apt.status}</span>
                            </div>
                        )) : <p className="text-gray-400 dark:text-gray-500 text-center py-6">No appointments found</p>}
                    </div>
                </div>
            )}

            {/* ══════════════ SESSIONS ══════════════ */}
            {activeTab === 'sessions' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
                        <h2 className="font-semibold text-gray-800 dark:text-white">Session History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        {sessions.length > 0 ? (
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-700">
                                        {['Date & Time', 'Duration', 'Machine', 'Weight Loss', 'Download'].map(h => (
                                            <th key={h} className="text-left py-2 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map(s => (
                                        <tr key={s.id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{s.date} {s.time}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{s.duration_minutes} min</td>
                                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{s.machine_number || 'N/A'}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                {s.pre_dialysis_weight && s.post_dialysis_weight
                                                    ? `${(Number(s.pre_dialysis_weight) - Number(s.post_dialysis_weight)).toFixed(2)} kg`
                                                    : 'N/A'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <PdfBtn
                                                    id={`session-${s.id}`}
                                                    label="Session PDF"
                                                    icon={FileText}
                                                    onClick={() => handleDownloadSession(s)}
                                                    variant="green"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p className="text-gray-400 dark:text-gray-500 text-center py-6">No sessions found</p>}
                    </div>
                </div>
            )}

            {/* ══════════════ BILLS ══════════════ */}
            {activeTab === 'bills' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
                        <h2 className="font-semibold text-gray-800 dark:text-white">Bills & Payments</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        {bills.length > 0 ? bills.map(bill => (
                            <div key={bill.id} className={`p-4 rounded-xl border ${
                                bill.balance_amount > 0
                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                                    : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                            }`}>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 dark:text-gray-100">Bill #{bill.bill_number}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{bill.bill_date}</p>
                                        <div className="mt-2 text-sm space-y-0.5 text-gray-700 dark:text-gray-300">
                                            <p>Total: <strong>Rs.{Number(bill.total_amount).toFixed(2)}</strong></p>
                                            <p>Paid:  Rs.{Number(bill.paid_amount).toFixed(2)}</p>
                                            <p className="font-semibold">Balance: Rs.{Number(bill.balance_amount).toFixed(2)}</p>
                                        </div>

                                        {bill.payments?.length > 0 && (
                                            <div className="mt-3 p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Payment History</p>
                                                {bill.payments.map(p => (
                                                    <div key={p.id} className="text-xs text-gray-500 dark:text-gray-400">
                                                        {p.payment_date} · Rs.{Number(p.amount).toFixed(2)} · {p.payment_mode}
                                                        {p.transaction_id && <span className="text-gray-400 dark:text-gray-500"> · {p.transaction_id}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span className={`text-sm font-bold ${bill.balance_amount > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {bill.balance_amount > 0 ? `Rs.${Number(bill.balance_amount).toFixed(2)} due` : '✓ Fully Paid'}
                                        </span>
                                        <PdfBtn
                                            id={`receipt-${bill.id}`}
                                            label="Receipt PDF"
                                            icon={Receipt}
                                            onClick={() => handleDownloadReceipt(bill)}
                                            variant="blue"
                                        />
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-gray-400 dark:text-gray-500 text-center py-6">No bills found</p>}
                    </div>
                </div>
            )}

            {/* ══════════════ CLINICAL ══════════════ */}
            {activeTab === 'clinical' && (
                <ClinicalDataPanel
                    patientId={pi?.id}
                    patientName={pi?.name}
                    readOnly={true}
                />
            )}
        </div>
    );
};

export default PatientDashboard;
