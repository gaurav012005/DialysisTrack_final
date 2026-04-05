# DialysisTrack — Documentation Overview

## 📋 About

**DialysisTrack** is a full-stack hospital management system built for dialysis centers. It manages patients, appointments, dialysis sessions, machines, staff, billing, reports, ambulance fleet, and two-factor authentication — all with role-based access control.

**Tech Stack:** Django REST Framework (Backend) + React with Vite (Frontend) + MySQL (Database)

---

## 📁 Documentation Index

### 🖥️ Backend Documentation (`Documentation/backend/`)

| Module | File | Description |
|--------|------|-------------|
| **Config** | [ConfigModule.md](backend/ConfigModule.md) | Django settings, database, JWT, CORS, ASGI, URL routing |
| **Users** | [UsersModule.md](backend/UsersModule.md) | Custom User model, authentication views, RBAC permissions |
| **Patients** | [PatientsModule.md](backend/PatientsModule.md) | Patient CRUD, dashboard portal, PDF generation |
| **Appointments** | [AppointmentsModule.md](backend/AppointmentsModule.md) | Appointment scheduling, lifecycle management |
| **Dialysis Queue** | [DialysisQueueModule.md](backend/DialysisQueueModule.md) | Queue management, session tracking, vitals recording |
| **Machines** | [MachinesModule.md](backend/MachinesModule.md) | Machine inventory, maintenance, cleaning logs |
| **Staff** | [StaffModule.md](backend/StaffModule.md) | Scheduling, attendance, leave management |
| **Billing** | [BillingModule.md](backend/BillingModule.md) | Multi-method payments, UPI QR, insurance |
| **Reports** | [ReportsModule.md](backend/ReportsModule.md) | Dashboard stats, CSV/Excel/PDF exports |
| **Fleet** | [FleetModule.md](backend/FleetModule.md) | Ambulance dispatch, WebSocket GPS tracking |
| **Two-Factor** | [TwoFactorModule.md](backend/TwoFactorModule.md) | 2FA setup, verification, backup codes, grace periods |
| **Testing** | [TestingModule.md](backend/TestingModule.md) | Test scripts, setup scripts, data fixtures |

### 🌐 Frontend Documentation (`Documentation/frontend/`)

| Module | File | Description |
|--------|------|-------------|
| **Authentication** | [AuthenticationModule.md](frontend/AuthenticationModule.md) | Login, AuthContext, RoleGuard, 2FA setup/verify |
| **Dashboards** | [DashboardModule.md](frontend/DashboardModule.md) | Admin dashboard, patient portal |
| **Patients** | [PatientsModule.md](frontend/PatientsModule.md) | Patient list, registration form, appointments |
| **Queue & Sessions** | [QueueAndSessionsModule.md](frontend/QueueAndSessionsModule.md) | Queue management, session forms, completion |
| **Machines** | [MachinesModule.md](frontend/MachinesModule.md) | Machine status cards, maintenance tracking |
| **Billing** | [BillingModule.md](frontend/BillingModule.md) | Billing page, payment forms, UPI QR |
| **Staff** | [StaffModule.md](frontend/StaffModule.md) | Staff list, add/edit modal |
| **Reports** | [ReportsModule.md](frontend/ReportsModule.md) | Report dashboard, multi-format exports |
| **Fleet** | [FleetModule.md](frontend/FleetModule.md) | Ambulance management, driver dashboard, tracking |
| **UI Components** | [UIComponentsAndUtilities.md](frontend/UIComponentsAndUtilities.md) | Layout, navbar, sidebar, table, charts, PWA, chatbot |

### 🏗️ Architecture Documentation (`Documentation/Architecture/`)

System architecture diagrams and documentation.

---

## 🔑 User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | Hospital administrator | Full access to everything |
| **Doctor** | Attending physician | Patients, queue, sessions (no delete) |
| **Nurse** | Clinical nurse | Patients (read/update), queue (full), machines (update) |
| **Technician** | Machine technician | Machines (full), queue (read/update) |
| **Receptionist** | Front desk | Patients, appointments, billing (CRUD), fleet (read) |
| **Patient** | Hospital patient | Own data only (view) |
| **Driver** | Ambulance driver | Own rides only |

---

## 🚀 Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

Backend runs at: `http://localhost:8000`  
Frontend runs at: `http://localhost:5173`
