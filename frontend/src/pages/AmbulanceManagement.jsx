import React, { useState, useEffect } from 'react';
import { getAmbulances, createAmbulance, updateAmbulance, deleteAmbulance, getDrivers, createDriver, updateDriver, deleteDriver, dispatchAmbulance, getRides } from '../api/fleet';
import { handleApiError } from '../utils/errorHandler';
import LoadingSpinner from '../components/LoadingSpinner';
import RefreshButton from '../components/RefreshButton';
import { Truck, Users, Plus, Edit2, Trash2, Send, AlertTriangle, CheckCircle2, Wrench, XCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const AmbulanceManagement = () => {
    const [ambulances, setAmbulances] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ambulances');
    const [showModal, setShowModal] = useState(null); // 'ambulance' | 'driver' | 'dispatch' | null
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [ambRes, drvRes, rideRes] = await Promise.all([
                getAmbulances(),
                getDrivers(),
                getRides()
            ]);
            const ambData = ambRes.data?.results || ambRes.data;
            setAmbulances(Array.isArray(ambData) ? ambData : []);
            
            const drvData = drvRes.data?.results || drvRes.data;
            setDrivers(Array.isArray(drvData) ? drvData : []);
            
            const rideData = rideRes.data?.results || rideRes.data;
            setRides(Array.isArray(rideData) ? rideData : []);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAmbulance = async () => {
        try {
            if (editItem) {
                await updateAmbulance(editItem.id, formData);
            } else {
                await createAmbulance(formData);
            }
            setShowModal(null);
            setEditItem(null);
            setFormData({});
            loadData();
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleDeleteAmbulance = async (id) => {
        if (!confirm('Delete this ambulance?')) return;
        try {
            await deleteAmbulance(id);
            loadData();
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleSaveDriver = async () => {
        try {
            if (editItem) {
                await updateDriver(editItem.id, formData);
            } else {
                await createDriver(formData);
            }
            setShowModal(null);
            setEditItem(null);
            setFormData({});
            loadData();
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleDeleteDriver = async (id) => {
        if (!confirm('Deactivate this driver?')) return;
        try {
            await deleteDriver(id);
            loadData();
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleDispatch = async () => {
        try {
            await dispatchAmbulance(formData);
            setShowModal(null);
            setFormData({});
            loadData();
        } catch (error) {
            handleApiError(error);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            available: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle2 className='w-3.5 h-3.5' /> },
            on_trip: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: <Truck className='w-3.5 h-3.5' /> },
            maintenance: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <Wrench className='w-3.5 h-3.5' /> },
        };
        const s = map[status] || { color: 'bg-gray-100 text-gray-800', icon: null };
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                {s.icon} {status?.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    if (loading) return <LoadingSpinner message="Loading fleet data..." />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Fleet Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Manage ambulances, drivers, and dispatches</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <RefreshButton onClick={loadData} loading={loading} />
                    <button
                        onClick={() => { setShowModal('dispatch'); setFormData({}); }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" /> Dispatch
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card text-center">
                    <div className="flex justify-center mb-2"><Truck className="w-8 h-8 text-cyan-500" /></div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{ambulances.length}</div>
                    <div className="text-gray-600 dark:text-gray-400">Total Ambulances</div>
                </div>
                <div className="card text-center">
                    <div className="flex justify-center mb-2"><CheckCircle2 className="w-8 h-8 text-green-500" /></div>
                    <div className="text-2xl font-bold text-green-600">{ambulances.filter(a => a.status === 'available').length}</div>
                    <div className="text-gray-600 dark:text-gray-400">Available</div>
                </div>
                <div className="card text-center">
                    <div className="flex justify-center mb-2"><Send className="w-8 h-8 text-blue-500" /></div>
                    <div className="text-2xl font-bold text-blue-600">{ambulances.filter(a => a.status === 'on_trip').length}</div>
                    <div className="text-gray-600 dark:text-gray-400">On Trip</div>
                </div>
                <div className="card text-center">
                    <div className="flex justify-center mb-2"><Users className="w-8 h-8 text-purple-500" /></div>
                    <div className="text-2xl font-bold text-purple-600">{drivers.length}</div>
                    <div className="text-gray-600 dark:text-gray-400">Drivers</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200 dark:border-slate-700">
                {['ambulances', 'drivers', 'rides'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium capitalize transition-colors ${activeTab === tab
                            ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Ambulances Tab */}
            {activeTab === 'ambulances' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => { setShowModal('ambulance'); setEditItem(null); setFormData({}); }}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Ambulance
                        </button>
                    </div>
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vehicle #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Driver</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                                    {ambulances.map((amb) => (
                                        <tr key={amb.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{amb.vehicle_number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{amb.driver_name || 'Unassigned'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(amb.status)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                <button
                                                    onClick={() => { setShowModal('ambulance'); setEditItem(amb); setFormData({ vehicle_number: amb.vehicle_number, driver: amb.driver, status: amb.status }); }}
                                                    className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-400"
                                                >
                                                    <Edit2 className="w-4 h-4 inline" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAmbulance(amb.id)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {ambulances.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                No ambulances registered yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Drivers Tab */}
            {activeTab === 'drivers' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => { setShowModal('driver'); setEditItem(null); setFormData({}); }}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Driver
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {drivers.map((drv) => (
                            <div key={drv.id} className="card">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{drv.first_name} {drv.last_name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{drv.email}</p>
                                        {drv.phone_number && <p className="text-sm text-gray-500 dark:text-gray-400">{drv.phone_number}</p>}
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => { setShowModal('driver'); setEditItem(drv); setFormData(drv); }}
                                            className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 p-1"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDriver(drv.id)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {drivers.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">No drivers registered yet.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Rides Tab */}
            {activeTab === 'rides' && (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ride #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ambulance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                                {rides.map((ride) => (
                                    <tr key={ride.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">#{ride.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{ride.ambulance_number}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{ride.patient_name}</td>
                                        <td className="px-6 py-4">{getStatusBadge(ride.status)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center justify-between">
                                                <span>{new Date(ride.created_at).toLocaleString()}</span>
                                                <Link
                                                    to={`/track-ambulance/${ride.id}`}
                                                    className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 font-medium ml-4 text-sm flex items-center gap-1"
                                                >
                                                    <MapPin className="w-4 h-4" /> Track
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rides.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No rides yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            {showModal === 'ambulance' ? (editItem ? 'Edit Ambulance' : 'Add Ambulance') :
                                showModal === 'driver' ? (editItem ? 'Edit Driver' : 'Add Driver') :
                                    'Dispatch Ambulance'}
                        </h3>

                        {showModal === 'ambulance' && (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Vehicle Number"
                                    value={formData.vehicle_number || ''}
                                    onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                                    className="input-field"
                                />
                                <select
                                    value={formData.driver || ''}
                                    onChange={(e) => setFormData({ ...formData, driver: e.target.value || null })}
                                    className="input-field"
                                >
                                    <option value="">Select Driver (Optional)</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                                    ))}
                                </select>
                                <select
                                    value={formData.status || 'available'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="available">Available</option>
                                    <option value="on_trip">On Trip</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                        )}

                        {showModal === 'driver' && (
                            <div className="space-y-4">
                                <input type="text" placeholder="First Name" value={formData.first_name || ''} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="input-field" />
                                <input type="text" placeholder="Last Name" value={formData.last_name || ''} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="input-field" />
                                <input type="email" placeholder="Email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" />
                                <input type="text" placeholder="Phone Number" value={formData.phone_number || ''} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="input-field" />
                                {!editItem && (
                                    <input type="password" placeholder="Password (default: Driver@123)" value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" />
                                )}
                            </div>
                        )}

                        {showModal === 'dispatch' && (
                            <div className="space-y-4">
                                <select
                                    value={formData.ambulance || ''}
                                    onChange={(e) => setFormData({ ...formData, ambulance: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Select Ambulance</option>
                                    {ambulances.filter(a => a.status === 'available').map(a => (
                                        <option key={a.id} value={a.id}>{a.vehicle_number} — {a.driver_name || 'No driver'}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Patient ID"
                                    value={formData.patient || ''}
                                    onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                                    className="input-field"
                                />
                                <textarea
                                    placeholder="Pickup Address"
                                    value={formData.pickup_address || ''}
                                    onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                                    className="input-field"
                                    rows={3}
                                />
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => { setShowModal(null); setEditItem(null); setFormData({}); }}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={showModal === 'ambulance' ? handleSaveAmbulance : showModal === 'driver' ? handleSaveDriver : handleDispatch}
                                className="btn-primary"
                            >
                                {showModal === 'dispatch' ? 'Dispatch' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AmbulanceManagement;
