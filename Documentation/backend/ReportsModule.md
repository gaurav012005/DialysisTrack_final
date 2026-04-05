# Backend: Reports Module (`reports/`)

## 📁 Folder Structure

```
reports/
├── __init__.py
├── views.py               # Dashboard stats, patient/queue/machine/staff reports, export
├── simple_exports.py      # Simplified CSV export functions
├── serializers.py         # Report data serialization
├── urls.py                # URL routing
└── (no models)            # This module aggregates data from other modules
```

---

## 🔧 How It Works

The Reports module **does not have its own models**. Instead, it aggregates data from `patients`, `dialysis_queue`, `machines`, `appointments`, `staff`, and `billing` modules to generate reports and exports.

### 1. Report Views (`views.py`)

#### a) Reports List (`GET /api/reports/`)
Returns all available report endpoints. Publicly accessible.

#### b) Dashboard Stats (`GET /api/reports/dashboard-stats/`)
Aggregates real-time hospital statistics:

```json
{
    "patients": {
        "total": 150,
        "emergency": 3,
        "active_today": 12
    },
    "queue": {
        "total_waiting": 5,
        "total_in_progress": 3,
        "total_completed": 8
    },
    "machines": {
        "total_machines": 10,
        "available_machines": 6,
        "in_use_machines": 3
    },
    "appointments": {
        "total_appointments": 15,
        "completed_appointments": 8
    }
}
```

#### c) Patient Reports (`GET /api/reports/patients/`)
- Query params: `type` (`all`, `emergency`, `active`), `start_date`, `end_date`
- Returns patient count and serialized patient data

#### d) Queue Reports (`GET /api/reports/queue/`)
- Query params: `type` (`daily`, `weekly`, `monthly`), `date`
- Returns aggregate statistics:
  - Total patients
  - Average wait time
  - Completed sessions
  - Emergency cases

#### e) Machine Utilization (`GET /api/reports/machines/`)
- Query params: `type` (`overview`, `maintenance`)
- **Overview:** Per-machine utilization data (sessions, hours, utilization rate, maintenance needed)
- **Maintenance:** Recent maintenance logs (last 50)

#### f) Staff Performance (`GET /api/reports/staff/`)
- Query params: `type` (`attendance`), `month`, `year`
- Returns per-staff attendance data:
  - Total days, present, absent, late
  - Attendance rate percentage

---

### 2. Export Functionality (`views.py` + `simple_exports.py`)

#### Export Endpoint (`GET /api/reports/export/`)

Supports three report types and three formats:

| Report Type | CSV | Excel | PDF |
|-------------|-----|-------|-----|
| `patients` | ✅ | ✅ | ✅ |
| `queue` | ✅ | — | ✅ |
| `machines` | ✅ | — | ✅ |

**Usage:** `/api/reports/export/?type=patients&format=pdf`

**CSV Export:** Uses Python's built-in `csv` module for lightweight exports.

**Excel Export:** Uses `openpyxl` library with styled headers (bold, centered).

**PDF Export:** Uses `reportlab` library with:
- Custom title styling
- Generated-on timestamp
- Styled tables with grey headers, beige data rows
- Grid borders

**PDF Example (Patients Report):**
```python
# Table headers: Patient ID, Name, Gender, Phone, Emergency, Status
# Title: "Patients Report"
# Date: Generated timestamp
# Styling: Grey header background, beige rows, centered text
```

**PDF Example (Queue Report):**
```python
# Table headers: Patient, Machine, Status, Priority, Check-in Time
# Limited to 50 records for performance
```

**PDF Example (Machines Report):**
```python
# Table headers: Machine ID, Name, Status, Sessions, Hours, Maintenance
# Shows all active machines
```

---

### 3. URL Routing (`urls.py`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reports/` | GET | List available reports |
| `/api/reports/dashboard-stats/` | GET | Real-time dashboard statistics |
| `/api/reports/patients/` | GET | Patient reports |
| `/api/reports/queue/` | GET | Queue performance reports |
| `/api/reports/machines/` | GET | Machine utilization reports |
| `/api/reports/staff/` | GET | Staff performance reports |
| `/api/reports/export/` | GET | Export reports (CSV/Excel/PDF) |
| `/api/reports/test-export/` | GET | Test export endpoint |

---

### 4. Dependencies

| Library | Purpose | Optional? |
|---------|---------|-----------|
| `reportlab` | PDF generation | Yes (falls back gracefully) |
| `openpyxl` | Excel generation | Yes (falls back gracefully) |
| Python `csv` | CSV generation | No (built-in) |

The module checks for library availability at import time:
```python
try:
    from reportlab.lib import colors
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
```

---

### 5. Key Features

- **Real-time dashboard statistics** aggregated from all modules
- **Multi-format export** (CSV, Excel, PDF)
- **Date-range filtering** for all report types
- **Staff attendance reporting** with attendance rate calculation
- **Machine utilization analysis** per machine
- **Graceful degradation** when PDF/Excel libraries aren't installed
- **No authentication** required for reports list (AllowAny)
- **Authentication required** for all actual reports
