# Frontend: Patient Management (`Patients.jsx`, `PatientForm.jsx`, `PatientAppointments.jsx`)

## 📁 Related Files

```
src/
├── pages/
│   ├── Patients.jsx               # Patient list page (11.3KB)
│   └── PatientAppointments.jsx    # Patient appointment scheduling (16.2KB)
├── components/
│   ├── PatientForm.jsx            # Patient registration/edit form (13.1KB)
│   └── PatientSessionHistory.jsx  # Session history panel (4.6KB)
└── api/
    └── patients.js                # Patient API functions (376B)
```

---

## 🔧 How It Works

### 1. Patients List Page (`pages/Patients.jsx`)

A full-featured patient management table with CRUD operations.

**What It Does:**
- Displays all patients in a searchable, sortable table
- Shows: Patient ID, Name, Gender, Phone, Blood Type, Emergency Status, Actions
- **Search** by name, patient ID, or phone
- **Filter** by gender, blood type, emergency status, active status
- **Add new patient** — opens PatientForm modal
- **Edit patient** — opens PatientForm with pre-filled data
- **Delete patient** — confirmation dialog before deletion
- **Toggle emergency** — quick emergency status toggle

**API Calls:**
```javascript
GET /api/patients/                          → List patients (with search/filter)
POST /api/patients/                         → Create patient
PUT /api/patients/{id}/                     → Update patient
DELETE /api/patients/{id}/                  → Delete patient
POST /api/patients/{id}/toggle_emergency/   → Toggle emergency flag
```

### 2. Patient Form (`components/PatientForm.jsx`)

A comprehensive **13.1KB** multi-section patient registration form.

**Form Sections:**

#### Section 1: Personal Information
- Patient ID, First Name, Last Name
- Date of Birth, Gender, Blood Type
- Phone Number, Email, Address

#### Section 2: Emergency Contact
- Emergency Contact Name
- Emergency Contact Phone

#### Section 3: Medical Information
- Primary Diagnosis
- Comorbidities (multiple conditions)
- Allergies
- Current Medications

#### Section 4: Dialysis Information
- Dialysis Type (hemodialysis, peritoneal, HDF)
- Vascular Access (fistula, graft, catheter)
- Dry Weight (kg)
- Target Weight Loss (kg)

#### Section 5: Account Setup (Optional)
- Create user account checkbox
- Password field
- When checked, creates a login account for the patient

**Form Validation:**
- Required fields marked with asterisk
- Patient ID uniqueness (validated server-side)
- Email format validation
- Phone number format

### 3. Patient Appointments Page (`pages/PatientAppointments.jsx`)

A **16.2KB** appointment scheduling interface.

**What It Does:**
- Calendar-based appointment view
- Create new appointments with patient selector
- Select shift (morning/evening/night)
- Set scheduled time
- View appointment status with color coding
- Status transitions: check-in → start → complete

### 4. Patient Session History (`components/PatientSessionHistory.jsx`)

Shows a patient's dialysis session history:
- Date, duration, machine used
- Pre/post vitals (BP, weight, heart rate)
- Complications and notes
- Expandable details per session

### 5. Patient API (`api/patients.js`)

```javascript
export const getPatients = (params) => axios.get('/api/patients/', { params });
export const createPatient = (data) => axios.post('/api/patients/', data);
export const updatePatient = (id, data) => axios.put(`/api/patients/${id}/`, data);
export const deletePatient = (id) => axios.delete(`/api/patients/${id}/`);
```

---

## 🔑 Key Features

- **Complete CRUD** for patient records
- **Multi-section form** with personal, medical, and dialysis info
- **Optional account creation** for patient portal access
- **Emergency status toggle** for quick triage
- **Search & filter** by multiple criteria
- **Session history** with pre/post vitals
- **Appointment scheduling** with shift-based system
