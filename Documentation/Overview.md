# DialysisTrack — Documentation Overview

## 📋 About

**DialysisTrack** is a full-stack hospital management system built for dialysis centers. It manages patients, appointments, dialysis sessions, machines, staff, billing, reports, ambulance fleet, and two-factor authentication — all with role-based access control.

**Tech Stack:** Django REST Framework (Backend) + React with Vite (Frontend) + MySQL (Database)

---

## 📁 Documentation Index

### 🏗️ Architecture Documentation (`Documentation/Architecture/`)

| Document | File | Description |
|----------|------|-------------|
| **System Architecture** | [SystemArchitecture.md](Architecture/SystemArchitecture.md) | Full 3-tier architecture, all communication flows (REST, WebSocket, Auth), module maps, security layers, database ER relationships, deployment architecture, PWA architecture, and feature-to-module mapping |
| **Complete Project Flow** | [CompleteProjectFlow.md](Architecture/CompleteProjectFlow.md) | End-to-end flow of the entire system — patient lifecycle, queue/session flow, billing/payment flow, ambulance/GPS flow, machine lifecycle, staff workflow, reports, PWA/offline, RBAC enforcement, and inter-module data dependencies |
| **Database Schema** | [DatabaseSchema.md](Architecture/DatabaseSchema.md) | ER schema with all tables, fields, relationships, and data types |
| **Data Flow Lifecycle** | [DataFlowLifecycle.md](Architecture/DataFlowLifecycle.md) | Real-time patient journey from ambulance dispatch to billing checkout |
| **Tech Stack Explained** | [TechStack.md](Architecture/TechStack.md) | Every library and framework used, with reasons for selection |

---

### 🖥️ Backend Documentation (`Documentation/backend/`)

| # | Module | File | Description |
|---|--------|------|-------------|
| 1 | **Config** | [ConfigModule.md](backend/ConfigModule.md) | Django settings, database, JWT, CORS, ASGI, URL routing |
| 2 | **Users** | [UsersModule.md](backend/UsersModule.md) | Custom User model, authentication views, RBAC permissions |
| 3 | **Patients** | [PatientsModule.md](backend/PatientsModule.md) | Patient CRUD, dashboard portal, PDF generation |
| 4 | **Appointments** | [AppointmentsModule.md](backend/AppointmentsModule.md) | Appointment scheduling, shift system, lifecycle management |
| 5 | **Dialysis Queue** | [DialysisQueueModule.md](backend/DialysisQueueModule.md) | Queue management, session tracking, vitals recording |
| 6 | **Machines** | [MachinesModule.md](backend/MachinesModule.md) | Machine inventory, maintenance logs, cleaning logs |
| 7 | **Staff** | [StaffModule.md](backend/StaffModule.md) | Scheduling, attendance, leave management |
| 8 | **Billing** | [BillingModule.md](backend/BillingModule.md) | Multi-method payments (Cash/UPI/Card/NEFT), UPI QR generation, insurance |
| 9 | **Reports** | [ReportsModule.md](backend/ReportsModule.md) | Dashboard stats, CSV/Excel/PDF exports |
| 10 | **Fleet** | [FleetModule.md](backend/FleetModule.md) | Ambulance dispatch, WebSocket GPS tracking, driver management |
| 11 | **Two-Factor** | [TwoFactorModule.md](backend/TwoFactorModule.md) | Mandatory 2FA setup, TOTP verification, backup codes, grace periods |
| 12 | **Testing** | [TestingModule.md](backend/TestingModule.md) | 38 test scripts, setup scripts, data fixtures |

---

### 🌐 Frontend Documentation (`Documentation/frontend/`)

| # | Module | File | Description |
|---|--------|------|-------------|
| 1 | **Authentication** | [AuthenticationModule.md](frontend/AuthenticationModule.md) | Login, AuthContext, RoleGuard, 2FA setup/verify |
| 2 | **Dashboards** | [DashboardModule.md](frontend/DashboardModule.md) | Admin dashboard, patient portal (28.4KB) |
| 3 | **Patients** | [PatientsModule.md](frontend/PatientsModule.md) | Patient list, registration form (13.1KB), calendar appointments |
| 4 | **Queue & Sessions** | [QueueAndSessionsModule.md](frontend/QueueAndSessionsModule.md) | Queue management, session forms, session completion |
| 5 | **Machines** | [MachinesModule.md](frontend/MachinesModule.md) | Machine status cards, maintenance tracking |
| 6 | **Billing** | [BillingModule.md](frontend/BillingModule.md) | Billing page, payment forms (Cash/UPI QR/Card), dashboard |
| 7 | **Staff** | [StaffModule.md](frontend/StaffModule.md) | Staff list, add/edit modal (13.3KB) |
| 8 | **Reports** | [ReportsModule.md](frontend/ReportsModule.md) | Report dashboard, multi-format exports (CSV/Excel/PDF) |
| 9 | **Fleet** | [FleetModule.md](frontend/FleetModule.md) | Ambulance management (24KB), driver dashboard, live GPS tracking |
| 10 | **UI Components** | [UIComponentsAndUtilities.md](frontend/UIComponentsAndUtilities.md) | Layout, navbar, sidebar, table, charts, PWA, chatbot, theme |

---

### 📄 Root-Level Documentation

| Document | Location | Description |
|----------|----------|-------------|
| **Complete Project Documentation** | [DialysisTrack.md](DialysisTrack.md) | All 22 modules summarized in one file |
| **Features Working Guide** | [FeaturesWorking.md](../FeaturesWorking.md) | Step-by-step guide for every feature for every role |
| **PWA Setup Guide** | [PWA_SETUP.md](../PWA_SETUP.md) | Progressive Web App installation, offline, service worker |
| **2FA Documentation** | [2FA_DOCUMENTATION.md](../2FA_DOCUMENTATION.md) | Quick reference for 2FA implementation |
| **QR Payment Setup** | [QR_PAYMENT_SETUP.md](../QR_PAYMENT_SETUP.md) | UPI QR code payment configuration |
| **Project Summary** | [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md) | High-level project overview |
| **Passwords Reference** | [PASSWORDS.md](../PASSWORDS.md) | Login credentials for all demo accounts |
| **First Time Run** | [firsttimerun.md](../firsttimerun.md) | Setup guide for first-time project setup |
| **README** | [README.md](../README.md) | Project introduction and quick start |

---

## 🔑 User Roles (7 Roles)

| Role | Description | Access Level | 2FA |
|------|-------------|--------------|-----|
| **Admin** | Hospital administrator | Full access to everything | ✅ Mandatory |
| **Doctor** | Attending physician | Patients, queue, sessions, reports | ✅ Mandatory |
| **Nurse** | Clinical nurse | Queue (full), patients, sessions, machines (view) | ✅ Mandatory |
| **Technician** | Machine technician | Machines (full), queue (view), maintenance | ✅ Mandatory |
| **Receptionist** | Front desk | Patients, appointments, billing, fleet | ✅ Mandatory |
| **Patient** | Hospital patient | Own data only (portal view) | ❌ Optional |
| **Driver** | Ambulance driver | Own rides only | ❌ Optional |

---

## 🧩 All Features (25 Total)

| # | Feature | Module |
|---|---------|--------|
| 1 | Patient Management (CRUD) | Patients |
| 2 | Appointment Scheduling (3 shifts) | Appointments |
| 3 | Queue Management (priority-based) | Dialysis Queue |
| 4 | Dialysis Session Recording (vitals) | Dialysis Queue |
| 5 | Machine Tracking (5 statuses) | Machines |
| 6 | Maintenance & Cleaning Logs | Machines |
| 7 | Billing + GST (auto-calculate) | Billing |
| 8 | Payment (Cash, UPI QR, Card, NEFT) | Billing |
| 9 | Staff Management | Staff |
| 10 | Staff Scheduling (3 shifts) | Staff |
| 11 | Attendance Tracking | Staff |
| 12 | Leave Request System | Staff |
| 13 | Reports (CSV, Excel, PDF export) | Reports |
| 14 | JWT Authentication | Users |
| 15 | Two-Factor Authentication (TOTP) | Two-Factor |
| 16 | Role-Based Access (7 roles) | Users |
| 17 | Ambulance Dispatch | Fleet |
| 18 | Live GPS Tracking (WebSocket) | Fleet |
| 19 | UPI QR Code Payment | Billing |
| 20 | PWA (Install + Offline) | Frontend |
| 21 | Dark/Light Theme | Frontend |
| 22 | Patient Portal | Patients |
| 23 | ChatBot | Frontend |
| 24 | Audit Logging | Notifications |
| 25 | PDF Download (reports, receipts) | Reports / Patients |

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
