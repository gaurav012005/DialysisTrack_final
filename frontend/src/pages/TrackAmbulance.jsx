import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRide, getPatientActiveRide, getRideLocation } from '../api/fleet';
import { handleApiError } from '../utils/errorHandler';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Radio, MapPin, Truck, Clock, AlertTriangle, Navigation, Phone, RefreshCw } from 'lucide-react';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

const TrackAmbulance = () => {
    const { id } = useParams();
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [driverLocation, setDriverLocation] = useState(null);
    const [connected, setConnected] = useState(false);
    const [trackingMode, setTrackingMode] = useState('connecting'); // 'websocket' | 'polling' | 'connecting'
    const [lastUpdated, setLastUpdated] = useState(null);
    const [locationHistory, setLocationHistory] = useState([]);
    const wsRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const pickupMarkerRef = useRef(null);
    const hospitalMarkerRef = useRef(null);
    const polylineRef = useRef(null);
    const mapContainerRef = useRef(null);
    const leafletLoaded = useRef(false);
    const pollingIntervalRef = useRef(null);
    const LRef = useRef(null);

    useEffect(() => {
        loadRide();
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, [id]);

    const loadRide = async () => {
        try {
            let res;
            if (id) {
                res = await getRide(id);
            } else {
                res = await getPatientActiveRide();
            }
            setRide(res.data);

            // If ride already has saved location, use it as initial
            if (res.data.driver_lat && res.data.driver_lng) {
                const loc = { lat: parseFloat(res.data.driver_lat), lng: parseFloat(res.data.driver_lng) };
                setDriverLocation(loc);
            }

            connectWebSocket(res.data.id);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const connectWebSocket = (rideId) => {
        const targetId = id || rideId;
        const wsUrl = `ws://localhost:8000/ws/location/${targetId}/`;

        setTrackingMode('connecting');

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            const connectionTimeout = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    console.log('[Track] WebSocket timeout, switching to HTTP polling');
                    ws.close();
                    startPolling(targetId);
                }
            }, 5000);

            ws.onopen = () => {
                clearTimeout(connectionTimeout);
                console.log('[Track] WebSocket connected');
                setConnected(true);
                setTrackingMode('websocket');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.lat && data.lng) {
                        const loc = { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
                        setDriverLocation(loc);
                        setLastUpdated(new Date());
                        setLocationHistory(prev => [...prev.slice(-50), loc]);
                        updateMapMarker(loc);
                        updatePolyline([...locationHistory, loc]);

                        // Update ride status if changed
                        if (data.status && data.status !== ride?.status) {
                            setRide(prev => prev ? { ...prev, status: data.status } : prev);
                        }
                    }
                } catch (e) {
                    console.error('[Track] Parse error:', e);
                }
            };

            ws.onclose = () => {
                clearTimeout(connectionTimeout);
                console.log('[Track] WebSocket disconnected');
                setConnected(false);
                // Auto-fallback to HTTP polling
                if (trackingMode !== 'polling') {
                    startPolling(targetId);
                }
            };

            ws.onerror = (err) => {
                clearTimeout(connectionTimeout);
                console.error('[Track] WebSocket error:', err);
                startPolling(targetId);
            };
        } catch (err) {
            console.error('[Track] WebSocket creation failed:', err);
            startPolling(id || rideId);
        }
    };

    const startPolling = useCallback((rideId) => {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

        setTrackingMode('polling');
        console.log('[Track] Starting HTTP polling for ride', rideId);

        const poll = async () => {
            try {
                const res = await getRideLocation(rideId);
                const data = res.data;
                if (data.lat && data.lng) {
                    const loc = { lat: data.lat, lng: data.lng };
                    setDriverLocation(loc);
                    setLastUpdated(data.updated_at ? new Date(data.updated_at) : new Date());
                    setLocationHistory(prev => {
                        const updated = [...prev.slice(-50), loc];
                        updatePolyline(updated);
                        return updated;
                    });
                    updateMapMarker(loc);
                }
                if (data.status) {
                    setRide(prev => prev ? { ...prev, status: data.status } : prev);
                }
            } catch (err) {
                console.error('[Track] Polling error:', err);
            }
        };

        poll(); // Immediate first poll
        pollingIntervalRef.current = setInterval(poll, 3000); // Poll every 3 seconds
    }, []);

    // Initialize map after component mounts
    useEffect(() => {
        if (!loading && mapContainerRef.current && !leafletLoaded.current) {
            initMap();
            leafletLoaded.current = true;
        }
    }, [loading]);

    const initMap = async () => {
        const L = await import('leaflet');
        LRef.current = L;

        // Use saved driver location, or default to Mumbai
        const center = driverLocation
            ? [driverLocation.lat, driverLocation.lng]
            : [19.0760, 72.8777];

        const map = L.map(mapContainerRef.current).setView(center, 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        }).addTo(map);

        // Custom ambulance icon with pulse animation
        const ambulanceIcon = L.divIcon({
            className: 'custom-ambulance-marker',
            html: `<div style="
                background: linear-gradient(135deg, #06b6d4, #0891b2);
                width: 42px; height: 42px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 15px rgba(6, 182, 212, 0.5);
                border: 3px solid white;
                animation: pulse-ring 1.5s infinite;
                position: relative;
            ">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 10H6V14H10V10Z"/><path d="M18 10H14V14H18V10Z"/>
                    <path d="M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                    <path d="M5 18H3V11L5 6H14L17 11V18H15"/>
                    <path d="M9 18H15"/>
                </svg>
            </div>`,
            iconSize: [42, 42],
            iconAnchor: [21, 21],
        });

        // Pickup location icon
        const pickupIcon = L.divIcon({
            className: 'custom-pickup-marker',
            html: `<div style="
                background: linear-gradient(135deg, #ef4444, #dc2626);
                width: 32px; height: 32px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 3px 10px rgba(239, 68, 68, 0.4);
                border: 2px solid white;
            ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3" fill="#dc2626"/>
                </svg>
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });

        // Hospital icon
        const hospitalIcon = L.divIcon({
            className: 'custom-hospital-marker',
            html: `<div style="
                background: linear-gradient(135deg, #10b981, #059669);
                width: 32px; height: 32px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 3px 10px rgba(16, 185, 129, 0.4);
                border: 2px solid white;
            ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                </svg>
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });

        // Add ambulance marker
        markerRef.current = L.marker(center, { icon: ambulanceIcon }).addTo(map);
        markerRef.current.bindPopup('<b>🚑 Ambulance</b><br/>Live Location').openPopup();

        // Add hospital marker (approximate - center of map area)
        const hospitalCenter = [19.0760, 72.8777];
        hospitalMarkerRef.current = L.marker(hospitalCenter, { icon: hospitalIcon }).addTo(map);
        hospitalMarkerRef.current.bindPopup('<b>🏥 Hospital</b><br/>Dialysis Center');

        // Initialize polyline for route trail
        polylineRef.current = L.polyline([], {
            color: '#06b6d4',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 8',
            lineCap: 'round'
        }).addTo(map);

        mapRef.current = map;

        // If already have location, center on it
        if (driverLocation) {
            updateMapMarker(driverLocation);
        }
    };

    const updateMapMarker = (loc) => {
        if (markerRef.current && mapRef.current) {
            markerRef.current.setLatLng([loc.lat, loc.lng]);
            mapRef.current.panTo([loc.lat, loc.lng], { animate: true, duration: 1 });
        }
    };

    const updatePolyline = (history) => {
        if (polylineRef.current && history.length > 1) {
            const latlngs = history.map(p => [p.lat, p.lng]);
            polylineRef.current.setLatLngs(latlngs);
        }
    };

    const getRideStatusColor = (status) => {
        const statusMap = {
            assigned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            en_route: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            arrived: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };
        return statusMap[status] || '';
    };

    const getRideStatusMessage = (status) => {
        const messages = {
            assigned: '🔔 Driver has been assigned and will start shortly',
            en_route: '🚑 Ambulance is on its way to pickup location',
            arrived: '✅ Ambulance has arrived at the pickup location',
            completed: '🏁 Ride has been completed',
            cancelled: '❌ Ride was cancelled',
        };
        return messages[status] || '';
    };

    const getTimeAgo = (date) => {
        if (!date) return '';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 10) return 'Just now';
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    // Auto-refresh time ago display
    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 5000);
        return () => clearInterval(timer);
    }, []);

    if (loading) return <LoadingSpinner message="Loading ride details..." />;

    if (!ride) {
        return (
            <div className="card text-center py-12">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No Active Ride</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">There is no active ambulance ride to track.</p>
                <Link to="/dashboard" className="btn-primary mt-4 inline-block">Go to Dashboard</Link>
            </div>
        );
    }

    const isActive = ['assigned', 'en_route', 'arrived'].includes(ride.status);

    return (
        <div className="space-y-4">
            {/* Back button + header */}
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Ambulance</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ride #{ride.id} — {ride.ambulance_number}</p>
                </div>
            </div>

            {/* Connection + status bar */}
            <div className="flex flex-wrap items-center justify-between card py-3 gap-3">
                <div className="flex items-center gap-4">
                    {/* Tracking mode indicator */}
                    <div className={`flex items-center gap-1.5 text-sm ${
                        trackingMode === 'websocket' ? 'text-green-600 dark:text-green-400' :
                        trackingMode === 'polling' ? 'text-blue-600 dark:text-blue-400' :
                        'text-yellow-500 dark:text-yellow-400'
                    }`}>
                        {trackingMode === 'websocket' ? (
                            <><Radio className="w-4 h-4 animate-pulse" /> Live</>
                        ) : trackingMode === 'polling' ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} /> Polling</>
                        ) : (
                            <><Radio className="w-4 h-4" /> Connecting...</>
                        )}
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRideStatusColor(ride.status)}`}>
                        {ride.status?.replace('_', ' ').toUpperCase()}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {lastUpdated && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Updated: {getTimeAgo(lastUpdated)}
                        </div>
                    )}
                    {driverLocation && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {driverLocation.lat.toFixed(5)}, {driverLocation.lng.toFixed(5)}
                        </div>
                    )}
                </div>
            </div>

            {/* Status message banner */}
            {isActive && (
                <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
                    ride.status === 'en_route' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                    ride.status === 'arrived' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800' :
                    'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                }`}>
                    {getRideStatusMessage(ride.status)}
                </div>
            )}

            {/* Map */}
            <div className="card p-0 overflow-hidden rounded-xl" style={{ height: '500px' }}>
                <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
                <style>{`
                    @keyframes pulse-ring {
                        0% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.5); }
                        70% { box-shadow: 0 0 0 14px rgba(6, 182, 212, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
                    }
                    .leaflet-popup-content-wrapper {
                        border-radius: 12px !important;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.15) !important;
                    }
                    .leaflet-popup-content {
                        margin: 10px 14px !important;
                        font-size: 13px !important;
                    }
                `}</style>
            </div>

            {/* Ride info cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Ambulance</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{ride.ambulance_number}</div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Pickup Location</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{ride.pickup_address || 'N/A'}</div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Dispatched At</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{new Date(ride.created_at).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ride Progress Stepper */}
            {isActive && (
                <div className="card">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Ride Progress</h3>
                    <div className="flex items-center justify-between">
                        {['assigned', 'en_route', 'arrived', 'completed'].map((step, i, arr) => {
                            const stepIdx = arr.indexOf(ride.status);
                            const isCompleted = i < stepIdx;
                            const isCurrent = i === stepIdx;
                            const labels = {
                                assigned: 'Assigned',
                                en_route: 'En Route',
                                arrived: 'Arrived',
                                completed: 'Completed'
                            };
                            return (
                                <React.Fragment key={step}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                            isCurrent ? 'bg-cyan-500 text-white ring-4 ring-cyan-200 dark:ring-cyan-800 scale-110' :
                                            isCompleted ? 'bg-green-500 text-white' :
                                            'bg-gray-200 dark:bg-slate-700 text-gray-500'
                                        }`}>
                                            {isCompleted ? '✓' : i + 1}
                                        </div>
                                        <span className={`text-xs mt-1.5 ${isCurrent ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {labels[step]}
                                        </span>
                                    </div>
                                    {i < arr.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${
                                            i < stepIdx ? 'bg-green-500' :
                                            i === stepIdx ? 'bg-gradient-to-r from-cyan-500 to-gray-200 dark:to-slate-700' :
                                            'bg-gray-200 dark:bg-slate-700'
                                        }`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Tracking mode info */}
            <div className="card bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
                <div className="flex items-start gap-3">
                    <Navigation className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tracking Info</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {trackingMode === 'websocket'
                                ? 'Connected via WebSocket — receiving real-time location updates instantly.'
                                : trackingMode === 'polling'
                                ? 'Using HTTP polling — location updates every 3 seconds. For real-time tracking, run the backend with Daphne (ASGI server).'
                                : 'Attempting to connect to the live tracking server...'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackAmbulance;
