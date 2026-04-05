# Frontend: Ambulance & Fleet Management (`AmbulanceManagement.jsx`, `DriverDashboard.jsx`, `TrackAmbulance.jsx`)

## 📁 Related Files

```
src/
├── pages/
│   ├── AmbulanceManagement.jsx    # Fleet management page (24KB)
│   ├── DriverDashboard.jsx        # Driver mobile dashboard (14.7KB)
│   └── TrackAmbulance.jsx         # Patient ambulance tracking (9.7KB)
└── api/
    └── fleet.js                   # Fleet API functions (1.3KB)
```

---

## 🔧 How It Works

### 1. Ambulance Management Page (`pages/AmbulanceManagement.jsx`)

The largest page at **24KB**, providing full fleet management for admin/receptionist.

**Tabs:**

#### Tab 1: Ambulances
- List of all ambulances with vehicle number, driver, status
- **Add Ambulance** form (vehicle number, assign driver)
- **Edit/Delete** ambulance
- **Status badges:** Available (green), On Trip (blue), Maintenance (orange)

#### Tab 2: Dispatch
- Select available ambulance
- Select patient
- Enter pickup address
- **Dispatch button** — creates ride, marks ambulance as on_trip
- Shows only available ambulances in dropdown

#### Tab 3: Active Rides
- List of in-progress rides with:
  - Ambulance number, driver name
  - Patient name, pickup address
  - Current status with color coding
  - **Track Location** button → opens TrackAmbulance
  - **Update Status** buttons (en_route → arrived → completed)

#### Tab 4: Drivers
- Driver list with name, email, phone, status
- **Add Driver** form (name, email, password, phone, address)
- **Edit/Delete** driver

**API Calls:**
```javascript
GET /api/fleet/ambulances/               → List ambulances
POST /api/fleet/ambulances/              → Add ambulance
PUT /api/fleet/ambulances/{id}/          → Update ambulance
DELETE /api/fleet/ambulances/{id}/       → Delete ambulance
POST /api/fleet/dispatch/                → Dispatch ambulance
GET /api/fleet/rides/                    → All rides
PATCH /api/fleet/rides/{id}/status/      → Update ride status
GET /api/fleet/drivers/                  → List drivers
POST /api/fleet/drivers/create/          → Create driver
PUT /api/fleet/drivers/{id}/update/      → Update driver
DELETE /api/fleet/drivers/{id}/delete/   → Delete driver
```

### 2. Driver Dashboard (`pages/DriverDashboard.jsx`)

Mobile-friendly dashboard for ambulance drivers.

**What It Shows:**
- **Active ride** details (patient name, pickup address, status)
- **Status update buttons:**
  - En Route → "I'm on the way"
  - Arrived → "I've arrived"
  - Completed → "Trip complete"
- **GPS location sharing** — sends coordinates via WebSocket
- **Navigation link** — opens Google Maps with pickup address
- **No active ride** state with idle message

**WebSocket Integration:**
```javascript
const ws = new WebSocket(`ws://${host}/ws/ride/${rideId}/`);

// Driver sends location every 5 seconds
navigator.geolocation.watchPosition((position) => {
    ws.send(JSON.stringify({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        status: currentStatus
    }));
});
```

### 3. Track Ambulance Page (`pages/TrackAmbulance.jsx`)

Real-time ambulance tracking display for patients and staff.

**What It Shows:**
- **Map** showing ambulance's live location (marker updates in real-time)
- **Ride details:** ambulance number, driver name, pickup address
- **Status updates** as driver progresses
- **ETA estimation** (if available)

**WebSocket Integration:**
```javascript
const ws = new WebSocket(`ws://${host}/ws/ride/${rideId}/`);

ws.onmessage = (event) => {
    const { lat, lng, status } = JSON.parse(event.data);
    updateMarkerPosition(lat, lng);
    updateStatus(status);
};
```

### 4. Fleet API (`api/fleet.js`)

```javascript
export const getAmbulances = () => axios.get('/api/fleet/ambulances/');
export const createAmbulance = (data) => axios.post('/api/fleet/ambulances/', data);
export const dispatchAmbulance = (data) => axios.post('/api/fleet/dispatch/', data);
export const getRides = () => axios.get('/api/fleet/rides/');
export const getMyRides = () => axios.get('/api/fleet/rides/my/');
export const getPatientRide = () => axios.get('/api/fleet/rides/patient-active/');
export const updateRideStatus = (id, status) => axios.patch(`/api/fleet/rides/${id}/status/`, { status });
export const getDrivers = () => axios.get('/api/fleet/drivers/');
export const createDriver = (data) => axios.post('/api/fleet/drivers/create/', data);
```

---

## 🔑 Key Features

- **Full fleet management** (ambulances, drivers, rides)
- **One-click dispatch** with patient and ambulance selection
- **Real-time GPS tracking** via WebSocket
- **Driver mobile dashboard** with status controls
- **Patient tracking view** with live map
- **Status transition validation** (assigned → en_route → arrived → completed)
- **Auto ambulance release** on ride completion
- **Google Maps integration** for driver navigation
