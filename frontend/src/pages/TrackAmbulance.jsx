import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRide, getPatientActiveRide } from '../api/fleet';
import { handleApiError } from '../utils/errorHandler';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Radio, MapPin, Truck, Clock, AlertTriangle } from 'lucide-react';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

const TrackAmbulance = () => {
    const { id } = useParams();
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [driverLocation, setDriverLocation] = useState(null);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapContainerRef = useRef(null);
    const leafletLoaded = useRef(false);

    useEffect(() => {
        loadRide();
        return () => {
            if (wsRef.current) wsRef.current.close();
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
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[Track] WebSocket connected');
            setConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.lat && data.lng) {
                    const loc = { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
                    setDriverLocation(loc);
                    updateMapMarker(loc);
                }
            } catch (e) {
                console.error('[Track] Parse error:', e);
            }
        };

        ws.onclose = () => {
            console.log('[Track] WebSocket disconnected');
            setConnected(false);
        };

        ws.onerror = (err) => {
            console.error('[Track] WebSocket error:', err);
        };
    };

    // Initialize map after component mounts
    useEffect(() => {
        if (!loading && mapContainerRef.current && !leafletLoaded.current) {
            initMap();
            leafletLoaded.current = true;
        }
    }, [loading]);

    const initMap = async () => {
        const L = await import('leaflet');

        // Default center (Mumbai)
        const center = [19.0760, 72.8777];

        const map = L.map(mapContainerRef.current).setView(center, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        }).addTo(map);

        // Custom ambulance icon
        const ambulanceIcon = L.divIcon({
            className: 'custom-ambulance-marker',
            html: `<div style="
        background: linear-gradient(135deg, #06b6d4, #0891b2);
        width: 36px; height: 36px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
        border: 3px solid white;
        animation: pulse-ring 1.5s infinite;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 10H6V14H10V10Z"/><path d="M18 10H14V14H18V10Z"/>
          <path d="M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
          <path d="M5 18H3V11L5 6H14L17 11V18H15"/>
          <path d="M9 18H15"/>
        </svg>
      </div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
        });

        markerRef.current = L.marker(center, { icon: ambulanceIcon }).addTo(map);
        markerRef.current.bindPopup('Ambulance Location').openPopup();
        mapRef.current = map;
    };

    const updateMapMarker = (loc) => {
        if (markerRef.current && mapRef.current) {
            markerRef.current.setLatLng([loc.lat, loc.lng]);
            mapRef.current.panTo([loc.lat, loc.lng], { animate: true, duration: 1 });
        }
    };

    const getRideStatusColor = (status) => {
        const map = {
            assigned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            en_route: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            arrived: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };
        return map[status] || '';
    };

    if (loading) return <LoadingSpinner message="Loading ride details..." />;

    if (!ride) {
        return (
            <div className="card text-center py-12">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Ride Not Found</h3>
                <Link to="/dashboard" className="btn-primary mt-4 inline-block">Go to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Back button + header */}
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Ambulance</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ride #{ride.id} — {ride.ambulance_number}</p>
                </div>
            </div>

            {/* Connection + status bar */}
            <div className="flex items-center justify-between card py-3">
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1.5 text-sm ${connected ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        <Radio className={`w-4 h-4 ${connected ? 'animate-pulse' : ''}`} />
                        {connected ? 'Live' : 'Disconnected'}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRideStatusColor(ride.status)}`}>
                        {ride.status?.replace('_', ' ').toUpperCase()}
                    </span>
                </div>
                {driverLocation && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {driverLocation.lat.toFixed(5)}, {driverLocation.lng.toFixed(5)}
                    </div>
                )}
            </div>

            {/* Map */}
            <div className="card p-0 overflow-hidden" style={{ height: '450px' }}>
                <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
                <style>{`
          @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.5); }
            70% { box-shadow: 0 0 0 12px rgba(6, 182, 212, 0); }
            100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
          }
        `}</style>
            </div>

            {/* Ride info */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-cyan-500" />
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Ambulance</div>
                            <div className="font-medium text-gray-900 dark:text-white">{ride.ambulance_number}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Pickup</div>
                            <div className="font-medium text-gray-900 dark:text-white">{ride.pickup_address || 'N/A'}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Dispatched</div>
                            <div className="font-medium text-gray-900 dark:text-white">{new Date(ride.created_at).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackAmbulance;
