# Frontend: Staff Management (`Staff.jsx`, `AddStaffModal.jsx`)

## 📁 Related Files

```
src/
├── pages/
│   └── Staff.jsx                  # Staff management page (9.3KB)
└── components/
    └── AddStaffModal.jsx          # Add/Edit staff modal (13.3KB)
```

---

## 🔧 How It Works

### 1. Staff Page (`pages/Staff.jsx`)

Staff management interface for viewing and managing hospital staff.

**What It Shows:**
- **Staff list** with name, role, department, phone, email, status
- **Filter** by role (admin, doctor, nurse, technician, receptionist)
- **Filter** by department
- **Search** by name, email, username
- **Add New Staff** button
- **Edit / Deactivate** per staff member
- **Role badges** with color coding:
  - Admin → purple
  - Doctor → blue
  - Nurse → green
  - Technician → orange
  - Receptionist → teal

**API Calls:**
```javascript
GET /api/staff/                    → List all staff
GET /api/auth/users/               → User management
POST /api/auth/register/           → Create new staff account
PUT /api/auth/users/{id}/          → Update staff
PATCH /api/auth/users/{id}/        → Partial update
```

### 2. Add Staff Modal (`components/AddStaffModal.jsx`)

A comprehensive **13.3KB** form for creating or editing staff accounts.

**Form Fields:**

| Section | Fields |
|---------|--------|
| **Personal Info** | First Name, Last Name, Email, Phone, Address, Date of Birth |
| **Role & Department** | Role (dropdown), Department (dropdown/text) |
| **Account** | Username (auto-generated from email), Password (for new users) |
| **Employment** | Hire Date, Active Status |

**Available Roles:**
- Admin
- Doctor
- Nurse
- Technician
- Receptionist

**Departments:**
- Dialysis Unit
- Nephrology
- Administration
- Maintenance
- Reception

**How It Works:**
- **Create mode:** All fields visible, password required
- **Edit mode:** Password field hidden, existing data pre-filled
- On submit: Creates a new `User` with the specified role

---

## 🔑 Key Features

- **Full staff CRUD** (create, read, update, deactivate)
- **Role-based filtering** and display
- **Department management**
- **Account creation** with role assignment
- **Active/inactive status** management
- **Color-coded role badges**
- **Search** across name, email, username
