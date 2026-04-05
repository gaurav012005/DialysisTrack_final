# Frontend: Machines Management (`Machines.jsx`, `MachineCard.jsx`, `AddMachineModal.jsx`)

## 📁 Related Files

```
src/
├── pages/
│   └── Machines.jsx              # Machine management page (9.9KB)
└── components/
    ├── MachineCard.jsx           # Machine status card (3.3KB)
    └── AddMachineModal.jsx       # Add new machine modal (3.9KB)
```

---

## 🔧 How It Works

### 1. Machines Page (`pages/Machines.jsx`)

A machine management dashboard showing all dialysis machines and their statuses.

**What It Shows:**
- **Statistics bar:** Total machines, Available, In Use, Maintenance, Utilization Rate %
- **Machine cards** in a grid layout
- **Filter** by status (available, in_use, maintenance, cleaning, out_of_service)
- **Search** by machine ID, name, manufacturer
- **Add Machine** button for registering new equipment

**API Calls:**
```javascript
GET /api/machines/                          → List all machines
GET /api/machines/stats/                    → Machine statistics
POST /api/machines/                         → Create new machine
POST /api/machines/{id}/start_maintenance/  → Put under maintenance
POST /api/machines/{id}/complete_maintenance/ → Complete maintenance
POST /api/machines/{id}/assign_patient/     → Assign patient
POST /api/machines/{id}/release_patient/    → Release patient
```

### 2. Machine Card (`components/MachineCard.jsx`)

Individual machine status card displaying:
- **Machine ID** and name
- **Status badge** with color coding:
  - 🟢 Available (green)
  - 🔵 In Use (blue)
  - 🟠 Maintenance (orange)
  - 🟡 Cleaning (yellow)
  - 🔴 Out of Service (red)
- **Machine type** (hemodialysis, peritoneal, HDF)
- **Manufacturer** and model
- **Current patient** name (if in use)
- **Usage stats:** Total sessions, operating hours
- **Maintenance info:** Last maintenance date, next due date
- **Maintenance alert** ⚠️ if maintenance is overdue
- **Action buttons** based on status:
  - Available → Assign Patient, Start Maintenance
  - In Use → Release Patient
  - Maintenance → Complete Maintenance

### 3. Add Machine Modal (`components/AddMachineModal.jsx`)

Form for registering a new dialysis machine:

| Field | Description |
|-------|-------------|
| Machine ID | Unique machine identifier |
| Name | Display name |
| Machine Type | Hemodialysis / Peritoneal / HDF |
| Manufacturer | Equipment manufacturer |
| Model | Model name |
| Serial Number | Unique serial number |
| Purchase Date | When machine was purchased |
| Warranty Expiry | Warranty end date |
| Maintenance Interval | Days between maintenance (default 90) |
| Power Requirements | Power specs |
| Dimensions / Weight | Physical specs |

---

## 🔑 Key Features

- **Visual machine status** with color-coded cards
- **Real-time statistics** (utilization rate)
- **Lifecycle management** (available → in_use → cleaning → available)
- **Maintenance tracking** with overdue alerts
- **Patient assignment** from machine card
- **Search and filter** by status, type, name
