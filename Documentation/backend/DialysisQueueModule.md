# Backend: Dialysis Queue Module (`dialysis_queue/`)

## 📁 Folder Structure

```
dialysis_queue/
├── __init__.py
├── models.py          # Queue, DialysisSession, QueueSettings models
├── views.py           # Queue management, Session tracking, Dashboard stats
├── serializers.py     # Queue & Session serialization
├── urls.py            # URL routing
├── admin.py           # Django admin registration
└── migrations/        # Database migrations
```

---

## 🔧 How It Works

### 1. Data Models (`models.py`)

#### a) Queue Model

Tracks patient check-in, waiting, and treatment status in real-time.

| Field | Type | Description |
|-------|------|-------------|
| `patient` | ForeignKey → Patient | Which patient is in queue |
| `appointment` | ForeignKey → Appointment | Linked appointment (optional) |
| `queue_number` | CharField (unique) | Auto-generated queue number (e.g., `Q0042`) |
| `priority` | CharField (choices) | `emergency`, `scheduled`, `walk_in` |
| `status` | CharField (choices) | `waiting` 🟡, `in_progress` 🟢, `completed` ✅, `cancelled` ❌ |
| `check_in_time` | DateTimeField | When patient checked in |
| `estimated_wait_time` | IntegerField | Estimated wait in minutes |
| `actual_start_time` / `actual_end_time` | DateTimeField | Actual treatment times |
| `assigned_machine` | CharField | Machine number assigned |
| `assigned_staff` | ForeignKey → User | Staff member assigned |
| `blood_pressure` | CharField | Pre-session BP reading |
| `weight_before` / `weight_after` | DecimalField | Pre/post session weight |
| `notes` | TextField | Session notes |

**Ordering:** By priority (emergency first), then check-in time.

**Computed Property:**
```python
@property
def total_session_time(self):
    # Returns session duration in minutes
    if self.actual_start_time and self.actual_end_time:
        return (actual_end_time - actual_start_time).total_seconds() / 60
```

#### b) DialysisSession Model

Comprehensive dialysis session details with pre/post vital signs.

| Field | Type | Description |
|-------|------|-------------|
| `queue` | OneToOneField → Queue | Links to queue entry |
| `patient` | ForeignKey → Patient | Patient record |
| **Pre-Dialysis Vitals** | | |
| `pre_bp_systolic` / `pre_bp_diastolic` | IntegerField | Blood pressure |
| `pre_heart_rate` | IntegerField | Heart rate (bpm) |
| `pre_temperature` | DecimalField | Temperature (°F) |
| `pre_oxygen_saturation` | IntegerField | SpO2 (%) |
| **Post-Dialysis Vitals** | | |
| `post_bp_systolic` / `post_bp_diastolic` | IntegerField | Blood pressure |
| `post_heart_rate` | IntegerField | Heart rate (bpm) |
| `post_temperature` | DecimalField | Temperature (°F) |
| `post_oxygen_saturation` | IntegerField | SpO2 (%) |
| **Dialysis Parameters** | | |
| `blood_flow_rate` | IntegerField | ml/min |
| `dialysate_flow_rate` | IntegerField | ml/min |
| `ultrafiltration_volume` | DecimalField | Liters |
| `heparin_dose` | DecimalField | Units |
| `medications` | TextField | Medications given during session |
| `complications` | TextField | Complications during session |
| `adverse_events` | TextField | Adverse events if any |
| `nurse_notes` / `doctor_notes` | TextField | Staff notes |
| `attending_doctor` / `attending_nurse` | ForeignKey → User | Assigned medical staff |

#### c) QueueSettings Model

Global queue configuration (admin-only).

| Field | Default | Description |
|-------|---------|-------------|
| `max_emergency_cases` | 3 | Max simultaneous emergency cases |
| `max_wait_time_emergency` | 10 min | Emergency target wait time |
| `max_wait_time_scheduled` | 45 min | Scheduled patient target wait |
| `max_wait_time_walk_in` | 90 min | Walk-in target wait |
| `auto_assign_machines` | True | Auto-assign available machines |
| `notify_long_waits` | True | Alert on exceeded wait times |

---

### 2. Queue Views (`views.py`)

#### a) QueueViewSet — Real-time Queue Management

**Default behavior:** Automatically filters to **today's queue** unless a `date` parameter is provided.

**Role-based access:**
- **Patients** see only their own entries
- **Medical staff** see all queue entries

**Custom Actions:**

| Action | Method | Endpoint | Who | Description |
|--------|--------|----------|-----|-------------|
| Current queue | GET | `/api/queue/current_queue/` | All | Active entries (waiting + in progress) |
| Dashboard stats | GET | `/api/queue/dashboard_stats/` | All | Count of waiting, in progress, completed, emergency |
| Start treatment | POST | `/api/queue/{id}/start_treatment/` | Doctor, Nurse | Sets status to `in_progress`, records start time |
| Complete treatment | POST | `/api/queue/{id}/complete_treatment/` | Doctor, Nurse | Sets status to `completed`, records end time |
| Assign machine | POST | `/api/queue/{id}/assign_machine/` | Nurse, Technician | Assigns a machine to queue entry |
| Add emergency | POST | `/api/queue/add_emergency/` | Doctor, Nurse | Adds emergency case (priority = emergency) |

**Queue Number Generation:**
```python
def create(self, validated_data):
    queue_number = f"Q{random.randint(1, 9999):04d}"
    validated_data['queue_number'] = queue_number
```

#### b) DialysisSessionViewSet — Session Tracking

**Features:**
- Uses `select_related` for optimized database queries
- Prevents duplicate sessions per queue entry
- Patient-filtered access

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| List sessions | GET | `/api/queue/sessions/` | All sessions |
| Create session | POST | `/api/queue/sessions/` | Start new session with pre-dialysis vitals |
| Patient history | GET | `/api/queue/sessions/patient/{patient_id}/` | All sessions for a patient |
| Complete session | POST | `/api/queue/sessions/{id}/complete_session/` | Add post-dialysis vitals, update queue |
| Recent sessions | GET | `/api/queue/sessions/recent_sessions/` | Last 7 days |

**Session Completion Flow:**
```python
def complete_session(self, request, pk=None):
    session = self.get_object()
    serializer = DialysisSessionUpdateSerializer(session, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        session.queue.status = 'completed'
        session.queue.actual_end_time = timezone.now()
        session.queue.save()
```

#### c) QueueSettingsViewSet — Admin Configuration

Admin-only. Uses `get_or_create` to ensure settings always exist.

---

### 3. Serializers (`serializers.py`)

| Serializer | Purpose | Key Fields |
|------------|---------|------------|
| `QueueSerializer` | Read queue with full patient details | Nested `PatientSerializer`, computed `total_session_time`, `assigned_staff_name` |
| `QueueCreateSerializer` | Create queue entry | Only `patient` and `priority` |
| `QueueUpdateSerializer` | Update queue entry | Status, vitals, machine, staff, notes |
| `DialysisSessionSerializer` | Read session with related data | Nested patient, queue, doctor, nurse details |
| `DialysisSessionCreateSerializer` | Create session | Pre-dialysis vitals, dialysis parameters |
| `DialysisSessionUpdateSerializer` | Complete session | Post-dialysis vitals, complications, notes |

---

### 4. URL Routing (`urls.py`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/queue/` | GET/POST | List/Create queue entries |
| `/api/queue/{id}/` | GET/PATCH/DELETE | Queue entry details |
| `/api/queue/current_queue/` | GET | Active queue (waiting + in progress) |
| `/api/queue/dashboard_stats/` | GET | Queue statistics |
| `/api/queue/{id}/start_treatment/` | POST | Start treatment |
| `/api/queue/{id}/complete_treatment/` | POST | Complete treatment |
| `/api/queue/{id}/assign_machine/` | POST | Assign machine |
| `/api/queue/add_emergency/` | POST | Add emergency case |
| `/api/queue/sessions/` | GET/POST | Sessions list/create |
| `/api/queue/sessions/{id}/` | GET/PATCH/DELETE | Session details |
| `/api/queue/sessions/patient/{id}/` | GET | Patient session history |
| `/api/queue/sessions/{id}/complete_session/` | POST | Complete session |
| `/api/queue/sessions/recent_sessions/` | GET | Recent 7-day sessions |
| `/api/queue/settings/` | GET/POST | Queue settings (admin) |
