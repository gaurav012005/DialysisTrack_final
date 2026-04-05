# Frontend: Dashboard & Patient Portal (`Dashboard.jsx`, `PatientDashboard.jsx`)

## 📁 Related Files

```
src/pages/
├── Dashboard.jsx           # Admin/Staff dashboard (10.1KB)
└── PatientDashboard.jsx    # Patient portal dashboard (28.4KB)
```

---

## 🔧 How It Works

### 1. Admin/Staff Dashboard (`Dashboard.jsx`)

The main dashboard displayed after staff login. Shows a hospital-wide operational overview.

**What It Shows:**
- **Welcome message** with user's name and role
- **Quick statistics cards:**
  - Total active patients
  - Today's queue count (waiting + in progress)
  - Available machines
  - Today's appointments
- **Today's queue** — real-time list of patients in queue with status
- **Quick action buttons** for common tasks based on role

**Data Sources:**
- `GET /api/reports/dashboard-stats/` — aggregated hospital statistics
- `GET /api/queue/current_queue/` — real-time queue data
- `GET /api/machines/stats/` — machine availability

**Role-Based Content:**
Different dashboard widgets shown based on user role:
- **Admin:** Full overview + staff management + billing stats
- **Doctor:** Patient queue + pending sessions + recent sessions
- **Nurse:** Active queue + machine status + vitals tracking
- **Receptionist:** Appointments + queue + billing
- **Technician:** Machine status + maintenance alerts

---

### 2. Patient Portal Dashboard (`PatientDashboard.jsx`)

A comprehensive **28.4KB** patient-facing portal with multiple tabs.

**What It Shows:**

#### a) Overview Tab
- Patient personal info (name, ID, blood type)
- Upcoming appointments summary
- Pending bills with balance amounts
- Total sessions and financial statistics
- Next appointment date

#### b) Appointments Tab
- Full appointment list with date, shift, status
- Color-coded status badges (scheduled=blue, completed=green, cancelled=red)
- Filterable by status and date range

#### c) Sessions Tab
- Complete dialysis session history
- Pre/post vital signs (BP, heart rate, temperature, SpO2)
- Weight changes per session
- Machine assigned, duration, complications
- **Download session summary PDF** button

#### d) Bills Tab
- All bills with detailed breakdown
- Session cost, medicine cost, consultation fee, GST, discount
- Payment history per bill
- Outstanding balance
- **Download receipt PDF** button
- Filterable by payment status (paid/unpaid/partial)

**API Calls:**
```javascript
GET /api/patients/dashboard/overview/        → Overview data
GET /api/patients/dashboard/appointments/    → Appointments list
GET /api/patients/dashboard/sessions/        → Sessions history
GET /api/patients/dashboard/bills/           → Bills and payments
GET /api/patients/dashboard/{id}/download-session-summary/  → PDF download
GET /api/patients/dashboard/{id}/download-receipt/           → PDF download
```

---

## 🔑 Key Features

- **Role-adaptive dashboard** — different content for each role
- **Real-time data** from multiple API endpoints
- **Patient portal** with full self-service capabilities
- **PDF downloads** for session summaries and payment receipts
- **Color-coded statuses** for visual clarity
- **Responsive design** for mobile and desktop
- **Tab-based navigation** in patient dashboard
