# DialysisTrack — ALL-IN-ONE Viva (Part 2: Q51–Q96)

### BCA Sem 6 | Tilak Maharashtra Vidyapeeth | 60 Marks External

---

## Q51. What is the difference between SQL and MySQL?
**SQL** = a language (Structured Query Language) — SELECT, INSERT, UPDATE, DELETE. **MySQL** = a software (DBMS) that stores data and understands SQL. Others: PostgreSQL, Oracle, SQL Server.

---

## Q52. What is a Primary Key? Example?
Column that **uniquely identifies** each row. In `patients_patient`, `id` is the PK. Also, `patient_id` (P-001, P-002) is a unique identifier for patients.

---

## Q53. What is a Foreign Key? Example?
Column in one table that **refers to the Primary Key** of another. `billing_bill.patient_id` → `patients_patient.id`. Links every bill to a specific patient.

---

## Q54. What is Normalization?
Organising tables to **reduce redundancy**. My DB is in **3NF**: 1NF (no repeating groups), 2NF (no partial dependency), 3NF (no transitive dependency). Patient's address stored once in patient table, not repeated in every bill.

---

## Q55. MVC vs MVT?
**MVC** (Model-View-Controller) = Laravel, Spring. **MVT** (Model-View-Template) = Django. Model = DB, View = business logic, Template = HTML. In my project, React replaces the Template — Django is purely a REST API backend.

---

## Q56. Framework vs Library?
**Library** (React) — you call it, you control the flow. **Framework** (Django) — it calls your code, it controls the flow. Simple: Library = you're the boss. Framework = framework is the boss.

---

## Q57. What is JSON?
**JavaScript Object Notation** — lightweight format for data exchange. Example: `{"patient_id": "P-001", "name": "Rahul", "blood_type": "B+"}`. All API responses in DialysisTrack are JSON.

---

## Q58. Authentication vs Authorization?
**Authentication** = "Who are you?" (login with email + password). **Authorization** = "What can you do?" (Nurse can record vitals but cannot delete patients). JWT handles authentication, RBAC handles authorization.

---

## Q59. What is Git?
**Version control system** — tracks every code change. Benefits: multiple developers work without conflicts, can rollback to previous versions, `.gitignore` prevents pushing `.env` and `node_modules/`.

---

## Q60. What is an API endpoint?
A specific **URL path** that accepts requests. Examples: `GET /api/patients/` (list patients), `POST /api/billing/bills/` (create bill), `PUT /api/patients/5/` (update patient 5), `DELETE /api/staff/3/` (deactivate staff 3).

---

## Q61. localStorage vs sessionStorage?
**localStorage** = permanent until manually cleared (used for JWT tokens, user data). **sessionStorage** = until browser tab closes (used for 2FA verification flag). localStorage works across all tabs, sessionStorage only current tab.

---

## Q62. What is Docker Compose?
Tool to run **multiple Docker containers** together. My `docker-compose.yml` defines 5 services (Nginx, Django, Daphne, MySQL, Redis). `docker-compose up` starts all. `docker-compose down` stops all.

---

## Q63. What is Redis?
**In-memory data store** — extremely fast (RAM, not disk). Used as **message broker** for Django Channels. When driver sends GPS update via WebSocket, Redis delivers the message to all connected tracking screens instantly.

---

## Q64. What is Pagination?
Splits large data into **pages** (20 per page). Without it, loading 500 patients at once would be slow. Configured: `'PAGE_SIZE': 20`. API returns `?page=1`, `?page=2`.

---

## Q65. == vs === in JavaScript?
`==` (loose) — compares values after type conversion: `"5" == 5` is `true`. `===` (strict) — compares value AND type: `"5" === 5` is `false`. Always use `===` to avoid bugs.

---

## Q66. Explain the architecture of your project.
**3-tier architecture**: **Tier 1 (Presentation)** = React SPA running in browser. **Tier 2 (Application)** = Django + DRF, JWT auth, RBAC, WebSocket. **Tier 3 (Data)** = MySQL database + Redis. Frontend talks to backend via REST API (JSON) and WebSocket (GPS). Nginx routes traffic.

---

## Q67. Explain the folder structure.
`backend/` has 11 Django apps (users, patients, billing, fleet, etc.), `config/` (settings, URLs), `manage.py`. `frontend/src/` has `pages/` (23 pages), `components/` (34 reusable components), `context/` (AuthContext), `AppRouter.jsx`. `Documentation/` has blackbook chapters.

---

## Q68. How to deploy on the internet?
Buy cloud VM (AWS/DigitalOcean) → Install Docker → Clone project → Create production `.env` (DEBUG=False) → `docker-compose up -d` → Point domain to IP → Install SSL (Let's Encrypt) → Run `migrate` + `createsuperuser`. Cost: Rs.800-2500/month.

---

## Q69. What are React Hooks?
Special functions for state and side effects in functional components. Used: **useState** (store data), **useEffect** (run on load/change), **useContext** (access AuthContext), **useNavigate** (redirect), **useLocation** (current URL), **useParams** (URL params like ride ID).

---

## Q70. Explain useState and useEffect.
**useState**: `const [patients, setPatients] = useState([])` — stores data, triggers re-render on change. **useEffect**: `useEffect(() => { fetchPatients() }, [])` — runs side effects (API calls) when component loads. Empty `[]` = run once. `[searchTerm]` = run when searchTerm changes.

---

## Q71. How do you handle errors?
**Backend**: DRF returns proper HTTP codes (200, 400, 401, 403, 404, 500), try-except blocks. **Frontend**: Axios `.catch()` blocks, **ErrorBoundary** component (fallback screen if component crashes), form validation with red error messages. **WebSocket**: falls back to HTTP polling if connection fails.

---

## Q72. What is a ViewSet in DRF?
A class handling **multiple API actions** in one place. `ModelViewSet` auto-provides: list (GET /), create (POST /), retrieve (GET /id), update (PUT /id), delete (DELETE /id). All CRUD operations from one class. Custom logic added only when needed.

---

## Q73. Function-Based Views vs Class-Based Views?
**FBV** = simple function, less reusable, handle methods with `if request.method == 'GET'`. **CBV** = class with separate methods (`get()`, `post()`), highly reusable via inheritance. I used **CBV (ViewSets)** for most APIs, **FBV** for custom logic like login and 2FA.

---

## Q74. Is your project responsive?
Yes. **Desktop**: sidebar + content side by side. **Tablet**: sidebar collapses to hamburger menu. **Mobile**: sidebar = slide-out overlay, larger buttons for touch. Uses responsive CSS classes. PWA allows full-screen on tablets.

---

## Q75. Explain the request-response cycle.
User clicks "Patients" → React Router renders component → `useEffect` fires → Axios sends `GET /api/patients/` with JWT header → Nginx → Django CORS check → JWT validation → Role permission check → ORM query → MySQL returns data → Serializer → JSON response → React `setPatients()` → Table rendered. **~100-200ms total.**

---

## Q76. What challenges did you face?
(1) RBAC design — permission matrix took a week, (2) WebSocket GPS — async Django Channels debugging was hard, (3) JWT auto-refresh with Axios interceptors, (4) Appointment conflict SQL for overlapping times, (5) Frontend-backend JSON format mismatches.

---

## Q77. What new things did you learn?
Django REST Framework, JWT auth, WebSocket (Django Channels), Razorpay API, Google Maps API, Docker deployment, 2FA (TOTP + QR code), healthcare domain (Kt/V, infection protocols).

---

## Q78. Demo tips (what to show in viva).
Login as Admin → Dashboard → Patients list → Book appointment → Try same machine/time (show conflict error) → Queue → Start session → Billing (show GST auto-calc, UPI QR) → Ambulance tracking (Google Maps) → Logout → Login as Patient (show limited access). **Keep servers running before entering viva room.**

---

## Q79. Scope and limitations?
**Scope**: Complete single-centre management, 9 modules, 6 roles, GPS tracking, auto-billing. **Limitations**: (1) Single-centre only, (2) No direct machine integration (manual vitals entry), (3) Limited offline (needs internet), (4) No AI/ML, (5) English only.

---

## Q80. Who is the end user/client?
Client: **I Care Dialysis Centre**, Pune. Representative: **Miss Varsha Pote** (Senior Technician). End users: Admin, Doctors, Nurses, Technicians, Receptionists, Patients, Drivers.

---

## Q81. npm vs pip?
**npm** = JavaScript package manager (`package.json`, `npm install axios`). **pip** = Python package manager (`requirements.txt`, `pip install django`). npm for frontend (React, Axios). pip for backend (Django, DRF, PyMySQL).

---

## Q82. What is a DFD? Explain levels.
DFD shows **data movement** through the system. **Level 0 (Context)**: entire system as one circle, 7 external entities around it with data arrows. **Level 1**: expands into 8 processes (Authentication, Patient Mgmt, Scheduling, Queue, Billing, Fleet, Clinical, Reports) with data stores (MySQL tables).

---

## Q83. What is FDD?
**Functional Decomposition Diagram** — tree structure breaking system into modules/sub-functions. Top: DialysisTrack → 11 modules (User Mgmt, Patient Mgmt, Scheduling, Queue, Billing, Machines, Fleet, Clinical, Reports, Notifications, Audit). Each module breaks into sub-functions. Shows **what exists**, not data flow.

---

## Q84. Context Diagram vs DFD Level 1?
**Context** = system as one circle, shows only inputs/outputs, no data stores, bird's eye view. **Level 1** = system expanded into 8 process circles, shows internal logic, includes data stores. Context is the "closed box", Level 1 "opens the box".

---

## Q85. What is Data Element Dictionary?
Defines **every field**: name, data type, constraints, meaning. Examples: `patient_id` (VARCHAR 20, unique, auto-generated P-001), `hepatitis_b_status` (ENUM: negative/positive/unknown, triggers isolated machine), `tax_amount` (DECIMAL, computed 18% GST, never manual), `driver_lat/lng` (DECIMAL 9,6, GPS via WebSocket).

---

## Q86. Explain Input and Output design.
**Input**: Login form (email, password), Patient registration (name, DOB, infection status), Appointment booking (patient, machine, date, time — server validates conflicts), Vitals form (BP, heart rate, weight). **Output**: Dashboard (metric cards, charts), Patient list (paginated table), Bill invoice (itemised + GST), Queue board (live status), GPS map (moving marker), Reports (CSV download). Both have **client + server validation**.

---

## Q87. Explain ERD symbols.
**Rectangle** = Entity (Patient, Bill). **Ellipse** = Attribute (first_name). **Underlined attribute** = Primary Key. **Diamond** = Relationship ("Books"). **Lines with 1:N** = Cardinality. Patient 1:N Appointment, Patient 1:N Bill, User 1:1 Patient, Ambulance 1:N Ride.

---

## Q88. Explain 3 output screens from your project.
**Admin Dashboard** (Fig 6.2): metric cards (patients, sessions, revenue), activity feed, appointment schedule. **Queue Board** (Fig 6.6): live session board, check-in/start/complete buttons, auto-refreshes every 30 sec. **UPI Payment** (Fig 6.14): dynamic QR code with bill amount + centre UPI ID, patient scans with Google Pay.

---

## Q89. What is the implementation procedure?
**Phase 1 (Backend)**: Django + MySQL setup, 11 apps, ORM models, JWT auth, RBAC permissions, REST APIs, WebSocket consumer. **Phase 2 (Frontend)**: React + Vite, AuthContext, React Router, 34 components, Axios interceptors, Razorpay integration. **Phase 3 (Integration)**: Connect frontend-backend, fix CORS/JSON issues. **Phase 4 (Deployment)**: Dockerfiles, docker-compose, Nginx config.

---

## Q90. Explain Receptionist workflows from User Manual.
**Register Patient**: Patients → +New → Fill details + infection status → Save → Get auto ID (P-045). **Book Appointment**: Appointments → +Book → Select patient/machine/doctor/time → Confirm (conflict = error). **Process Payment**: Billing → Find bill → Process Payment → Cash (mark paid) or UPI (show QR, patient scans, confirm).

---

## Q91. What is the conclusion of your project?
Successfully replaced manual system. Achievements: (1) Eliminated double-booking, (2) Automated billing with zero GST errors, (3) Real-time dashboard + GPS tracking, (4) Secured patient data (JWT+2FA+RBAC), (5) Reduced booking time from 5-10 min to 30 sec, (6) Digitised all records. 25 test cases passed. Client approved.

---

## Q92. What references did you use?
**Books**: 'Django for Professionals' (Vincent), 'Learning React' (Banks). **Docs**: Django, React, DRF, MySQL, Razorpay documentation. **Standards**: UML 2.5, IEEE 830. **Domain**: National Kidney Foundation KDOQI guidelines (Kt/V targets), WHO infection prevention for dialysis.

---

## Q93. Hardware and Software requirements?
**HW**: i5 processor, 8GB RAM, 256GB SSD, 10Mbps internet. Server: 2 vCPU, 4GB RAM. **SW**: Ubuntu 22.04, Python 3.10+, Django 4.2, Node.js 18+, React 18, MySQL 8.0, Docker 24+, Chrome/Firefox/Edge.

---

## Q94. Explain DFD symbols.
**Rectangle** = External Entity (Receptionist, Doctor). **Circle/Rounded rect** = Process (Schedule Appointment, Process Payment). **Open rectangle (2 lines)** = Data Store (Patient Store, Bill Store). **Arrow** = Data Flow (Login Credentials → Auth process). Rule: External entities never communicate directly — all data flows through system processes.

---

## Q95. Explain the complete session lifecycle.
Patient arrives → Receptionist checks appointment → Queue. Technician clicks **Check-In** (WAITING). Machine ready → **Start Session** (IN PROGRESS, timer starts). Nurse records vitals every 30 min. Session ends → **Complete Session** (post-vitals recorded). System **auto-generates bill** (Subtotal + 18% GST). Receptionist processes payment (Cash/UPI/Razorpay). Bill → **PAID**. Involves 4 modules (Queue, Sessions, Billing, Payments) and 3 roles (Technician, Nurse, Receptionist).

---

## Q96. Super Admin (Django Admin) vs Regular Admin (React)?
**React Admin** at `:3000` = centre manager, day-to-day operations, has business rule constraints (can't edit completed sessions). **Django Admin** at `:8000/admin/` = IT administrator, direct database access, **bypasses** all React restrictions, used for password resets, bulk exports, 2FA resets. Only `is_superuser=True` users can access Django Admin. Separation is intentional — React protects from mistakes, Django Admin gives raw power.

---

## VIVA TIPS

> 1. **Start with definition** → "JWT stands for JSON Web Token..."
> 2. **Then explain project usage** → "In my project, when user logs in..."
> 3. **Give real example** → "For example, the receptionist..."
> 4. **If you don't know** → "I haven't implemented this, but the concept is..."
> 5. **Never stay silent** — explain whatever you know.
> 6. **Be confident** — you built this project, you know it best!

---

## STUDY ORDER (Total ~3.5 hours)

| Priority | Questions | Time |
|----------|-----------|------|
| 1st | Q1–Q3 (Project intro) | 10 min |
| 2nd | Q4–Q8 (Tech stack) | 15 min |
| 3rd | Q10–Q12 (Key features) | 15 min |
| 4th | Q52–Q54, Q87 (DB basics — PK, FK, Normalization, ERD) | 15 min |
| 5th | Q17–Q18, Q49 (Testing + Security) | 15 min |
| 6th | Q66, Q75, Q95 (Architecture, Request cycle, Session lifecycle) | 20 min |
| 7th | Q26, Q40 (2FA, Login flow) | 15 min |
| 8th | Q20–Q22, Q19 (SDLC, Existing vs Proposed, Feasibility) | 15 min |
| 9th | Q82–Q86 (DFD, FDD, Context, Data Dictionary) | 20 min |
| 10th | Q76–Q80 (Challenges, Learnings, Demo, Scope, Client) | 15 min |
| 11th | Remaining questions | 30 min |
| **TOTAL** | **96 questions** | **~3.5 hrs** |

---

*Good luck! You built a full-stack healthcare app with real-time GPS, payment gateway, 2FA, and RBAC — be proud and speak with confidence!* 💪

*Prepared for: BCA Semester 6 External Viva — Tilak Maharashtra Vidyapeeth, Pune*
*Project: DialysisTrack — Dialysis Centre Management System*
