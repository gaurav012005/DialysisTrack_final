# Frontend: Queue & Sessions (`Queue.jsx`, `Sessions.jsx`, `SessionForm.jsx`, `SessionDetails.jsx`)

## 📁 Related Files

```
src/
├── pages/
│   ├── Queue.jsx                     # Queue management page (9.8KB)
│   └── Sessions.jsx                  # Sessions list page (7.3KB)
├── components/
│   ├── QueueCard.jsx                 # Queue entry card component (3.9KB)
│   ├── AddPatientToQueueModal.jsx    # Add patient to queue modal (4.4KB)
│   ├── SessionForm.jsx              # New session form (11.1KB)
│   ├── SessionDetails.jsx           # Session detail view (9.6KB)
│   └── SessionCompletionForm.jsx    # Session completion form (7KB)
└── api/
    ├── queue.js                      # Queue API functions (394B)
    └── sessions.js                   # Sessions API functions (537B)
```

---

## 🔧 How It Works

### 1. Queue Management Page (`pages/Queue.jsx`)

Real-time view of the dialysis queue with priority-based ordering.

**What It Shows:**
- **Dashboard stats bar:** Waiting count, In Progress count, Completed count, Emergency count
- **Queue cards** sorted by priority (emergency first) then check-in time
- **Color-coded status:** 🟡 Waiting (yellow), 🟢 In Progress (green), ✅ Completed (grey), ❌ Cancelled (red)
- **Action buttons** per queue entry based on status

**Queue Actions:**
| Action | Visible When | API Call |
|--------|-------------|----------|
| Start Treatment | status = waiting | `POST /api/queue/{id}/start_treatment/` |
| Complete | status = in_progress | `POST /api/queue/{id}/complete_treatment/` |
| Assign Machine | status = waiting | `POST /api/queue/{id}/assign_machine/` |
| Add Emergency | Always (medical staff) | `POST /api/queue/add_emergency/` |

**Auto-refresh:** Queue data refreshes automatically to show real-time changes.

### 2. Queue Card (`components/QueueCard.jsx`)

Individual patient card in the queue displaying:
- Queue number (e.g., `Q0042`)
- Patient name and ID
- Priority badge (Emergency=red, Scheduled=blue, Walk-in=grey)
- Status badge with emoji
- Assigned machine (if any)
- Wait time / session time
- Action buttons

### 3. Add Patient to Queue Modal (`components/AddPatientToQueueModal.jsx`)

Modal form for adding patients to the queue:
- Patient selector (dropdown with search)
- Priority selection (scheduled, walk-in, emergency)
- Linked appointment (optional)
- Submit creates queue entry with auto-generated queue number

### 4. Sessions Page (`pages/Sessions.jsx`)

Lists all dialysis sessions with filtering options.

**What It Shows:**
- Session list with patient name, date, duration, status
- Pre/post vital signs summary
- Machine used, attending staff
- **Start New Session** button → opens SessionForm
- **View Details** → opens SessionDetails component

### 5. Session Form (`components/SessionForm.jsx`)

A comprehensive **11.1KB** form for creating a new dialysis session.

**Form Fields:**

| Section | Fields |
|---------|--------|
| Queue Link | Select queue entry (patient auto-selected) |
| Pre-Dialysis Vitals | BP (systolic/diastolic), heart rate, temperature, SpO2 |
| Dialysis Parameters | Blood flow rate, dialysate flow rate, heparin dose |
| Staff Assignment | Attending doctor, attending nurse (dropdowns) |
| Medications | Free-text medications list |
| Notes | Nurse notes |

**API Call:** `POST /api/queue/sessions/`

### 6. Session Details (`components/SessionDetails.jsx`)

A **9.6KB** detailed view of a completed session:
- Patient info with blood type
- Pre-dialysis vs Post-dialysis vitals comparison table
- Dialysis parameters (flow rates, UF volume, heparin)
- Weight change (before → after)
- Session duration
- Medications administered
- Complications and adverse events
- Doctor and nurse notes
- Attending staff names

### 7. Session Completion Form (`components/SessionCompletionForm.jsx`)

Form for completing an active session:
- Post-dialysis vitals (BP, heart rate, temperature, SpO2)
- Ultrafiltration volume
- Medications given during session
- Complications (if any)
- Adverse events (if any)
- Doctor notes, nurse notes

**API Call:** `POST /api/queue/sessions/{id}/complete_session/`

### 8. API Functions

```javascript
// queue.js
export const getQueue = () => axios.get('/api/queue/');
export const getCurrentQueue = () => axios.get('/api/queue/current_queue/');
export const addToQueue = (data) => axios.post('/api/queue/', data);

// sessions.js
export const getSessions = () => axios.get('/api/queue/sessions/');
export const createSession = (data) => axios.post('/api/queue/sessions/', data);
export const getPatientSessions = (id) => axios.get(`/api/queue/sessions/patient/${id}/`);
```

---

## 🔑 Key Features

- **Real-time queue** with auto-refresh
- **Priority-based ordering** (emergency gets top priority)
- **Color-coded status** indicators
- **Full session lifecycle** (create → track vitals → complete)
- **Pre/Post vital comparison** in session details
- **Role-based actions** (only medical staff can start/complete)
- **Machine assignment** from available machine pool
