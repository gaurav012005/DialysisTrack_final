# DialysisTrack — Complete Project Documentation

## 📌 What is DialysisTrack?

DialysisTrack is a hospital management web app made for dialysis centers. It helps hospitals manage patients, book appointments, run dialysis sessions, track machines, handle billing, manage staff, and dispatch ambulances. Every user gets a role (admin, doctor, nurse, etc.) and can only see what they are allowed to.

---

## 🏗️ Tech Stack & Architecture

### Backend
- **Framework:** Django + Django REST Framework (Python)
- **Database:** MySQL (with PyMySQL driver)
- **Auth:** JWT tokens using SimpleJWT (access + refresh tokens)
- **WebSocket:** Django Channels + Daphne (for live GPS tracking)
- **2FA:** django-otp + pyotp (Time-based OTP with QR code)
- **PDF:** ReportLab (generates PDF reports and receipts)
- **Excel:** openpyxl (generates Excel exports)

### Frontend
- **Framework:** React 18 with Vite (fast dev server)
- **Routing:** React Router v6
- **HTTP Client:** Axios (with JWT interceptor)
- **Styling:** Vanilla CSS with dark mode support
- **PWA:** Installable as mobile/desktop app with offline banner

### Architecture
```
┌──────────────┐     HTTP (REST API)     ┌──────────────────┐     SQL      ┌───────┐
│   React App  │ ◄─────────────────────► │  Django Backend   │ ◄──────────► │ MySQL │
│  (Vite:5173) │     WebSocket (GPS)     │  (Daphne:8000)    │              │  DB   │
└──────────────┘ ◄─────────────────────► └──────────────────┘              └───────┘
```

- Frontend talks to backend using REST API calls (JSON)
- WebSocket is used only for live ambulance GPS tracking
- All API calls need a JWT token in the header (except login/register)
- Backend uses RBAC (Role-Based Access Control) to block unauthorized access

---

## 📁 Backend Modules — Summary

---

### 1. Config Module (`config/`)
Django project settings and main URL routing.
Contains `settings.py` with database config (MySQL), JWT settings (1-day access, 7-day refresh tokens), CORS setup for frontend ports 3000/5173, and ASGI config for WebSocket support.
The `urls.py` maps all API paths like `/api/auth/`, `/api/patients/`, `/api/queue/`, etc. to their apps.
Also has production security settings (HSTS, SSL redirect, secure cookies) that activate when DEBUG is off.
Environment variables are loaded from `.env` file using `python-decouple`.
Health check endpoint at `/api/health/` and API docs at `/swagger/`.
Supports both WSGI (normal HTTP) and ASGI (WebSocket) deployment.
📄 Full details → [ConfigModule.md](backend/ConfigModule.md)

---

### 2. Users Module (`users/`)
Handles user accounts, login, registration, and role-based permissions.
Custom `User` model extends Django's AbstractUser — adds `role` (admin/doctor/nurse/technician/receptionist/patient/driver), `department`, `phone_number`, `hire_date`.
Login view checks email + password, returns JWT tokens, and handles 2FA flow (setup required / verify code / grace period).
Login is rate-limited to 5 attempts per minute to stop brute-force attacks.
`HospitalRolePermission` is the main RBAC class — checks every request against a permission matrix (which role can do what on which module).
Patients can only see their own data (IDOR protection via `has_object_permission`).
Register, profile, and logout endpoints also provided.
Token refresh at `/api/auth/token/refresh/`.
📄 Full details → [UsersModule.md](backend/UsersModule.md)

---

### 3. Patients Module (`patients/`)
Manages patient records with full CRUD and a patient portal with PDF downloads.
`Patient` model stores personal info, medical details (diagnosis, allergies, medications), and dialysis-specific data (dry weight, vascular access type).
Patients can be linked to a user account for portal login — account is auto-created if requested during patient registration.
Role-based filtering: patients see only their own record, staff sees all.
Emergency toggle and emergency cases list for quick triage.
`PatientDashboardViewSet` powers the patient portal — shows overview, appointments, session history, and bills.
PDF generation using ReportLab: download session summary or payment receipt as styled PDF with tables.
Search by name/ID/phone, filter by gender/blood type/emergency status.
📄 Full details → [PatientsModule.md](backend/PatientsModule.md)

---

### 4. Appointments Module (`appointments/`)
Handles scheduling of patient dialysis appointments with shift-based system.
`Appointment` model tracks patient, date, shift (morning/evening/night), scheduled time, actual times, status, and assigned machine.
Status lifecycle: scheduled → checked_in → in_progress → completed (or cancelled/no_show).
Custom actions: check-in patient, start session, complete session.
Today's appointments and upcoming 7-day appointments endpoints.
Patients can view their own appointments via `my_appointments` action.
Uses two serializers — one with full patient details for reading, one with just patient ID for creating.
Searchable by patient name and ID, filterable by status/shift/date.
📄 Full details → [AppointmentsModule.md](backend/AppointmentsModule.md)

---

### 5. Dialysis Queue Module (`dialysis_queue/`)
Real-time queue management and detailed dialysis session tracking.
`Queue` model tracks patient check-in with priority (emergency/scheduled/walk-in), status, assigned machine, assigned staff, and basic vitals.
`DialysisSession` model records full session details: pre/post vitals (BP, heart rate, temperature, SpO2), blood flow rate, heparin dose, UF volume, medications, complications.
Queue auto-filters to today's entries. Emergency cases get top priority in ordering.
Actions: start treatment, complete treatment, assign machine, add emergency case.
Session completion updates both session record and queue status at once.
`QueueSettings` model stores configurable limits (max wait times, auto-assign machines).
Dashboard stats endpoint returns counts of waiting, in-progress, completed, and emergency cases.
📄 Full details → [DialysisQueueModule.md](backend/DialysisQueueModule.md)

---

### 6. Machines Module (`machines/`)
Manages dialysis machine inventory, maintenance schedules, and cleaning records.
`DialysisMachine` model stores machine ID, type (hemodialysis/peritoneal/HDF), manufacturer, serial number, status, purchase date, warranty, and usage stats.
Machine lifecycle: available → in_use (assign patient) → cleaning (release patient) → available. Also: available → maintenance → available.
Tracks total sessions and total operating hours (auto-calculated from session duration).
`MaintenanceLog` records type, technician, cost, parts replaced, and quality tests (blood leak, pressure, conductivity, temperature).
`CleaningLog` tracks cleaning agent, concentration, contact time, bacterial counts.
Actions: assign patient, release patient, start/complete maintenance, view stats.
Stats endpoint returns total/available/in-use/maintenance counts and utilization rate percentage.
📄 Full details → [MachinesModule.md](backend/MachinesModule.md)

---

### 7. Staff Module (`staff/`)
Manages staff scheduling, attendance tracking, and leave requests.
`StaffSchedule` model stores shift assignments — 3 shifts: morning (6AM–2PM), evening (2PM–10PM), night (10PM–6AM). Each staff gets one shift per day.
`StaffAttendance` model tracks daily status (present/absent/late/half_day/leave), actual work times, patients handled, and overtime hours.
Staff check-in automatically creates an attendance record.
`LeaveRequest` model handles leave applications with approval workflow: pending → approved/rejected by authorized user.
Leave types: sick, vacation, emergency, personal. Total days auto-calculated from date range.
Monthly attendance report endpoint with year/month filters.
Staff workload endpoint shows per-staff statistics.
📄 Full details → [StaffModule.md](backend/StaffModule.md)

---

### 8. Billing Module (`billing/`)
Full billing system with multi-method payments and UPI QR code generation.
`Bill` model auto-calculates subtotal, 18% GST tax, and total on save. Bill numbers are auto-generated (e.g., DT20250315422).
`Payment` model supports cash, UPI, card, net banking, NEFT, RTGS, cheque — each with different processing fees.
`PaymentService` class (272 lines) handles payment processing, UPI ID validation, fee calculation, and receipt generation.
UPI QR code generated as base64 image — frontend displays it for patient to scan.
Quick payment endpoint creates bill + processes payment in one step for walk-in patients.
Bill status auto-updates: pending → partial → paid based on total payments received.
Insurance management with `InsuranceProvider` and `PatientInsurance` models.
Dashboard stats: pending amount, overdue, today's and monthly collections.
📄 Full details → [BillingModule.md](backend/BillingModule.md)

---

### 9. Reports Module (`reports/`)
Aggregates data from all other modules to generate reports and exports.
No own models — pulls data from patients, queue, machines, appointments, staff, and billing.
Dashboard stats endpoint returns real-time hospital-wide numbers (patients, queue, machines, appointments).
Patient reports filterable by type (all/emergency/active) and date range.
Queue reports with average wait time, completed sessions, emergency counts.
Machine utilization reports showing per-machine sessions, hours, and utilization rate.
Staff attendance reports with present/absent/late counts and attendance rate percentage.
Export endpoint supports 3 formats: CSV (built-in), Excel (openpyxl), PDF (ReportLab) — with graceful fallback if libraries missing.
📄 Full details → [ReportsModule.md](backend/ReportsModule.md)

---

### 10. Fleet Module (`fleet/`)
Ambulance fleet management with real-time GPS tracking via WebSocket.
`Ambulance` model stores vehicle number, assigned driver, and status (available/on_trip/maintenance).
`AmbulanceRide` model tracks each ride: ambulance, patient, pickup address, status, and live driver GPS coordinates.
Dispatch endpoint assigns an available ambulance to a patient and marks it as on_trip.
Ride status transitions are validated: assigned → en_route → arrived → completed. Ambulance auto-releases on completion.
`LocationConsumer` (WebSocket) receives driver GPS coordinates, validates them, saves to database, and broadcasts to all connected clients.
WebSocket URL: `ws://host/ws/ride/{ride_id}/` — used by both driver (send location) and patient/staff (receive location).
Driver CRUD for creating/updating driver accounts (role = driver).
📄 Full details → [FleetModule.md](backend/FleetModule.md)

---

### 11. Two-Factor Module (`two_factor/`)
Mandatory 2FA for all staff using TOTP (Time-based One-Time Password).
Setup creates a TOTP device, generates QR code as base64 image, and returns manual secret key for authenticator apps.
Verify setup confirms the device after user enters correct 6-digit code (±60 second tolerance for clock drift).
10 backup codes generated on setup — each usable once for recovery when authenticator is unavailable.
Grace period system: after 2FA verification, user gets 3 free logins without entering code again.
Login integration: staff without 2FA must set it up (mandatory, no skip). Staff with 2FA check grace period first.
Staff cannot disable 2FA — it's enforced. Only non-staff users can disable.
Backup codes are masked when viewed (shows first 2 chars only for security).
📄 Full details → [TwoFactorModule.md](backend/TwoFactorModule.md)

---

### 12. Testing Module (`testing/`)
Contains 38 test scripts, setup scripts, and utility scripts for the entire project.
Setup scripts create sample data: hospital users (admin, doctors, nurses), patients, billing records, and patient login accounts.
Test scripts cover: role permissions (11KB), billing system (11KB), patient login flow (9.5KB), auth endpoints, dialysis sessions, and exports.
Fix scripts handle common issues: admin role fixes, duplicate user cleanup, machine serializer bugs.
`ACCESS_CONTROL_MATRIX.md` documents which role can access which endpoint.
All tests can be run via `python manage.py test testing`.
Database setup script (`setup_mysql.py`) for quick environment setup.
Debug scripts for troubleshooting authentication and configuration issues.
📄 Full details → [TestingModule.md](backend/TestingModule.md)

---

## 📁 Frontend Modules — Summary

---

### 13. Authentication Module (Login, AuthContext, RoleGuard, 2FA)
Login page accepts email + password, handles normal login, 2FA required, and 2FA setup required responses.
`AuthContext` is the brain — stores JWT tokens in localStorage, attaches Bearer token to every Axios request via interceptor, handles auto-logout.
`RoleGuard` component wraps protected routes — checks user role against allowed roles, redirects unauthorized users.
2FA setup page shows QR code for scanning with Google Authenticator, accepts 6-digit verification code.
2FA verify component handles login-time code entry (6-digit TOTP or 8-char backup code).
Auth API functions: `loginUser`, `registerUser`, `getProfile`, `logoutUser`.
Token refresh handled automatically by Axios interceptor.
`authFix.js` has utility fixes for edge cases in auth flow.
📄 Full details → [AuthenticationModule.md](frontend/AuthenticationModule.md)

---

### 14. Dashboard Module (Admin Dashboard, Patient Portal)
Admin/Staff dashboard shows hospital-wide stats: total patients, queue count, available machines, today's appointments.
Content changes based on role — admin sees everything, doctor sees patient queue, nurse sees machine status.
Patient portal (`PatientDashboard.jsx`, 28.4KB) has 4 tabs: Overview, Appointments, Sessions, Bills.
Overview tab shows patient info, upcoming appointments, pending bills, and session statistics.
Sessions tab shows full dialysis history with pre/post vitals and download PDF button.
Bills tab shows all bills with charge breakdown, payment history, and download receipt button.
Data fetched from `/api/patients/dashboard/` endpoints.
PDF downloads triggered via backend API that generates and returns PDF files.
📄 Full details → [DashboardModule.md](frontend/DashboardModule.md)

---

### 15. Patients Module (Patient List, Form, Appointments)
Patient list page shows all patients in a searchable, sortable table with CRUD actions.
Patient form (13.1KB) has sections: personal info, emergency contact, medical info, dialysis info, and optional account creation.
Search by name/ID/phone, filter by gender/blood type/emergency/active status.
Emergency toggle button for quick triage — marks patient as emergency with one click.
When "create account" is checked, a login account is auto-created for the patient using their email.
`PatientAppointments.jsx` (16.2KB) has calendar-based appointment view with status transitions.
Session history panel shows past dialysis sessions with vitals comparison.
API calls use Axios to talk to `/api/patients/` endpoints.
📄 Full details → [PatientsModule.md](frontend/PatientsModule.md)

---

### 16. Queue & Sessions Module (Queue, Session Form, Session Details)
Queue page shows live patient queue with color-coded statuses: waiting (yellow), in progress (green), completed (grey).
Stats bar at top shows counts of waiting, in progress, completed, and emergency cases.
Queue cards display queue number, patient name, priority badge, assigned machine, and action buttons.
Add patient to queue via modal — select patient, set priority (scheduled/walk-in/emergency).
Session form (11.1KB) captures pre-dialysis vitals (BP, heart rate, temperature, SpO2) and dialysis parameters.
Session details (9.6KB) shows side-by-side pre vs post vitals comparison, medications, complications.
Session completion form adds post-dialysis vitals and auto-marks queue entry as completed.
Queue auto-refreshes to show real-time changes.
📄 Full details → [QueueAndSessionsModule.md](frontend/QueueAndSessionsModule.md)

---

### 17. Machines Module (Machine Cards, Add Machine)
Machine page shows all dialysis machines as cards in a grid layout with color-coded status badges.
Stats bar: total machines, available, in use, maintenance, utilization rate %.
Each card shows machine ID, type, manufacturer, current patient (if in use), session count, operating hours.
Maintenance alert icon appears on cards where maintenance is overdue.
Action buttons change based on status: available → assign patient/start maintenance, in use → release, maintenance → complete.
Add machine modal has fields: ID, name, type, manufacturer, serial number, purchase date, warranty, maintenance interval.
Filter by status and search by machine ID/name/manufacturer.
Machine lifecycle: available → in_use → cleaning → available.
📄 Full details → [MachinesModule.md](frontend/MachinesModule.md)

---

### 18. Billing Module (Billing Page, Payment Forms, Dashboard)
Billing page lists all bills with status badges: pending (yellow), partial (orange), paid (green), overdue (red).
Create bill form: select patient, enter sessions count, costs — subtotal, 18% GST, and total auto-calculated.
`RealPaymentForm.jsx` (18.5KB) supports 4 payment methods with tabs: Cash, UPI, Card, Net Banking.
UPI tab generates a QR code image inline — patient scans to pay. Hospital UPI ID displayed next to it.
Card tab takes last 4 digits and bank name. Net Banking tab has dropdown of 8 major banks.
Quick payment creates bill + processes payment in one step for walk-in patients.
Billing dashboard shows total pending, overdue, today's collections, monthly collections.
After payment, shows transaction ID, payment ID, processing fee, and receipt download option.
📄 Full details → [BillingModule.md](frontend/BillingModule.md)

---

### 19. Staff Module (Staff List, Add Staff Modal)
Staff page shows all hospital staff in a table with role badges (admin=purple, doctor=blue, nurse=green, etc.).
Filter by role and department, search by name/email/username.
`AddStaffModal.jsx` (13.3KB) has fields: personal info, role selection, department, hire date, password (for new users).
Roles available: admin, doctor, nurse, technician, receptionist.
Departments: Dialysis Unit, Nephrology, Administration, Maintenance, Reception.
Create mode shows all fields including password. Edit mode hides password and pre-fills existing data.
Active/inactive status toggle for deactivating staff without deleting.
Staff accounts are created as User objects with the selected role.
📄 Full details → [StaffModule.md](frontend/StaffModule.md)

---

### 20. Reports Module (Report Dashboard, Exports)
Reports page shows real-time dashboard statistics pulled from all backend modules.
Report types: patient reports, queue performance, machine utilization, staff attendance.
Export controls: select report type → select format (CSV/Excel/PDF) → pick date range → click download.
Patient reports filterable by type: all patients, emergency only, active only.
Queue reports available as daily, weekly, or monthly summaries with average wait times.
Machine reports show per-machine utilization data and maintenance history.
Staff reports show attendance rate per staff member.
One-click file download — browser saves CSV/Excel/PDF file directly.
📄 Full details → [ReportsModule.md](frontend/ReportsModule.md)

---

### 21. Fleet Module (Ambulance Management, Driver Dashboard, Tracking)
Ambulance management page (24KB, largest page) has 4 tabs: Ambulances, Dispatch, Active Rides, Drivers.
Dispatch tab: select available ambulance + patient + pickup address → click dispatch → ambulance goes on_trip.
Active rides show real-time status with Track Location button that opens live map.
Driver dashboard is mobile-friendly — shows active ride, status update buttons, and Google Maps navigation link.
Driver's phone sends GPS coordinates every 5 seconds via WebSocket to backend.
Track ambulance page receives live location via WebSocket and updates map marker in real-time.
Status transitions validated: assigned → en_route → arrived → completed. Ambulance auto-releases on completion.
Driver CRUD: admin/receptionist can create, edit, and deactivate driver accounts.
📄 Full details → [FleetModule.md](frontend/FleetModule.md)

---

### 22. UI Components & Utilities (Layout, Navbar, Sidebar, Table, Theme, PWA)
37 total React components organized by function: layout, data display, interactions, PWA, error handling.
Sidebar shows different menu items based on user role — admin sees everything, patient sees only their dashboard.
Reusable `Table.jsx` (9.6KB) with sorting, search, pagination, and custom cell renderers.
Dark/light theme toggle with `ThemeContext` — dark mode CSS file is 34.3KB covering all components.
PWA support: `InstallPrompt.jsx` detects installability, `OfflineBanner.jsx` shows when user goes offline.
`ChatBot.jsx` (14.7KB) is a floating chat widget in bottom-right corner with message bubbles.
`ErrorBoundary.jsx` catches React crashes and shows friendly "Something went wrong" page with retry button.
`AppRouter.jsx` (9.3KB) defines all routes with RoleGuard protection for each page.
📄 Full details → [UIComponentsAndUtilities.md](frontend/UIComponentsAndUtilities.md)
