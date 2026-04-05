# Backend: Machines Module (`machines/`)

## 📁 Folder Structure

```
machines/
├── __init__.py
├── models.py          # DialysisMachine, MaintenanceLog, CleaningLog models
├── views.py           # Machine CRUD, maintenance, cleaning, and statistics
├── serializers.py     # Machine data serialization
├── urls.py            # URL routing
├── admin.py           # Django admin registration
└── migrations/        # Database migrations
```

---

## 🔧 How It Works

### 1. Data Models (`models.py`)

#### a) DialysisMachine Model

Complete dialysis machine inventory with status tracking.

| Field | Type | Description |
|-------|------|-------------|
| `machine_id` | CharField (unique) | Machine identifier (e.g., `DM001`) |
| `name` | CharField | Display name |
| `machine_type` | CharField (choices) | `hemodialysis`, `peritoneal`, `hdf` |
| `manufacturer` | CharField | Equipment manufacturer |
| `model` | CharField | Model name/number |
| `serial_number` | CharField (unique) | Manufacturer serial number |
| `status` | CharField (choices) | `available` 🟢, `in_use` 🔵, `maintenance` 🟠, `cleaning` 🟡, `out_of_service` 🔴 |
| `current_patient` | ForeignKey → Patient | Patient currently using machine |
| `current_session_start` | DateTimeField | When current session started |
| `purchase_date` | DateField | Date of purchase |
| `warranty_expiry` | DateField | Warranty expiration date |
| `last_maintenance_date` | DateField | Last maintenance performed |
| `next_maintenance_date` | DateField | Next scheduled maintenance |
| `maintenance_interval_days` | IntegerField (default 90) | Days between maintenance |
| `total_sessions` | IntegerField | Lifetime session count |
| `total_operating_hours` | DecimalField | Lifetime operating hours |
| `water_quality_required` | BooleanField | Requires water quality check |
| `power_requirements` | CharField | Power specifications |
| `weight` / `dimensions` | Fields | Physical specifications |

**Computed Properties:**
```python
@property
def needs_maintenance(self):
    # Returns True if next_maintenance_date has passed
    return date.today() >= self.next_maintenance_date

@property
def days_since_maintenance(self):
    # Returns number of days since last maintenance
    return (date.today() - self.last_maintenance_date).days
```

#### b) MaintenanceLog Model

Records all maintenance activities performed on machines.

| Field | Type | Description |
|-------|------|-------------|
| `machine` | ForeignKey → DialysisMachine | Machine that was maintained |
| `maintenance_type` | CharField (choices) | `routine`, `repair`, `calibration`, `inspection` |
| `maintenance_date` | DateField | When maintenance was performed |
| `next_maintenance_date` | DateField | Next scheduled maintenance |
| `performed_by` | ForeignKey → User | Technician who performed maintenance |
| `description` | TextField | What was done |
| `parts_replaced` | TextField | Parts that were replaced |
| `cost` | DecimalField | Cost of maintenance |
| **Quality Tests** | | |
| `blood_leak_test` | BooleanField | Pass/fail |
| `pressure_test` | BooleanField | Pass/fail |
| `conductivity_test` | BooleanField | Pass/fail |
| `temperature_test` | BooleanField | Pass/fail |

#### c) CleaningLog Model

Tracks machine sanitization after each patient use.

| Field | Type | Description |
|-------|------|-------------|
| `machine` | ForeignKey → DialysisMachine | Machine that was cleaned |
| `cleaning_type` | CharField (choices) | `disinfection`, `sterilization`, `sanitization` |
| `cleaned_by` | ForeignKey → User | Staff who performed cleaning |
| `cleaning_agent` | CharField | Chemical/agent used |
| `concentration` | CharField | Concentration of cleaning agent |
| `contact_time` | IntegerField | Contact time in minutes |
| `bacterial_count_before` / `bacterial_count_after` | IntegerField | Bacterial culture results |
| `endotoxin_level` | DecimalField | Endotoxin test result |

---

### 2. Machine Views (`views.py`)

#### a) DialysisMachineViewSet — Machine Management

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| List machines | GET | `/api/machines/` | All machines with filters |
| Create machine | POST | `/api/machines/` | Register new machine |
| Available machines | GET | `/api/machines/available_machines/` | Only active & available machines |
| Statistics | GET | `/api/machines/stats/` | Dashboard statistics |
| Start maintenance | POST | `/api/machines/{id}/start_maintenance/` | Put machine under maintenance |
| Complete maintenance | POST | `/api/machines/{id}/complete_maintenance/` | Mark maintenance done, update dates |
| Assign patient | POST | `/api/machines/{id}/assign_patient/` | Assign patient (changes status to `in_use`) |
| Release patient | POST | `/api/machines/{id}/release_patient/` | Release patient (changes status to `cleaning`) |

**Machine Lifecycle:**
```
available → in_use (assign_patient) → cleaning (release_patient) → available
     ↓
maintenance (start_maintenance) → available (complete_maintenance)
```

**Statistics Response:**
```json
{
    "total_machines": 10,
    "available_machines": 6,
    "in_use_machines": 3,
    "maintenance_machines": 1,
    "utilization_rate": 30.0
}
```

**Patient Assignment Logic:**
```python
def assign_patient(self, request, pk=None):
    machine = self.get_object()
    if machine.status != 'available':
        return Response({'error': 'Machine is not available'}, status=400)
    machine.status = 'in_use'
    machine.current_patient = patient
    machine.total_sessions += 1
    machine.save()
```

**Patient Release Logic:**
```python
def release_patient(self, request, pk=None):
    # Calculate operating hours from session duration
    session_duration = datetime.now() - machine.current_session_start
    machine.total_operating_hours += session_duration.total_seconds() / 3600
    machine.status = 'cleaning'  # Must be cleaned before reuse
    machine.current_patient = None
    machine.save()
```

#### b) MaintenanceLogViewSet

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| List logs | GET | `/api/machines/maintenance/` | All maintenance records |
| Create log | POST | `/api/machines/maintenance/` | Record new maintenance |
| Upcoming | GET | `/api/machines/maintenance/upcoming_maintenance/` | Machines needing maintenance in 30 days |

#### c) CleaningLogViewSet

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| List logs | GET | `/api/machines/cleaning/` | All cleaning records |
| Create log | POST | `/api/machines/cleaning/` | Record new cleaning |

---

### 3. URL Routing (`urls.py`)

```python
router.register(r'', views.DialysisMachineViewSet)            # /api/machines/
router.register(r'maintenance', views.MaintenanceLogViewSet)    # /api/machines/maintenance/
router.register(r'cleaning', views.CleaningLogViewSet)          # /api/machines/cleaning/
```

---

### 4. Key Features

- **Search** by machine ID, name, manufacturer, model, serial number
- **Filter** by status, machine type, active flag
- **Ordering** by machine ID, name, status, purchase date
- **Automatic maintenance scheduling** after completing maintenance
- **Operating hours tracking** calculated from session durations
- **Lifecycle management** (available → in_use → cleaning → available)
