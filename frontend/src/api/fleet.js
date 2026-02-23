import api from './axiosConfig';

// ──── Ambulances ────
export const getAmbulances = () => api.get('/fleet/ambulances/');
export const createAmbulance = (data) => api.post('/fleet/ambulances/', data);
export const updateAmbulance = (id, data) => api.put(`/fleet/ambulances/${id}/`, data);
export const deleteAmbulance = (id) => api.delete(`/fleet/ambulances/${id}/`);

// ──── Dispatch ────
export const dispatchAmbulance = (data) => api.post('/fleet/dispatch/', data);

// ──── Rides ────
export const getRides = () => api.get('/fleet/rides/');
export const getRide = (id) => api.get(`/fleet/rides/${id}/`);
export const updateRideStatus = (id, status) => api.patch(`/fleet/rides/${id}/status/`, { status });
export const getMyRides = () => api.get('/fleet/rides/my/');
export const getPatientActiveRide = () => api.get('/fleet/rides/patient-active/');

// ──── Drivers ────
export const getDrivers = () => api.get('/fleet/drivers/');
export const createDriver = (data) => api.post('/fleet/drivers/create/', data);
export const updateDriver = (id, data) => api.put(`/fleet/drivers/${id}/update/`, data);
export const deleteDriver = (id) => api.delete(`/fleet/drivers/${id}/delete/`);
