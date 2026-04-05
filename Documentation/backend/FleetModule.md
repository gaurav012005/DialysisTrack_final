# Backend: Fleet Module (`fleet/`)

## 📁 Folder Structure

```
fleet/
├── __init__.py
├── models.py          # Ambulance and AmbulanceRide models
├── views.py           # Ambulance CRUD, dispatch, ride tracking, driver CRUD
├── serializers.py     # Fleet data serialization
├── consumers.py       # WebSocket consumer for real-time GPS tracking
├── routing.py         # WebSocket URL routing
├── urls.py            # REST API URL routing
├── apps.py            # Django app configuration
├── admin.py           # Django admin registration
└── migrations/        # Database migrations
```

---

## 🔧 How It Works

### 1. Data Models (`models.py`)

#### a) Ambulance Model

| Field | Type | Description |
|-------|------|-------------|
| `vehicle_number` | CharField (unique) | Vehicle registration number |
| `driver` | ForeignKey → User | Assigned driver (`role='driver'`) |
| `status` | CharField (choices) | `available`, `on_trip`, `maintenance` |

#### b) AmbulanceRide Model

| Field | Type | Description |
|-------|------|-------------|
| `ambulance` | ForeignKey → Ambulance | Ambulance used |
| `patient` | ForeignKey → Patient | Patient being transported |
| `pickup_address` | TextField | Patient pickup address |
| `status` | CharField (choices) | `assigned`, `en_route`, `arrived`, `completed`, `cancelled` |
| `dispatched_by` | ForeignKey → User | Staff who dispatched |
| `driver_lat` / `driver_lng` | DecimalField | Real-time driver GPS coordinates |

---

### 2. REST API Views (`views.py`)

#### a) Ambulance CRUD

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| List/Create | GET/POST | `/api/fleet/ambulances/` | List all or add new ambulance |
| Detail/Update/Delete | GET/PUT/PATCH/DELETE | `/api/fleet/ambulances/{id}/` | Ambulance operations |

#### b) Dispatch

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Dispatch | POST | `/api/fleet/dispatch/` | Dispatch ambulance to patient |

**Dispatch Logic:**
```python
def dispatch_ambulance(request):
    ambulance = get_object_or_404(Ambulance, id=ambulance_id)
    if ambulance.status != 'available':
        return Response({'detail': 'Ambulance is not available'}, status=400)
    
    ride = AmbulanceRide.objects.create(
        ambulance=ambulance,
        patient_id=patient_id,
        pickup_address=pickup_address,
        dispatched_by=request.user,
        status='assigned'
    )
    ambulance.status = 'on_trip'
    ambulance.save()
```

#### c) Ride Management

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| List rides | GET | `/api/fleet/rides/` | All rides |
| Ride detail | GET | `/api/fleet/rides/{id}/` | Single ride detail |
| Update status | PATCH | `/api/fleet/rides/{id}/status/` | Update ride status |
| My rides | GET | `/api/fleet/rides/my/` | Driver's active rides |
| Patient ride | GET | `/api/fleet/rides/patient-active/` | Patient's active ride |

**Ride Status Transitions:**
```
assigned → en_route → arrived → completed
    ↓         ↓         ↓
  cancelled cancelled cancelled
```

**Status transition validation:**
```python
valid_transitions = {
    'assigned': ['en_route', 'cancelled'],
    'en_route': ['arrived', 'cancelled'],
    'arrived': ['completed', 'cancelled'],
}
# On completed/cancelled: ambulance.status = 'available'
```

#### d) Driver CRUD

| Action | Method | Endpoint | Who | Description |
|--------|--------|----------|-----|-------------|
| List drivers | GET | `/api/fleet/drivers/` | All staff | List active drivers |
| Create driver | POST | `/api/fleet/drivers/create/` | Admin, Receptionist | Create driver account |
| Update driver | PUT | `/api/fleet/drivers/{id}/update/` | Admin, Receptionist | Update driver info |
| Delete driver | DELETE | `/api/fleet/drivers/{id}/delete/` | Admin only | Deactivate driver |

**Driver creation:** Creates a `User` with `role='driver'` using email, password, name, phone, address.

---

### 3. WebSocket Consumer (`consumers.py`)

**`LocationConsumer`** — Real-time GPS tracking via WebSocket.

**How it works:**
1. **Connection:** Authenticates user, joins ride-specific WebSocket group (`ride_{ride_id}`)
2. **Receive:** Driver sends lat/lng coordinates → validates → saves to DB → broadcasts to group
3. **Broadcast:** All connected clients (patient, receptionist) receive live location updates

**WebSocket URL:** `ws://<host>/ws/ride/{ride_id}/`

**Message Format (Driver sends):**
```json
{
    "lat": 18.5204,
    "lng": 73.8567,
    "status": "en_route"
}
```

**Message Format (All receive):**
```json
{
    "lat": 18.5204,
    "lng": 73.8567,
    "status": "en_route"
}
```

**Coordinate Validation:**
- Must be valid float numbers
- Latitude: -90 to 90
- Longitude: -180 to 180
- Invalid coordinates return error message

**Database Persistence:**
```python
@database_sync_to_async
def save_location(self, lat, lng):
    ride = AmbulanceRide.objects.get(id=self.ride_id)
    ride.driver_lat = lat
    ride.driver_lng = lng
    ride.save(update_fields=['driver_lat', 'driver_lng', 'updated_at'])
```

---

### 4. URL Routing

**REST API (`urls.py`):**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/fleet/ambulances/` | GET/POST | Ambulance list/create |
| `/api/fleet/ambulances/{id}/` | GET/PUT/PATCH/DELETE | Ambulance detail |
| `/api/fleet/dispatch/` | POST | Dispatch ambulance |
| `/api/fleet/rides/` | GET | All rides |
| `/api/fleet/rides/my/` | GET | Driver's rides |
| `/api/fleet/rides/patient-active/` | GET | Patient's active ride |
| `/api/fleet/rides/{id}/` | GET | Ride detail |
| `/api/fleet/rides/{id}/status/` | PATCH | Update ride status |
| `/api/fleet/drivers/` | GET | List drivers |
| `/api/fleet/drivers/create/` | POST | Create driver |
| `/api/fleet/drivers/{id}/update/` | PUT | Update driver |
| `/api/fleet/drivers/{id}/delete/` | DELETE | Deactivate driver |

**WebSocket (`routing.py`):**
```python
ws_urlpatterns = [
    re_path(r'ws/ride/(?P<ride_id>\d+)/$', LocationConsumer.as_asgi()),
]
```

---

### 5. Key Features

- **Ambulance fleet management** (add, edit, delete, status tracking)
- **Patient dispatch** with automatic ambulance status update
- **Real-time GPS tracking** via WebSocket (Django Channels)
- **Ride lifecycle management** with validated status transitions
- **Driver management** (create/update/deactivate driver accounts)
- **Role-based access** (Admin/Receptionist for management, Driver for rides)
- **Coordinate validation** for GPS data
- **ASGI support** via Daphne for WebSocket handling
