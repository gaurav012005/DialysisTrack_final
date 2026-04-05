# Backend: Staff Module (`staff/`)

## 📁 Folder Structure

```
staff/
├── __init__.py
├── models.py          # StaffSchedule, StaffAttendance, LeaveRequest models
├── views.py           # Staff management, scheduling, attendance, leave
├── serializers.py     # Staff data serialization
├── urls.py            # URL routing
├── admin.py           # Django admin registration
└── migrations/        # Database migrations
```

---

## 🔧 How It Works

### 1. Data Models (`models.py`)

#### a) StaffSchedule Model

Manages staff shift scheduling.

| Field | Type | Description |
|-------|------|-------------|
| `staff` | ForeignKey → User | Staff member |
| `shift_date` | DateField | Date of the shift |
| `shift_type` | CharField (choices) | `morning` (6AM–2PM), `evening` (2PM–10PM), `night` (10PM–6AM) |
| `start_time` / `end_time` | TimeField | Shift start/end times |
| `break_duration` | IntegerField (default 30) | Break duration in minutes |
| `assigned_zone` | CharField | Hospital zone assignment |
| `assigned_machines` | TextField | Comma-separated machine IDs |
| `is_present` | BooleanField | Whether staff checked in |
| `check_in_time` / `check_out_time` | DateTimeField | Actual check-in/out times |

**Constraints:** `unique_together = ['staff', 'shift_date']` — each staff member can only have one shift per day.

#### b) StaffAttendance Model

Tracks daily attendance with work metrics.

| Field | Type | Description |
|-------|------|-------------|
| `staff` | ForeignKey → User | Staff member |
| `date` | DateField | Attendance date |
| `status` | CharField (choices) | `present`, `absent`, `late`, `half_day`, `leave` |
| `scheduled_start` / `scheduled_end` | TimeField | Planned shift times |
| `actual_start` / `actual_end` | TimeField | Actual work times |
| `patients_handled` | IntegerField | Number of patients handled |
| `overtime_hours` | DecimalField | Overtime hours worked |

**Constraints:** `unique_together = ['staff', 'date']` — one attendance record per staff per day.

#### c) LeaveRequest Model

Leave management with approval workflow.

| Field | Type | Description |
|-------|------|-------------|
| `staff` | ForeignKey → User | Staff member requesting leave |
| `leave_type` | CharField (choices) | `sick`, `vacation`, `emergency`, `personal` |
| `start_date` / `end_date` | DateField | Leave period |
| `total_days` | IntegerField | Auto-calculated total days |
| `reason` | TextField | Reason for leave |
| `emergency_contact` | CharField | Contact during leave |
| `status` | CharField (choices) | `pending`, `approved`, `rejected`, `cancelled` |
| `approved_by` | ForeignKey → User | Who approved/rejected |
| `approved_date` | DateTimeField | When decision was made |

**Auto-calculation on save:**
```python
def save(self, *args, **kwargs):
    if self.start_date and self.end_date:
        self.total_days = (self.end_date - self.start_date).days + 1
    super().save()
```

---

### 2. Staff Views (`views.py`)

#### a) StaffScheduleViewSet

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| List schedules | GET | `/api/staff/schedules/` | Current week by default |
| Create schedule | POST | `/api/staff/schedules/` | Create new shift |
| Today's schedule | GET | `/api/staff/schedules/today_schedule/` | All shifts for today |
| Check-in | POST | `/api/staff/schedules/{id}/check_in/` | Staff check-in for shift |

**Check-in flow:** When a staff member checks in, the system:
1. Sets `is_present = True` on the schedule
2. Records `check_in_time`
3. Automatically creates a `StaffAttendance` record with `status = 'present'`

#### b) StaffAttendanceViewSet

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| List attendance | GET | `/api/staff/attendance/` | All attendance records |
| Monthly report | GET | `/api/staff/attendance/monthly_report/` | Monthly attendance with year/month params |

#### c) LeaveRequestViewSet

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| List requests | GET | `/api/staff/leaves/` | All leave requests |
| Create request | POST | `/api/staff/leaves/` | Submit leave request |
| Approve | POST | `/api/staff/leaves/{id}/approve/` | Approve leave (requires permission) |
| Reject | POST | `/api/staff/leaves/{id}/reject/` | Reject leave (requires permission) |

**Leave Approval Workflow:**
```
pending → approved (by admin/manager)
       → rejected (by admin/manager)
       → cancelled (by staff member)
```

#### d) StaffViewSet (Read-Only)

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| List staff | GET | `/api/staff/` | All staff members |
| Staff detail | GET | `/api/staff/{id}/` | Individual staff info |
| Workload | GET | `/api/staff/workload/` | Staff workload statistics |

---

### 3. URL Routing (`urls.py`)

```python
router.register(r'schedules', StaffScheduleViewSet)     # /api/staff/schedules/
router.register(r'attendance', StaffAttendanceViewSet)   # /api/staff/attendance/
router.register(r'leaves', LeaveRequestViewSet)          # /api/staff/leaves/
router.register(r'', StaffViewSet)                       # /api/staff/
```

---

### 4. Key Features

- **Shift scheduling** with 3 shift types (morning/evening/night)
- **Automated attendance tracking** on check-in
- **Leave management** with approval workflow
- **Monthly attendance reports**
- **Workload monitoring** per staff member
- **Filter** by shift type, date, presence, role, department
- **Search** by first name, last name, username, email
