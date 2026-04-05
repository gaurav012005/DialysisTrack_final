# Backend: Patients Module (`patients/`)

## 📁 Folder Structure

```
patients/
├── __init__.py
├── models.py              # Patient data model
├── views.py               # Patient CRUD & emergency management
├── dashboard_views.py     # Patient portal dashboard (PDF generation)
├── serializers.py         # Patient data serialization
├── urls.py                # URL routing
├── admin.py               # Django admin registration
└── migrations/            # Database migrations
```

---

## 🔧 How It Works

### 1. Patient Model (`models.py`)

Stores comprehensive patient information including medical records and dialysis-specific data.

**Model: `Patient`**

| Field | Type | Description |
|-------|------|-------------|
| `patient_id` | CharField (unique) | Hospital-assigned patient ID (e.g., `PT001`) |
| `user` | OneToOneField → User | Links patient to a login account (optional) |
| `first_name` / `last_name` | CharField | Patient's full name |
| `date_of_birth` | DateField | Date of birth |
| `gender` | CharField (choices) | `male`, `female`, `other` |
| `blood_type` | CharField (choices) | `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-` |
| `phone_number` / `email` | CharField / EmailField | Contact information |
| `address` | TextField | Full address |
| `emergency_contact_name` / `emergency_contact_phone` | CharField | Emergency contact details |
| `primary_diagnosis` | TextField | Primary medical diagnosis |
| `comorbidities` | TextField | Additional medical conditions |
| `allergies` | TextField | Known allergies |
| `current_medications` | TextField | Current medications |
| `dialysis_type` | CharField | Type of dialysis treatment |
| `vascular_access` | CharField | Type of vascular access (fistula, graft, catheter) |
| `dry_weight` | DecimalField | Target dry weight in kg |
| `target_weight_loss` | DecimalField | Target weight loss per session |
| `is_emergency` | BooleanField | Flag for emergency patients |
| `is_active` | BooleanField | Whether patient record is active |

---

### 2. Patient Views (`views.py`)

**`PatientViewSet`** — Full CRUD with role-based filtering.

**How data access works by role:**
- **Patient role** → can only see their **own** record (`queryset.filter(user=user)`)
- **Admin / Doctor / Nurse / Receptionist** → can see **all** patients
- **Technician** → can see all patients (basic info only)

**Key Actions:**

| Action | Method | Endpoint | Who Can Use |
|--------|--------|----------|-------------|
| List patients | GET | `/api/patients/` | All staff |
| Create patient | POST | `/api/patients/` | Admin, Doctor, Receptionist |
| Get patient | GET | `/api/patients/{id}/` | All staff, own record for patients |
| Update patient | PUT/PATCH | `/api/patients/{id}/` | Admin, Doctor, Nurse, Receptionist |
| Delete patient | DELETE | `/api/patients/{id}/` | Admin only |
| Toggle emergency | POST | `/api/patients/{id}/toggle_emergency/` | Admin, Doctor, Nurse |
| Emergency cases | GET | `/api/patients/emergency_cases/` | Admin, Doctor, Nurse |

**Auto User Account Creation:**
When creating a patient, if `create_user_account: true` and `user_password` are provided, the system automatically creates a login account for the patient using their email as the username.

```python
def perform_create(self, serializer):
    patient = serializer.save()
    if create_account and patient.email and user_password:
        user = User.objects.create_user(
            username=patient.email,
            email=patient.email,
            password=user_password,
            role='patient'
        )
        patient.user = user
        patient.save()
```

---

### 3. Patient Dashboard Views (`dashboard_views.py`)

**`PatientDashboardViewSet`** — Provides the patient portal with rich data and PDF downloads.

This is a **574-line** view that powers the entire patient-facing portal.

#### a) Dashboard Overview (`GET /api/patients/dashboard/overview/`)
Returns a comprehensive patient dashboard including:
- **Patient info** (name, ID, blood type, emergency status)
- **Upcoming appointments** (next 30 days, max 5)
- **Pending bills** (with balance amounts)
- **Recent sessions** (last 10 dialysis sessions with vitals)
- **Statistics** (total sessions, total paid, pending amount)

#### b) Appointments List (`GET /api/patients/dashboard/appointments/`)
- Filterable by `status`, `date_from`, `date_to`
- Sorted by most recent first

#### c) Sessions History (`GET /api/patients/dashboard/sessions/`)
- All dialysis sessions with full vitals data
- Pre/post BP, weight, oxygen saturation
- Filterable by date range

#### d) Bills (`GET /api/patients/dashboard/bills/`)
- Filterable by payment status: `paid`, `unpaid`, `partial`
- Includes full charge breakdown and payment history

#### e) Download Session Summary PDF (`GET /api/patients/dashboard/{id}/download-session-summary/`)
- Generates a professional PDF using **ReportLab**
- Contains: patient info, pre/post dialysis vitals table, dialysis parameters, complications & notes
- Uses styled tables with blue headers and beige data rows

#### f) Download Receipt PDF (`GET /api/patients/dashboard/{id}/download-receipt/`)
- Generates a payment receipt PDF
- Contains: bill info, charges breakdown (session cost, medicines, consultation, GST), payment history, summary
- Uses green-themed styling with professional layout

---

### 4. URL Routing (`urls.py`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients/` | GET/POST | List/Create patients |
| `/api/patients/{id}/` | GET/PUT/PATCH/DELETE | Patient detail operations |
| `/api/patients/{id}/toggle_emergency/` | POST | Toggle emergency status |
| `/api/patients/emergency_cases/` | GET | List emergency patients |
| `/api/patients/dashboard/overview/` | GET | Patient portal overview |
| `/api/patients/dashboard/appointments/` | GET | Patient's appointments |
| `/api/patients/dashboard/sessions/` | GET | Patient's dialysis sessions |
| `/api/patients/dashboard/bills/` | GET | Patient's bills |
| `/api/patients/dashboard/{id}/download-session-summary/` | GET | Download session PDF |
| `/api/patients/dashboard/{id}/download-receipt/` | GET | Download receipt PDF |

---

### 5. Key Features

- **Search** by first name, last name, patient ID, phone number
- **Filter** by gender, emergency status, active status, blood type
- **Ordering** by created date, first name, last name
- **Pagination** (20 records per page, configured globally)
- **PDF generation** using ReportLab library for session summaries and payment receipts
