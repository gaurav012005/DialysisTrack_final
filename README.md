# DialysisTrack 🏥

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue.svg)](./PWA_SETUP.md)
[![Progressive Web App](https://img.shields.io/badge/Progressive-Web%20App-success.svg)](./PWA_SETUP.md)
[![Django](https://img.shields.io/badge/Django-4.x-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)

> **Now available as a Progressive Web App!** Install on any device for offline access and native app experience. [Learn more →](./PWA_SETUP.md)

A comprehensive hospital management system for dialysis centers, built with Django REST Framework (backend) and React + Vite (frontend).

---

## 🚀 Features

### Core Modules
- 👥 **Patient Management** — Full CRUD, search & filter, medical history tracking
- 📅 **Appointment Scheduling** — Book, reschedule, and track dialysis sessions
- 🔄 **Queue Management** — Real-time queue with priority levels (Normal / Urgent / Emergency)
- ⚙️ **Machine Management** — Monitor dialysis equipment status & maintenance schedules
- 👨‍⚕️ **Staff Management** — Role-based access (Admin, Doctor, Nurse, Technician, Receptionist, Driver)
- 💰 **Billing & Payments** — Invoice generation, UPI/Cash payments, payment tracking
- 📊 **Reports & Analytics** — Real-time charts, CSV/Excel/PDF exports
- 🚑 **Ambulance Fleet** — Live GPS tracking, dispatch management, driver dashboard

### Security & Authentication
- 🔐 **Two-Factor Authentication (2FA)** — Mandatory TOTP-based 2FA for all staff members
- 🔑 **JWT Authentication** — Secure token-based API access
- 🛡️ **Role-Based Access Control** — 6 user roles with granular permissions

### New Features (v2.0)
- 📧 **Email/SMS Notifications** — Appointment reminders, ambulance dispatch alerts, notification bell with unread badges
- 🔑 **Forgot Password / Reset** — Token-based password recovery flow via email
- 📝 **Patient Self-Registration** — Patients can create accounts from the login page
- 📈 **Real Chart Data** — Reports pull live data from the database (weekly trends, machine utilization)
- 🛡️ **Audit Log** — Track all user actions (who did what, when, from where) for compliance
- 🔍 **Search & Filter on All Pages** — Every listing page now has search and filter controls

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Django 4.x, Django REST Framework, Django Channels (WebSocket) |
| **Database** | MySQL |
| **Auth** | JWT (SimpleJWT) + TOTP 2FA (django-otp) |
| **Real-time** | WebSocket via Daphne / Channels |
| **PWA** | Service Worker, Web Manifest |
| **Reports** | ReportLab (PDF), OpenPyXL (Excel), CSV |

---

## 📁 Project Structure

```
DialysisTrack/
├── backend/                  # Django REST API
│   ├── config/               # Project settings, URLs, ASGI/WSGI
│   ├── users/                # Custom User model, auth views
│   ├── patients/             # Patient CRUD + medical records
│   ├── appointments/         # Appointment scheduling
│   ├── dialysis_queue/       # Real-time queue management
│   ├── machines/             # Dialysis machine tracking
│   ├── staff/                # Staff profiles
│   ├── billing/              # Invoices & payments
│   ├── reports/              # Analytics, chart data, exports
│   ├── notifications/        # Notifications, audit logs, password reset
│   ├── fleet/                # Ambulance & dispatch management
│   └── two_factor/           # 2FA setup & verification
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages (Dashboard, Queue, etc.)
│   │   ├── context/          # Auth context, theme provider
│   │   ├── api/              # API service modules
│   │   └── utils/            # Helpers, error handlers
│   └── public/               # PWA assets, icons
├── README.md                 # This file
├── PASSWORDS.md              # Default credentials for testing
├── FeaturesWorking.md        # Detailed feature walkthrough
├── PROJECT_SUMMARY.md        # Architecture overview
├── firsttimerun.md           # Setup guide
└── .env                      # Environment variables
```

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0+

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/
- **Django Admin:** http://localhost:8000/admin/

### Default Admin Login
```
Email: admin@dialysis.com
Password: Admin@2026
```

> See [PASSWORDS.md](./PASSWORDS.md) for all test credentials.
> See [firsttimerun.md](./firsttimerun.md) for detailed first-time setup instructions.

---

## 👥 User Roles

| Role | Access | 2FA |
|------|--------|-----|
| **Admin** | Full system + Django Admin | ✅ Required |
| **Doctor** | Patients, Queue, Reports, Sessions | ✅ Required |
| **Nurse** | Queue, Patients, Sessions, Machines (view) | ✅ Required |
| **Technician** | Machines, Queue (view) | ✅ Required |
| **Receptionist** | Patients, Appointments, Billing | ✅ Required |
| **Patient** | Own appointments, records, billing | ❌ Optional |
| **Driver** | Driver Dashboard, GPS tracking | ❌ Optional |

---

## 🔔 Notifications System

- **In-app notifications** with bell icon in navbar
- Unread count badge with pulse animation
- Mark individual or all notifications as read
- Notification types: appointment, billing, system, alert
- Password reset emails (console backend in dev)

---

## 🛡️ Audit Log

- Tracks all significant user actions across the system
- Records: user, action type, module, description, IP address, timestamp
- Admin-only access at `/audit-logs`
- Filterable by module and action type
- Searchable by user name or description

---

## 📈 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | User login |
| POST | `/api/auth/register/` | Patient self-registration |
| POST | `/api/auth/token/refresh/` | Refresh JWT token |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/` | List user notifications |
| POST | `/api/notifications/mark-all-read/` | Mark all as read |
| GET | `/api/notifications/audit-logs/` | View audit logs (admin) |
| POST | `/api/notifications/forgot-password/` | Request password reset |
| POST | `/api/notifications/reset-password/` | Reset password with token |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/dashboard-stats/` | Dashboard statistics |
| GET | `/api/reports/chart-data/` | Real chart data (trends & utilization) |
| GET | `/api/reports/export/` | Export reports (CSV/Excel/PDF) |

---

## 📋 Documentation

| Document | Description |
|----------|-------------|
| [FeaturesWorking.md](./FeaturesWorking.md) | Detailed feature walkthrough for every role |
| [PASSWORDS.md](./PASSWORDS.md) | All test user credentials |
| [firsttimerun.md](./firsttimerun.md) | First-time setup instructions |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Architecture & system design |
| [PWA_SETUP.md](./PWA_SETUP.md) | Progressive Web App setup |
| [techstack.md](./techstack.md) | Technology stack details |
| [system-design-diagram.md](./system-design-diagram.md) | System design diagrams |
| [2FA_DOCUMENTATION.md](./2FA_DOCUMENTATION.md) | Two-factor authentication guide |

---

## 📄 License

This project is developed as a final year academic project.
