import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyRides, updateRideStatus, updateRideLocation } from '../api/fleet';
import { handleApiError } from '../utils/errorHandler';
import LoadingSpinner from '../components/LoadingSpinner';
import { Navigation, MapPin, CheckCircle2, Phone, Radio, AlertTriangle, Truck } from 'lucide-react';

const DriverDashboard = () => {
    const { user } = useAuth();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [broadcasting, setBroadcasting] = useState(false);
    const [broadcastMode, setBroadcastMode] = useState(null); // 'websocket' | 'http'
    const [currentLocation, setCurrentLocation] = useState(null);
    const [simulated, setSimulated] = useState(false);
    const wsRef = useRef(null);
    const watchIdRef = useRef(null);

    useEffect(() => {
        loadRides();
        return () => {
            stopBroadcasting();
        };
    }, []);

    const loadRides = async () => {
        try {
            const res = await getMyRides();
            setRides(res.data?.results || res.data || []);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (rideId, status) => {
        try {
            await updateRideStatus(rideId, status);
            loadRides();
            if (status === 'completed' || status === 'cancelled') {
                stopBroadcasting();
            }
        } catch (error) {
            handleApiError(error);
        }
    };

    const startLocationWatch = useCallback((rideId, sendFn) => {
        if (simulated) {
            // Simulate GPS for testing
            let lat = 19.0760;
            let lng = 72.8777;
            const interval = setInterval(() => {
                lat += (Math.random() - 0.5) * 0.001;
                lng += (Math.random() - 0.5) * 0.001;
                setCurrentLocation({ lat, lng });
                sendFn({ lat, lng });
            }, 2000);
            watchIdRef.current = interval;
        } else {
            // Real GPS
            if ('geolocation' in navigator) {
                watchIdRef.current = navigator.geolocation.watchPosition(
                    (pos) => {
                        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        setCurrentLocation(loc);
                        sendFn(loc);
                    },
                    (err) => {
                        console.error('[GPS] Error:', err.message);
                        alert('GPS access denied. Enable location services or use simulated mode.');
                    },
                    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
                );
            } else {
                alert('Geolocation is not supported by your browser.');
            }
        }
    }, [simulated]);

    const startHttpBroadcasting = useCallback((rideId) => {
        console.log('[GPS] Starting HTTP broadcasting for ride', rideId);
        setBroadcasting(true);
        setBroadcastMode('http');

        const sendViaHttp = async (loc) => {
            try {
                await updateRideLocation(rideId, loc);
            } catch (err) {
                console.error('[GPS] HTTP send error:', err);
            }
        };

        startLocationWatch(rideId, sendViaHttp);
    }, [startLocationWatch]);

    const startBroadcasting = useCallback((rideId) => {
        // Try WebSocket first
        const wsUrl = `ws://localhost:8000/ws/location/${rideId}/`;

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            const connectionTimeout = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    console.log('[GPS] WebSocket timeout, falling back to HTTP');
                    ws.close();
                    startHttpBroadcasting(rideId);
                }
            }, 5000);

            ws.onopen = () => {
                clearTimeout(connectionTimeout);
                console.log('[GPS] WebSocket connected');
                setBroadcasting(true);
                setBroadcastMode('websocket');

                const sendViaWs = (loc) => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify(loc));
                    }
                };

                startLocationWatch(rideId, sendViaWs);
            };

            ws.onclose = () => {
                clearTimeout(connectionTimeout);
                console.log('[GPS] WebSocket disconnected');
                // Don't stop broadcasting if we can fallback to HTTP
                if (broadcasting && broadcastMode === 'websocket') {
                    console.log('[GPS] Switching to HTTP fallback...');
                    startHttpBroadcasting(rideId);
                }
            };

            ws.onerror = (err) => {
                clearTimeout(connectionTimeout);
                console.error('[GPS] WebSocket error:', err);
            };
        } catch (err) {
            console.error('[GPS] WebSocket creation failed, using HTTP');
            startHttpBroadcasting(rideId);
        }
    }, [simulated, startLocationWatch, startHttpBroadcasting, broadcasting, broadcastMode]);

    const stopBroadcasting = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        if (watchIdRef.current) {
            if (simulated) {
                clearInterval(watchIdRef.current);
            } else {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
            watchIdRef.current = null;
        }
        setBroadcasting(false);
        setBroadcastMode(null);
        setCurrentLocation(null);
    }, [simulated]);

    const getStatusSteps = (status) => {
        const steps = ['assigned', 'en_route', 'arrived', 'completed'];
        const currentIdx = steps.indexOf(status);
        return steps.map((s, i) => ({
            label: s.replace('_', ' ').toUpperCase(),
            active: i <= currentIdx,
            current: i === currentIdx,
        }));
    };

    if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

    const activeRide = rides[0]; // Driver typically has one active ride

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Driver Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Welcome, {user?.first_name || 'Driver'}</p>
            </div>

            {!activeRide ? (
                <div className="card text-center py-12">
                    <div className="flex justify-center mb-4"><Truck className="w-16 h-16 text-gray-300 dark:text-gray-600" /></div>
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Active Rides</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        You don't have any active rides assigned. Please wait for a dispatch or contact the reception desk.
                    </p>
                    <button onClick={loadRides} className="btn-primary mt-4">Refresh</button>
                </div>
            ) : (
                <>
                    {/* Progress Stepper */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ride Progress</h2>
                        <div className="flex items-center justify-between">
                            {getStatusSteps(activeRide.status).map((step, i) => (
                                <div key={step.label} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step.current ? 'bg-cyan-500 text-white ring-4 ring-cyan-200 dark:ring-cyan-800' :
                                            step.active ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'
                                            }`}>
                                            {step.active && !step.current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                        </div>
                                        <span className={`text-xs mt-1 ${step.current ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {i < 3 && (
                                        <div className={`flex-1 h-0.5 mx-2 ${step.active ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ride Details */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ride Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Truck className="w-5 h-5 text-cyan-500" />
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Ambulance</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{activeRide.ambulance_number}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-cyan-500" />
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Patient</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{activeRide.patient_name}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 md:col-span-2">
                                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Pickup Address</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{activeRide.pickup_address}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GPS Broadcasting */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">GPS Broadcasting</h2>
                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <input
                                    type="checkbox"
                                    checked={simulated}
                                    onChange={(e) => setSimulated(e.target.checked)}
                                    disabled={broadcasting}
                                    className="rounded"
                                />
                                Simulate GPS
                            </label>
                        </div>

                        {broadcasting ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <Radio className="w-5 h-5 animate-pulse" />
                                    <span className="font-medium">
                                        Broadcasting live location{broadcastMode === 'http' ? ' (HTTP)' : ' (WebSocket)'}...
                                    </span>
                                </div>
                                {currentLocation && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-50 dark:bg-slate-800 p-2 rounded">
                                        Lat: {currentLocation.lat?.toFixed(6)}, Lng: {currentLocation.lng?.toFixed(6)}
                                    </div>
                                )}
                                <button onClick={stopBroadcasting} className="btn-danger flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Stop Broadcasting
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => startBroadcasting(activeRide.id)}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Navigation className="w-4 h-4" /> Start GPS Broadcasting
                            </button>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                        <div className="flex flex-wrap gap-3">
                            {activeRide.status === 'assigned' && (
                                <button
                                    onClick={() => handleStatusUpdate(activeRide.id, 'en_route')}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <Navigation className="w-4 h-4" /> Start Trip
                                </button>
                            )}
                            {activeRide.status === 'en_route' && (
                                <button
                                    onClick={() => handleStatusUpdate(activeRide.id, 'arrived')}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <MapPin className="w-4 h-4" /> Mark Arrived
                                </button>
                            )}
                            {activeRide.status === 'arrived' && (
                                <button
                                    onClick={() => handleStatusUpdate(activeRide.id, 'completed')}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Complete Ride
                                </button>
                            )}
                            {['assigned', 'en_route', 'arrived'].includes(activeRide.status) && (
                                <button
                                    onClick={() => { if (confirm('Cancel this ride?')) handleStatusUpdate(activeRide.id, 'cancelled'); }}
                                    className="btn-danger flex items-center gap-2"
                                >
                                    <AlertTriangle className="w-4 h-4" /> Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DriverDashboard;
