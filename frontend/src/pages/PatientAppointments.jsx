import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import RefreshButton from '../components/RefreshButton';
import { handleApiError } from '../utils/errorHandler';
import config from '../config/environment';
import { downloadAppointmentPDF } from '../utils/pdfDownload';
import {
    Calendar, CheckCircle2, Settings, CircleCheck, XCircle,
    AlertTriangle, ClipboardList, Sunrise, Sunset, Moon, Clock,
    Building2, Play, Square, FileText, Lightbulb, Phone, BarChart3,
    PlusCircle, X, Download, Loader2
} from 'lucide-react';

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);
    const [bookingData, setBookingData] = useState({
        appointment_date: '',
        shift: 'morning',
        scheduled_time: '08:00',
        notes: ''
    });
    const { user, refreshToken, logout } = useAuth();

    // Helper function to make authenticated requests
    const fetchWithAuth = async (url, options = {}) => {
        let token = localStorage.getItem('authToken');
        if (!token) throw new Error('No authentication token');

        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (response.status === 401) {
            try {
                token = await refreshToken();
                return fetch(url, {
                    ...options,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        ...options.headers
                    }
                });
            } catch (refreshError) {
                logout();
                throw new Error('Session expired. Please login again.');
            }
        }

        return response;
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(`${config.API_BASE_URL}appointments/my_appointments/`);

            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
            } else {
                handleApiError(new Error(`Failed to fetch appointments: ${response.status}`));
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // ─── Booking form helpers ─────────────────────────────────
    const getShiftDefaultTime = (shift) => {
        return { morning: '08:00', evening: '13:00', night: '19:00' }[shift] || '08:00';
    };

    const handleShiftChange = (shift) => {
        setBookingData(prev => ({
            ...prev,
            shift,
            scheduled_time: getShiftDefaultTime(shift)
        }));
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        setBookingError('');
        setBookingSuccess('');

        // Client-side validation
        if (!bookingData.appointment_date) {
            setBookingError('Please select a date.');
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(bookingData.appointment_date) < today) {
            setBookingError('Appointment date cannot be in the past.');
            return;
        }

        try {
            setBookingLoading(true);
            const response = await fetchWithAuth(`${config.API_BASE_URL}appointments/book_appointment/`, {
                method: 'POST',
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (response.ok) {
                setBookingSuccess(`✅ Appointment booked for ${bookingData.appointment_date} (${bookingData.shift} shift)! You will receive a notification shortly.`);
                setBookingData({
                    appointment_date: '',
                    shift: 'morning',
                    scheduled_time: '08:00',
                    notes: ''
                });
                fetchAppointments(); // Refresh list
                setTimeout(() => {
                    setShowBookingForm(false);
                    setBookingSuccess('');
                }, 3000);
            } else {
                setBookingError(data.error || 'Failed to book appointment. Please try again.');
            }
        } catch (error) {
            setBookingError('Network error. Please check your connection and try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    // ─── Display helpers ──────────────────────────────────────
    const getStatusColor = (status) => {
        const colors = {
            'scheduled': 'badge-primary',
            'checked_in': 'badge-warning',
            'in_progress': 'badge-warning',
            'completed': 'badge-success',
            'cancelled': 'badge-danger',
            'no_show': 'badge-danger'
        };
        return colors[status] || 'badge-primary';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'scheduled': <Calendar className="w-4 h-4 inline" />,
            'checked_in': <CheckCircle2 className="w-4 h-4 inline" />,
            'in_progress': <Settings className="w-4 h-4 inline" />,
            'completed': <CircleCheck className="w-4 h-4 inline" />,
            'cancelled': <XCircle className="w-4 h-4 inline" />,
            'no_show': <AlertTriangle className="w-4 h-4 inline" />
        };
        return icons[status] || <ClipboardList className="w-4 h-4 inline" />;
    };

    const getShiftIcon = (shift) => {
        const icons = {
            'morning': <Sunrise className="w-7 h-7 text-amber-500" />,
            'evening': <Sunset className="w-7 h-7 text-orange-500" />,
            'night': <Moon className="w-7 h-7 text-indigo-500" />
        };
        return icons[shift] || <Clock className="w-7 h-7 text-gray-500" />;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'Not set';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const isUpcoming = (appointment) => {
        const appointmentDate = new Date(appointment.appointment_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return appointmentDate >= today && appointment.status !== 'completed' && appointment.status !== 'cancelled';
    };

    const isPast = (appointment) => {
        const appointmentDate = new Date(appointment.appointment_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return appointmentDate < today || appointment.status === 'completed' || appointment.status === 'cancelled';
    };

    const handleDownloadAppointment = async (appointment) => {
        setDownloadingId(appointment.id);
        await new Promise(r => setTimeout(r, 50)); // let spinner render
        try {
            const patientUser = JSON.parse(localStorage.getItem('user') || '{}');
            downloadAppointmentPDF(appointment, {
                name: `${patientUser.first_name || ''} ${patientUser.last_name || ''}`.trim() || 'Patient',
                patient_id: patientUser.patient_id || 'N/A',
            });
        } catch (err) {
            console.error('PDF error:', err);
        } finally {
            setDownloadingId(null);
        }
    };


    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'upcoming') return isUpcoming(apt);
        if (filter === 'past') return isPast(apt);
        return true;
    });

    const upcomingCount = appointments.filter(isUpcoming).length;
    const completedCount = appointments.filter(apt => apt.status === 'completed').length;

    // Minimum bookable date (tomorrow)
    const minDate = (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    })();

    if (loading) {
        return <LoadingSpinner message="Loading your appointments..." />;
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
                    <p className="text-gray-600 dark:text-gray-400">View and manage your dialysis appointments</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setShowBookingForm(true); setBookingError(''); setBookingSuccess(''); }}
                        className="btn-primary flex items-center gap-2"
                        id="btn-book-appointment"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Book Appointment
                    </button>
                    <RefreshButton onClick={fetchAppointments} loading={loading} />
                </div>
            </div>

            {/* ── Booking Form Modal ─────────────────────────── */}
            {showBookingForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5" /> Book New Appointment
                            </h2>
                            <button
                                onClick={() => setShowBookingForm(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleBookAppointment} className="p-6 space-y-5">
                            {bookingError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
                                    ❌ {bookingError}
                                </div>
                            )}
                            {bookingSuccess && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300 text-sm">
                                    {bookingSuccess}
                                </div>
                            )}

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Appointment Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    min={minDate}
                                    value={bookingData.appointment_date}
                                    onChange={e => setBookingData(prev => ({ ...prev, appointment_date: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    required
                                />
                            </div>

                            {/* Shift */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Shift <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'morning', label: 'Morning', icon: '🌅', time: '6AM–12PM' },
                                        { value: 'evening', label: 'Evening', icon: '🌇', time: '12PM–6PM' },
                                        { value: 'night',   label: 'Night',   icon: '🌙', time: '6PM–12AM' }
                                    ].map(s => (
                                        <button
                                            key={s.value}
                                            type="button"
                                            onClick={() => handleShiftChange(s.value)}
                                            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                                                bookingData.shift === s.value
                                                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                                                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                                            }`}
                                        >
                                            <span className="text-2xl">{s.icon}</span>
                                            <span className="text-sm font-medium mt-1 text-gray-800 dark:text-gray-200">{s.label}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{s.time}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scheduled Time */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Preferred Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={bookingData.scheduled_time}
                                    onChange={e => setBookingData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    required
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Any special requirement or message..."
                                    value={bookingData.notes}
                                    onChange={e => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowBookingForm(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bookingLoading}
                                    className="flex-1 py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card text-center dark:bg-slate-800 dark:border-slate-700">
                    <div className="flex justify-center mb-2"><BarChart3 className="w-8 h-8 text-cyan-500" /></div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{appointments.length}</div>
                    <div className="text-gray-600 dark:text-gray-400">Total Appointments</div>
                </div>
                <div className="card text-center dark:bg-slate-800 dark:border-slate-700">
                    <div className="flex justify-center mb-2"><Calendar className="w-8 h-8 text-blue-500" /></div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{upcomingCount}</div>
                    <div className="text-gray-600 dark:text-gray-400">Upcoming</div>
                </div>
                <div className="card text-center dark:bg-slate-800 dark:border-slate-700">
                    <div className="flex justify-center mb-2"><CheckCircle2 className="w-8 h-8 text-green-500" /></div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedCount}</div>
                    <div className="text-gray-600 dark:text-gray-400">Completed</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="card">
                <div className="flex space-x-2 flex-wrap gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
                    >
                        All Appointments
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={filter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}
                    >
                        Upcoming ({upcomingCount})
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={filter === 'past' ? 'btn-primary' : 'btn-secondary'}
                    >
                        Past
                    </button>
                </div>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
                <div className="medical-card text-center py-12">
                    <div className="flex justify-center mb-4"><Calendar className="w-16 h-16 text-gray-300" /></div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Appointments Found</h3>
                    <p className="text-gray-600 mb-4">
                        {filter === 'upcoming'
                            ? "You don't have any upcoming appointments scheduled."
                            : filter === 'past'
                                ? "You don't have any past appointments."
                                : "You don't have any appointments yet."}
                    </p>
                    {filter !== 'past' && (
                        <button
                            onClick={() => setShowBookingForm(true)}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <PlusCircle className="w-5 h-5" /> Book Your First Appointment
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAppointments.map((appointment) => (
                        <div key={appointment.id} className="medical-card hover:shadow-2xl transition-all duration-300 dark:bg-slate-800 dark:border-slate-700">
                            {/* Appointment Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="text-3xl">{getShiftIcon(appointment.shift)}</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {formatDate(appointment.appointment_date)}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                            {appointment.shift} Shift
                                        </p>
                                    </div>
                                </div>
                                <span className={`badge ${getStatusColor(appointment.status)}`}>
                                    {getStatusIcon(appointment.status)} {appointment.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            {/* Appointment Details */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                                    <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    <span className="font-medium">Scheduled Time:</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                        {formatTime(appointment.scheduled_time)}
                                    </span>
                                </div>

                                {appointment.machine_number && (
                                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                                        <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        <span className="font-medium">Machine:</span>
                                        <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                            {appointment.machine_number}
                                        </span>
                                    </div>
                                )}

                                {appointment.actual_start_time && (
                                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                                        <Play className="w-5 h-5 text-green-500" />
                                        <span className="font-medium">Started:</span>
                                        <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                            {formatTime(appointment.actual_start_time)}
                                        </span>
                                    </div>
                                )}

                                {appointment.actual_end_time && (
                                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                                        <Square className="w-5 h-5 text-red-500" />
                                        <span className="font-medium">Ended:</span>
                                        <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                            {formatTime(appointment.actual_end_time)}
                                        </span>
                                    </div>
                                )}

                                {appointment.notes && (
                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-start space-x-2">
                                            <FileText className="w-5 h-5 text-blue-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.notes}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Appointment Footer */}
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                                <div className="flex justify-between items-center">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        <span>Booked: {new Date(appointment.created_at).toLocaleDateString()}</span>
                                        {appointment.updated_at !== appointment.created_at && (
                                            <span className="ml-3">Updated: {new Date(appointment.updated_at).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDownloadAppointment(appointment)}
                                        disabled={downloadingId === appointment.id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {downloadingId === appointment.id
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                            : <Download className="w-3.5 h-3.5 shrink-0" />
                                        }
                                        {downloadingId === appointment.id ? 'Generating…' : 'Download PDF'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Help Section */}
            <div className="medical-card bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-2 border-cyan-200 dark:border-cyan-800">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0"><Lightbulb className="w-10 h-10 text-amber-500" /></div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Need Help?</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                            You can book appointments directly from this page. For urgent changes or cancellations,
                            please contact the reception desk.
                        </p>
                        <div className="flex items-center space-x-2 text-cyan-700 dark:text-cyan-400">
                            <Phone className="w-5 h-5" />
                            <span className="font-medium">Contact: reception@dialysis.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientAppointments;
