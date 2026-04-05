# Backend: Appointments Module (`appointments/`)

## 📁 Folder Structure

```
appointments/
├── __init__.py
├── models.py          # Appointment data model
├── views.py           # Appointment CRUD & status management
├── serializers.py     # Appointment data serialization
├── urls.py            # URL routing
├── admin.py           # Django admin registration
└── migrations/        # Database migrations
```

---

## 🔧 How It Works

### 1. Appointment Model (`models.py`)

Manages scheduling of patient dialysis appointments with shift-based organization.

**Model: `Appointment`**

| Field | Type | Description |
|-------|------|-------------|
| `patient` | ForeignKey → Patient | The patient this appointment is for |
| `appointment_date` | DateField | Date of the appointment |
| `shift` | CharField (choices) | `morning` (6AM–12PM), `evening` (12PM–6PM), `night` (6PM–12AM) |
| `scheduled_time` | TimeField | Exact scheduled time |
| `actual_start_time` | TimeField (nullable) | When session actually started |
| `actual_end_time` | TimeField (nullable) | When session actually ended |
| `status` | CharField (choices) | `scheduled`, `checked_in`, `in_progress`, `completed`, `cancelled`, `no_show` |
| `notes` | TextField | Additional notes |
| `machine_number` | CharField | Assigned machine number |
| `created_by` | ForeignKey → User | User who created the appointment |

**Ordering:** By `appointment_date`, then `scheduled_time`.

---

### 2. Appointment Views (`views.py`)

**`AppointmentViewSet`** — Full ModelViewSet with custom actions for workflow management.

**Appointment Lifecycle:**
```
scheduled → checked_in → in_progress → completed
                                    ↘ cancelled
         ↘ no_show
```

**Custom Actions:**

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Check-in | POST | `/api/appointments/{id}/check_in/` | Marks patient as arrived |
| Start session | POST | `/api/appointments/{id}/start_session/` | Begins dialysis session |
| Complete session | POST | `/api/appointments/{id}/complete_session/` | Marks session as done |
| Today's list | GET | `/api/appointments/today_appointments/` | All appointments for today |
| Upcoming | GET | `/api/appointments/upcoming_appointments/` | Next 7 days (scheduled only) |
| My appointments | GET | `/api/appointments/my_appointments/` | Current patient's appointments |

**How "My Appointments" works:**
The view identifies the logged-in patient by matching either:
1. `Patient.user == request.user`
2. `Patient.email == request.user.email`

This ensures patients can view their appointments whether linked by user account or email.

---

### 3. Serializers (`serializers.py`)

Two serializers are used:

**`AppointmentSerializer`** (for reading):
```python
class AppointmentSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    # Returns full patient data nested in the response
```

**`AppointmentCreateSerializer`** (for creating/updating):
```python
class AppointmentCreateSerializer(serializers.ModelSerializer):
    # Accepts just the patient ID for creation
```

**Serializer selection logic:**
- `create`, `update`, `partial_update` → `AppointmentCreateSerializer`
- All other actions → `AppointmentSerializer` (includes full patient details)

---

### 4. URL Routing (`urls.py`)

Uses DRF `DefaultRouter` for automatic URL generation:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/appointments/` | GET/POST | List/Create appointments |
| `/api/appointments/{id}/` | GET/PUT/PATCH/DELETE | Appointment detail operations |
| `/api/appointments/{id}/check_in/` | POST | Patient check-in |
| `/api/appointments/{id}/start_session/` | POST | Start dialysis session |
| `/api/appointments/{id}/complete_session/` | POST | Complete session |
| `/api/appointments/today_appointments/` | GET | Today's appointments |
| `/api/appointments/upcoming_appointments/` | GET | Upcoming 7-day appointments |
| `/api/appointments/my_appointments/` | GET | Current patient's appointments |

---

### 5. Key Features

- **Search** by patient first name, last name, patient ID
- **Filter** by status, shift, appointment date
- **Ordering** by appointment date, scheduled time, created date
- **Shift-based scheduling** (morning/evening/night)
- **Status tracking** through full appointment lifecycle
