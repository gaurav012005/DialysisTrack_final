# Frontend: Reports & Exports (`Reports.jsx`)

## 📁 Related Files

```
src/pages/
└── Reports.jsx                # Reports dashboard & export page (12.1KB)
```

---

## 🔧 How It Works

### 1. Reports Page (`pages/Reports.jsx`)

A comprehensive **12.1KB** reporting dashboard with export capabilities.

**Report Sections:**

#### a) Dashboard Statistics
- Total patients, emergency cases, active today
- Queue stats: waiting, in progress, completed
- Machine stats: total, available, in use, utilization rate
- Appointment stats: total today, completed today

#### b) Report Types

| Report | Description | Export Formats |
|--------|-------------|----------------|
| Patient Reports | All patients, emergency-only, active-only | CSV, Excel, PDF |
| Queue Reports | Daily, weekly, monthly queue performance | CSV, PDF |
| Machine Reports | Overview, utilization, maintenance history | CSV, PDF |
| Staff Reports | Attendance, monthly performance | CSV |

#### c) Export Controls
- **Report type selector** (patients, queue, machines, staff)
- **Format selector** (CSV, Excel, PDF)
- **Date range picker** (start date, end date)
- **Type filter** (e.g., emergency patients, daily/weekly/monthly)
- **Download button** — triggers file download

**API Calls:**
```javascript
GET /api/reports/dashboard-stats/     → Dashboard statistics
GET /api/reports/patients/            → Patient reports
GET /api/reports/queue/               → Queue reports
GET /api/reports/machines/            → Machine reports
GET /api/reports/staff/               → Staff reports
GET /api/reports/export/?type=patients&format=pdf   → Export file
```

#### d) Report Display
- Statistics cards with large numbers
- Data tables with sortable columns
- Charts (bar/pie) for visual analytics
- Date-filtered data views

---

## 🔑 Key Features

- **Multi-format export** (CSV, Excel, PDF)
- **Date range filtering** for all reports
- **Real-time dashboard stats** from aggregated API
- **Visual charts** for data analytics
- **One-click download** for report files
- **Report type selection** with appropriate filters
