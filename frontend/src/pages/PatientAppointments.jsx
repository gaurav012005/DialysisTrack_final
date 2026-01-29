import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import RefreshButton from '../components/RefreshButton';
import { handleApiError } from '../utils/errorHandler';
import config from '../config/environment';

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, past
    const { user, refreshToken, logout } = useAuth();

    // Helper function to make authenticated requests
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
            // Use the my_appointments endpoint which filters for the current user
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
            'scheduled': '📅',
            'checked_in': '✅',
            'in_progress': '⚙️',
            'completed': '✔️',
            'cancelled': '❌',
            'no_show': '⚠️'
        };
        return icons[status] || '📋';
    };

    const getShiftIcon = (shift) => {
        const icons = {
            'morning': '🌅',
            'evening': '🌆',
            'night': '🌙'
        };
        return icons[shift] || '⏰';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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

    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'upcoming') return isUpcoming(apt);
        if (filter === 'past') return isPast(apt);
        return true;
    });

    const upcomingCount = appointments.filter(isUpcoming).length;
    const completedCount = appointments.filter(apt => apt.status === 'completed').length;

    if (loading) {
        return <LoadingSpinner message="Loading your appointments..." />;
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                    <p className="text-gray-600">View and manage your dialysis appointments</p>
                </div>
                <RefreshButton onClick={fetchAppointments} loading={loading} />
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
                    <div className="text-gray-600">Total Appointments</div>
                </div>
                <div className="card text-center">
                    <div className="text-3xl mb-2">📅</div>
                    <div className="text-2xl font-bold text-blue-600">{upcomingCount}</div>
                    <div className="text-gray-600">Upcoming</div>
                </div>
                <div className="card text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                    <div className="text-gray-600">Completed</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="card">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All Appointments
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'upcoming'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Upcoming ({upcomingCount})
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'past'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Past
                    </button>
                </div>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
                <div className="medical-card text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Appointments Found</h3>
                    <p className="text-gray-600">
                        {filter === 'upcoming'
                            ? "You don't have any upcoming appointments scheduled."
                            : filter === 'past'
                                ? "You don't have any past appointments."
                                : "You don't have any appointments yet. Contact your healthcare provider to schedule one."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAppointments.map((appointment) => (
                        <div key={appointment.id} className="medical-card hover:shadow-2xl transition-all duration-300">
                            {/* Appointment Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="text-3xl">{getShiftIcon(appointment.shift)}</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {formatDate(appointment.appointment_date)}
                                        </h3>
                                        <p className="text-sm text-gray-600 capitalize">
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
                                <div className="flex items-center space-x-2 text-gray-700">
                                    <span className="text-xl">⏰</span>
                                    <span className="font-medium">Scheduled Time:</span>
                                    <span className="text-gray-900 font-semibold">
                                        {formatTime(appointment.scheduled_time)}
                                    </span>
                                </div>

                                {appointment.machine_number && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <span className="text-xl">🏥</span>
                                        <span className="font-medium">Machine:</span>
                                        <span className="text-gray-900 font-semibold">
                                            {appointment.machine_number}
                                        </span>
                                    </div>
                                )}

                                {appointment.actual_start_time && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <span className="text-xl">▶️</span>
                                        <span className="font-medium">Started:</span>
                                        <span className="text-gray-900 font-semibold">
                                            {formatTime(appointment.actual_start_time)}
                                        </span>
                                    </div>
                                )}

                                {appointment.actual_end_time && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <span className="text-xl">⏹️</span>
                                        <span className="font-medium">Ended:</span>
                                        <span className="text-gray-900 font-semibold">
                                            {formatTime(appointment.actual_end_time)}
                                        </span>
                                    </div>
                                )}

                                {appointment.notes && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-start space-x-2">
                                            <span className="text-lg">📝</span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Notes:</p>
                                                <p className="text-sm text-gray-600">{appointment.notes}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Appointment Footer */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>Created: {new Date(appointment.created_at).toLocaleDateString()}</span>
                                    {appointment.updated_at !== appointment.created_at && (
                                        <span>Updated: {new Date(appointment.updated_at).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Help Section */}
            <div className="medical-card bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200">
                <div className="flex items-start space-x-4">
                    <div className="text-4xl">💡</div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
                        <p className="text-gray-700 mb-2">
                            If you need to schedule a new appointment or have questions about your existing appointments,
                            please contact the reception desk.
                        </p>
                        <div className="flex items-center space-x-2 text-cyan-700">
                            <span className="text-xl">📞</span>
                            <span className="font-medium">Contact: reception@dialysis.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientAppointments;
