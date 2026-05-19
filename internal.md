# DialysisTrack — Internal Viva Preparation Guide
## TY BCA (Semester 6) | Tilak Maharashtra Vidyapeeth, Pune
### Internal Assessment: 40 Marks | Final Year Project

---

## TABLE OF CONTENTS

1. [How to Present / Explain the Project](#how-to-present--explain-the-project)
2. [Project Introduction (Opening Statement)](#project-introduction-opening-statement)
3. [Aim & Objectives](#aim--objectives)
4. [Why We Chose This Project](#why-we-chose-this-project)
5. [Top 20 Expected Viva Questions with Answers](#top-20-expected-viva-questions-with-answers)
6. [Live Demo Flow (What to Show)](#live-demo-flow-what-to-show)
7. [Important Technical Terms to Know](#important-technical-terms-to-know)
8. [Last-Minute Quick Revision](#last-minute-quick-revision)

---

## HOW TO PRESENT / EXPLAIN THE PROJECT

### Before You Start (Preparation Checklist)

- [ ] Formal dress code (mandatory)
- [ ] Both group partners present (compulsory)
- [ ] Laptop fully charged with charger
- [ ] Backend server running (`python manage.py runserver`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Browser open at http://localhost:5173
- [ ] Blackbook soft copy ready (PDF on desktop)
- [ ] Keep PASSWORDS.md open for quick login reference
- [ ] Google Authenticator app installed on phone (for 2FA demo)

### Presentation Flow (5–7 minutes)

**Step 1: Introduce the Project (1 minute)**
- Greet the examiner. State your name, roll number, group members.
- Say the project title: **"DialysisTrack — Dialysis Queue Management System"**
- Give a one-line summary: *"It is a web-based hospital management system designed specifically for dialysis centers to manage patients, appointments, dialysis queue, machines, billing, and staff — with role-based access control and two-factor authentication."*

**Step 2: Explain the Problem Statement (1 minute)**
- Many dialysis centers in India still use paper registers and manual tracking.
- Patients wait without knowing their turn. Machines are not tracked properly. Billing is done manually.
- There is no centralized system for doctors, nurses, technicians, and receptionists to coordinate.
- Our project digitizes this entire workflow.

**Step 3: Show the Live Demo (3–4 minutes)**
- Login as Admin → Show Dashboard → Show Patient List → Show Queue → Show Machines → Show Billing → Show Reports.
- Login as Doctor → Show limited access (role-based).
- Login as Patient → Show patient portal (own records only).
- Show 2FA setup if asked.

**Step 4: Explain Technology Stack (30 seconds)**
- Backend: Django REST Framework (Python), MySQL database.
- Frontend: React.js with Vite build tool.
- Authentication: JWT tokens + Two-Factor Authentication (TOTP).
- Others: Docker for deployment, Nginx for production.

**Step 5: Conclude (30 seconds)**
- Summarize what the project achieves.
- Mention future enhancements (mobile app, SMS notifications, IoT machine monitoring).
- Thank the examiner.

### Tips for Presentation
- **Speak confidently.** Don't read from the screen.
- **Use proper terms:** "Backend API," "Frontend SPA," "JWT Authentication," "Role-based access control."
- **If you don't know an answer**, say: *"I have not implemented that feature yet, but I understand the concept. It can be done using [give a general idea]."*
- **Both partners should speak.** Divide topics — one handles backend, other handles frontend.

---

## PROJECT INTRODUCTION (OPENING STATEMENT)

> **"DialysisTrack is a comprehensive, web-based Dialysis Queue Management System developed as our TY BCA final year project. It is designed to digitize and streamline the complete workflow of a dialysis center — from patient registration and appointment scheduling to real-time queue management, machine tracking, session monitoring, billing, and reporting. The system supports 7 user roles (Admin, Doctor, Nurse, Technician, Receptionist, Patient, and Driver), each with specific access permissions. Security is ensured through JWT-based authentication and mandatory Two-Factor Authentication for all staff members. The backend is built with Django REST Framework using MySQL database, and the frontend is a modern single-page application built with React.js and Vite."**

---

## AIM & OBJECTIVES

### Aim of the Project

> To design and develop a web-based Dialysis Queue Management System that digitizes the workflow of dialysis centers, improves patient care through real-time queue and machine tracking, and ensures secure role-based access for all hospital staff.

### Objectives

1. **Patient Management** — Maintain digital records of patient demographics, medical history, diagnosis, allergies, medications, and dialysis-specific data (dry weight, vascular access type).

2. **Appointment Scheduling** — Allow booking of dialysis sessions in morning, evening, and night shifts with automatic conflict detection.

3. **Real-Time Queue Management** — Track patients through Waiting → In Progress → Completed status with priority levels (Emergency, Scheduled, Walk-in).

4. **Machine Management** — Monitor 6+ dialysis machines with status tracking (Available, In Use, Maintenance, Cleaning, Out of Service), maintenance logs, and cleaning logs.

5. **Dialysis Session Recording** — Record pre/post vitals (BP, heart rate, temperature, SpO2), dialysis parameters (blood flow rate, ultrafiltration volume), medications, and complications.

6. **Billing & Payment** — Auto-calculate bills with session cost, medicine cost, consultation, GST (18%), discounts. Support Cash and UPI payment methods.

7. **Role-Based Access Control (RBAC)** — Implement 7 distinct roles with specific permissions so each user sees only what they need.

8. **Two-Factor Authentication (2FA)** — Mandatory TOTP-based 2FA for all staff (Admin, Doctor, Nurse, Technician, Receptionist) to ensure data security.

9. **Reports & Analytics** — Generate patient reports, financial reports, machine utilization reports with charts.

10. **Fleet/Ambulance Management** — Track ambulances with live GPS, dispatch for patient pickup.

---

## WHY WE CHOSE THIS PROJECT

### Answer for Viva:

> *"We chose this project because dialysis is a critical life-saving treatment that patients need 2-3 times per week. In India, there are over 2.2 lakh patients requiring regular dialysis, but most dialysis centers still rely on manual registers and paper-based tracking. This causes problems like long patient wait times with no visibility, mismanagement of expensive dialysis machines, billing errors, and lack of coordination between doctors, nurses, and technicians.*
>
> *As BCA students, we wanted to solve a real-world healthcare problem using technology. This project covers all major concepts we learned in our BCA course — database management (MySQL), web development (Django, React), authentication & security (JWT, 2FA), API development (REST API), and software engineering principles (SDLC, UML diagrams). It gave us practical experience in full-stack development while creating something that can genuinely help hospitals."*

### Key Points to Mention:
- It solves a **real-world problem** — not just a demo project.
- India has a **shortage of dialysis management software** in smaller centers.
- It covers the **entire BCA syllabus practically** — DBMS, Web Dev, Software Engineering, Networking concepts.
- **Healthcare IT** is a growing industry in India.
- The project is **scalable** — can be deployed in actual hospitals.

---

## TOP 20 EXPECTED VIVA QUESTIONS WITH ANSWERS

---

### Q1. What is the aim/objective of your project?

**Answer:** The aim of our project is to develop a web-based Dialysis Queue Management System called "DialysisTrack" that digitizes the workflow of dialysis centers. It helps manage patients, schedule appointments, track the real-time dialysis queue, monitor machine availability, record dialysis sessions with vitals, handle billing with GST calculation, and provide role-based access to different hospital staff — all through a secure system with JWT authentication and mandatory two-factor authentication.

---

### Q2. Why did you choose this project?

**Answer:** We chose this project because dialysis is a life-critical treatment needed by over 2.2 lakh patients in India, 2-3 times per week. Most small and mid-size dialysis centers still operate manually using paper registers, leading to long wait times, machine mismanagement, and billing errors. We wanted to use our BCA knowledge to solve this real healthcare problem. The project also covers all major subjects we studied — DBMS, Web Development, Software Engineering, Computer Networks, and Security — giving us comprehensive practical experience.

---

### Q3. What technology stack have you used?

**Answer:**
- **Backend:** Django REST Framework (Python 3.13) — provides the REST API.
- **Frontend:** React.js 18 with Vite as the build tool — single-page application.
- **Database:** MySQL 8.0 for production, SQLite for development.
- **Authentication:** JWT (JSON Web Tokens) using `djangorestframework-simplejwt`.
- **2FA:** TOTP (Time-based One-Time Password) using `pyotp` and `qrcode` libraries.
- **Styling:** Tailwind CSS for responsive UI.
- **HTTP Client:** Axios for API calls from frontend.
- **Deployment:** Docker containers with Nginx reverse proxy.
- **Version Control:** Git.

---

### Q4. What is Django REST Framework? Why did you use it?

**Answer:** Django REST Framework (DRF) is a powerful toolkit built on top of Django for building Web APIs. We used it because:
- It provides built-in serializers to convert database models to JSON and vice versa.
- It has built-in authentication and permission classes.
- ViewSets and Routers reduce boilerplate code.
- It comes with a browsable API for easy testing.
- Django's ORM allows us to interact with MySQL without writing raw SQL queries.
- It follows the MVT (Model-View-Template) architecture, which maps well to our REST API pattern.

---

### Q5. What is React.js? Why did you use it for the frontend?

**Answer:** React.js is a JavaScript library developed by Facebook for building user interfaces using reusable components. We used it because:
- **Component-based architecture** — We created reusable components like PatientForm, QueueCard, BillingTable, Navbar, Sidebar, etc.
- **Virtual DOM** — React updates only the changed parts of the page, making the UI fast and responsive.
- **State management** — Using React's useState and useEffect hooks, we manage real-time data like queue status and machine availability.
- **Single-Page Application (SPA)** — The entire app loads once, and React Router handles page navigation without full page reloads.
- **Large ecosystem** — Libraries like Axios, React Router, Lucide Icons are readily available.

---

### Q6. What is JWT Authentication? How does it work in your project?

**Answer:** JWT (JSON Web Token) is a secure, stateless authentication mechanism. In our project:
1. User submits email and password to the `/api/token/` endpoint.
2. Backend validates credentials and returns two tokens: **Access Token** (expires in 30 minutes) and **Refresh Token** (expires in 1 day).
3. Frontend stores these tokens in localStorage.
4. Every API request includes the Access Token in the `Authorization: Bearer <token>` header.
5. When the Access Token expires, the frontend automatically sends the Refresh Token to `/api/token/refresh/` to get a new Access Token.
6. If both tokens expire, the user is logged out.

This is more secure than session-based authentication because the server doesn't need to store session data.

---

### Q7. Explain the role-based access control in your project.

**Answer:** Our system has 7 user roles, each with different permissions:

| Role | What They Can Access |
|------|---------------------|
| **Admin** | Everything — patients, queue, machines, staff, billing, reports, Django admin panel |
| **Doctor** | Patients, queue, sessions, reports (no staff management, limited billing) |
| **Nurse** | Queue (full access), patients (view/update), sessions, machine monitoring |
| **Technician** | Machines (full access), maintenance logs, queue monitoring |
| **Receptionist** | Patient registration, appointments, billing (full access) |
| **Patient** | Own appointments, own medical records, own billing only |
| **Driver** | Ambulance assignments, ride status updates |

The backend checks the user's `role` field on every API request using Django's permission classes. The frontend also hides/shows menu items based on the role.

---

### Q8. What is Two-Factor Authentication? How have you implemented it?

**Answer:** Two-Factor Authentication (2FA) adds a second layer of security beyond the password. We implemented TOTP-based 2FA:
1. **Setup:** On first login, staff members are forced to set up 2FA. They scan a QR code using Google Authenticator app.
2. **Login:** After entering email and password, they must enter a 6-digit code from the authenticator app.
3. **Grace Period:** For convenience, the first 3 logins or 24 hours after setup don't require the code.
4. **Mandatory:** Staff cannot skip or disable 2FA. It is mandatory for Admin, Doctor, Nurse, Technician, and Receptionist.
5. **Patients** are exempt from 2FA for ease of use.

We used the `pyotp` library to generate TOTP secrets and the `qrcode` library to generate QR codes.

---

### Q9. What database have you used? Explain the database design.

**Answer:** We used **MySQL 8.0** as the primary database. Key tables include:

- **users_user** — Stores all user accounts (extends Django's AbstractUser with role, phone_number, etc.)
- **patients_patient** — Patient demographics, medical info, dialysis-specific data (linked to users via OneToOneField)
- **appointments_appointment** — Appointment scheduling with date, shift, time, status
- **dialysis_queue_queue** — Real-time queue with priority, status, timing, assigned machine, vitals
- **dialysis_queue_dialysissession** — Detailed session data: pre/post vitals, dialysis parameters, medications, complications
- **machines_dialysismachine** — Machine info, status, maintenance schedule, usage statistics
- **machines_maintenancelog** — Maintenance history with technical test results
- **billing_bill** — Bills with auto-calculation (subtotal, GST 18%, discount, total)
- **billing_payment** — Payment records with method (Cash/UPI), transaction ID
- **fleet_ambulance / fleet_ambulanceride** — Ambulance and ride tracking
- **notifications_notification** — System notifications
- **notifications_auditlog** — Tracks all user actions for security audit

We used Django's ORM (Object-Relational Mapping) to interact with the database instead of writing raw SQL.

---

### Q10. What is the Software Development Life Cycle (SDLC) model you followed?

**Answer:** We followed the **Agile (Iterative) model** because:
- We built the project in multiple iterations (sprints).
- Each iteration added new features: first the core CRUD, then authentication, then 2FA, then billing, then fleet management, then notifications.
- We tested after each iteration and fixed bugs before moving forward.
- This allowed us to get a working product early and continuously improve it.

Phases we completed:
1. **Requirement Analysis** — Studied how dialysis centers work, identified features needed.
2. **System Design** — Created ER diagrams, UML diagrams (Use Case, Class, Sequence, Activity, DFD, etc.).
3. **Implementation** — Coded backend (Django) and frontend (React) simultaneously.
4. **Testing** — Used custom Python scripts for API testing, manual UI testing, role permission testing.
5. **Deployment** — Docker + Nginx configuration for production deployment.

---

### Q11. What are the modules in your project?

**Answer:** Our project has **9 main modules:**

1. **Dashboard Module** — Statistics cards (total patients, queue count, active sessions, available machines), recent activities, quick action links.
2. **Patient Management Module** — CRUD operations, search, filter, patient portal access creation.
3. **Queue Management Module** — Add to queue, priority management (Emergency/Scheduled/Walk-in), start session, assign machine, complete session.
4. **Machine Management Module** — Machine CRUD, status management (5 statuses), maintenance logs, cleaning logs.
5. **Appointment Module** — Schedule appointments in 3 shifts (Morning/Evening/Night), check-in, status tracking.
6. **Session Module** — Detailed dialysis session recording — pre/post vitals, dialysis parameters, medications, complications, doctor/nurse notes.
7. **Billing Module** — Bill generation with auto-calculation, GST, discounts, payment recording (Cash/UPI), invoice generation.
8. **Staff Module** — Staff CRUD, password management, role assignment, schedule management, attendance tracking, leave requests.
9. **Reports Module** — Patient reports, financial reports, machine utilization reports with charts.

**Additional modules:** Notifications, Audit Logs, Fleet Management (Ambulance), Two-Factor Authentication, Forgot Password.

---

### Q12. How does the queue management work? Explain the workflow.

**Answer:** The queue management follows this workflow:

1. **Patient arrives** at the dialysis center.
2. **Receptionist/Nurse** adds the patient to the queue with a priority level:
   - **Emergency** — Immediate attention, goes to top of queue
   - **Scheduled** — Has an appointment
   - **Walk-in** — No appointment, lowest priority
3. **Queue status changes:** Waiting → In Progress → Completed
4. **When a machine becomes available**, the nurse assigns it to the next patient in queue.
5. **Session starts** — Timer begins, machine status changes to "In Use."
6. **During session** — Nurse records vitals (BP, heart rate, weight), monitors for complications.
7. **Session completes** — Machine becomes "Available" again, patient moves to "Completed."
8. **Bill is generated** automatically based on the session.

The queue uses a priority-based system where emergency patients are always served first regardless of arrival time.

---

### Q13. How is billing handled in your project?

**Answer:** Billing is automated with the following structure:

**Bill Components:**
- Dialysis Session Cost: ₹2,500 per session
- Medicine Cost: Variable
- Consultation Cost: ₹500
- Other Charges: Optional

**Calculation:**
```
Subtotal = (Sessions × Session Cost) + Medicine + Consultation + Other Charges
GST = Subtotal × 18%
Total = Subtotal + GST - Discount
```

**Bill Statuses:** Pending → Paid / Partially Paid / Overdue / Cancelled

**Payment Methods:** Cash and UPI (PhonePe/GPay/Paytm)

Each bill gets an auto-generated bill number (format: `DT20260418XXX`), and each payment gets a unique payment ID. The system tracks paid amount vs total amount for partial payments.

---

### Q14. What is the difference between your frontend and backend?

**Answer:**
| Aspect | Backend (Django) | Frontend (React) |
|--------|-----------------|------------------|
| **Language** | Python | JavaScript |
| **Purpose** | Business logic, database, API | User interface, user interaction |
| **Runs on** | Server (localhost:8000) | Browser (localhost:5173) |
| **Communication** | Provides REST API (JSON) | Consumes API using Axios |
| **Database** | Directly connected to MySQL | No direct DB access |
| **Authentication** | Validates credentials, issues JWT | Stores JWT, sends with requests |

They communicate through **REST API** — Frontend sends HTTP requests (GET, POST, PUT, DELETE) to Backend endpoints, and Backend responds with JSON data.

---

### Q15. What is REST API? How have you used it?

**Answer:** REST (Representational State Transfer) API is an architectural style for designing web services. In our project:

- **GET** `/api/patients/` — Retrieve list of all patients
- **POST** `/api/patients/` — Create a new patient
- **GET** `/api/patients/5/` — Get details of patient with ID 5
- **PUT** `/api/patients/5/` — Update patient with ID 5
- **DELETE** `/api/patients/5/` — Delete patient with ID 5

Similarly for `/api/queue/`, `/api/machines/`, `/api/appointments/`, `/api/billing/`, `/api/staff/`.

Each endpoint checks the user's role and permissions before processing the request. Data is exchanged in JSON format.

---

### Q16. What security measures have you implemented?

**Answer:** We have implemented multiple layers of security:

1. **JWT Authentication** — Stateless token-based auth with automatic expiry and refresh.
2. **Two-Factor Authentication (2FA)** — Mandatory TOTP-based 2FA for all staff using Google Authenticator.
3. **Password Hashing** — Django uses PBKDF2 algorithm with SHA256 hash; passwords are never stored in plain text.
4. **Role-Based Access Control (RBAC)** — Each API endpoint checks user role before allowing access.
5. **CORS Protection** — Only specified frontend origin (localhost:5173) can call the API.
6. **Audit Logging** — All user actions (create, update, delete, login, logout) are logged with timestamp and IP address.
7. **Token Expiry** — Access tokens expire in 30 minutes, refresh tokens in 1 day.
8. **Input Validation** — Django serializers validate all input data before saving to database.

---

### Q17. What are the UML diagrams you have prepared?

**Answer:** We have prepared the following 9 UML diagrams (available in our blackbook):

1. **Use Case Diagram** — Shows actors (Admin, Doctor, Nurse, Patient, etc.) and their interactions with the system.
2. **Class Diagram** — Shows all model classes (Patient, User, Queue, Machine, Bill, etc.) with attributes and relationships.
3. **Sequence Diagram** — Shows the flow of a dialysis session from patient arrival to billing.
4. **Activity Diagram** — Shows the workflow of queue management step by step.
5. **ER Diagram** — Shows database tables and their relationships (1:1, 1:N, M:N).
6. **Data Flow Diagram (DFD)** — Level 0 (context) and Level 1 showing data flow between modules.
7. **State Chart Diagram** — Shows state transitions of queue entry (Waiting → In Progress → Completed).
8. **Component Diagram** — Shows frontend, backend, database, and their connections.
9. **Deployment Diagram** — Shows Docker containers, Nginx, and server architecture.

---

### Q18. What challenges did you face during development?

**Answer:**
1. **JWT Token Expiry** — Initially, users were getting logged out frequently. We fixed this by implementing automatic token refresh using Axios interceptors.
2. **Role-Based Permissions** — The `get()` query returned multiple users when there were duplicates. We fixed it by using `filter().first()` and adding email uniqueness checks.
3. **2FA Implementation** — Integrating TOTP-based 2FA with the existing JWT flow was complex. We implemented a grace period system to balance security with usability.
4. **Queue Real-time Updates** — Ensuring the queue status reflects immediately when a session starts or completes required careful state management in React.
5. **Windows Encoding Issues** — Python scripts with emoji characters failed on Windows due to cp1252 encoding. We had to force UTF-8 output.
6. **CORS Issues** — Cross-Origin Resource Sharing between frontend (port 5173) and backend (port 8000) required proper `django-cors-headers` configuration.

---

### Q19. What are the future enhancements you plan?

**Answer:**
1. **Mobile Application** — Develop a React Native app for patients to check appointments from their phone.
2. **SMS/WhatsApp Notifications** — Send appointment reminders and queue updates via SMS using Twilio API.
3. **IoT Integration** — Connect dialysis machines to IoT sensors for real-time monitoring of machine parameters.
4. **AI-based Predictions** — Use machine learning to predict patient no-shows and optimal scheduling.
5. **Telemedicine Module** — Video consultation with nephrologist through the platform.
6. **Multi-Hospital** — Support multiple branches of a dialysis center chain.
7. **Insurance Integration** — Direct integration with insurance providers for cashless settlements.
8. **PWA (Progressive Web App)** — Offline-capable mobile version for areas with poor internet.

---

### Q20. How is your project different from existing systems?

**Answer:** Our project stands out because:
1. **Combined system** — Most existing systems handle either queue OR billing OR patients separately. Ours integrates ALL modules in one platform.
2. **7 user roles** — Most systems have only admin/user. We have 7 specific roles with granular permissions.
3. **Two-Factor Authentication** — Most hospital management projects in BCA/MCA don't implement 2FA. We have mandatory TOTP-based 2FA.
4. **Real-time Queue** — Live queue tracking with priority levels, not just a static list.
5. **Indian Context** — Billing uses INR (₹) with 18% GST, supports UPI payments — designed for Indian dialysis centers.
6. **Ambulance/Fleet Module** — GPS-based ambulance tracking is unique to our project.
7. **Audit Trail** — Complete logging of all user actions for compliance and security.
8. **Modern Tech Stack** — React + Django + JWT is industry-standard, not outdated PHP/HTML.

---

## LIVE DEMO FLOW (WHAT TO SHOW)

### Demo Script (Follow this order during the demo)

**1. Admin Login & Dashboard (1 min)**
```
URL: http://localhost:5173
Email: admin@dialysis.com
Password: Admin@2026 (or admin123)
→ Show dashboard with stats cards
→ Show sidebar navigation
```

**2. Patient Management (30 sec)**
```
→ Click "Patients" in sidebar
→ Show patient list with search
→ Click on a patient → Show details (diagnosis, medications, vitals)
→ Show "Add Patient" form (don't need to add, just show the form)
```

**3. Queue Management (1 min)**
```
→ Click "Queue" in sidebar
→ Show waiting patients with priority badges
→ Show "In Progress" patient with assigned machine
→ Explain priority system (Emergency > Scheduled > Walk-in)
```

**4. Machine Management (30 sec)**
```
→ Click "Machines" in sidebar
→ Show machine cards with status colors
→ Show Available (green), In Use (blue), Maintenance (orange)
```

**5. Billing (30 sec)**
```
→ Click "Billing" in sidebar
→ Show bills list with amounts
→ Show GST calculation
→ Show payment status (Pending/Paid)
```

**6. Role-Based Access Demo (1 min)**
```
→ Logout from Admin
→ Login as Patient: ramesh.patil@email.com / patient123
→ Show limited sidebar (only My Appointments, My Records)
→ Show patient cannot see staff, machines, or other patients
```

**7. 2FA Demo (if asked) (30 sec)**
```
→ Show 2FA setup page (QR code)
→ Show Google Authenticator on phone
→ Explain grace period concept
```

---

## IMPORTANT TECHNICAL TERMS TO KNOW

| Term | Simple Meaning |
|------|---------------|
| **REST API** | Rules for frontend-backend communication using HTTP methods (GET, POST, PUT, DELETE) |
| **JWT** | JSON Web Token — a secure encoded token for user authentication |
| **TOTP** | Time-based One-Time Password — changes every 30 seconds (used in 2FA) |
| **ORM** | Object-Relational Mapping — write Python code instead of SQL queries |
| **SPA** | Single Page Application — entire app loads once, no full page reloads |
| **CRUD** | Create, Read, Update, Delete — basic database operations |
| **RBAC** | Role-Based Access Control — permissions based on user role |
| **CORS** | Cross-Origin Resource Sharing — allows frontend to call backend on different port |
| **Django ViewSet** | A class that provides CRUD API endpoints automatically |
| **Serializer** | Converts database objects to JSON and validates input data |
| **Middleware** | Code that runs before/after every request (e.g., authentication check) |
| **Migration** | Python files that create/modify database tables automatically |
| **Virtual Environment** | Isolated Python environment to avoid package conflicts |
| **Nginx** | Web server used as reverse proxy in production deployment |
| **Docker** | Tool that packages the app into containers for easy deployment |
| **GST** | Goods and Services Tax — 18% tax on medical services in billing |
| **Vite** | Fast build tool for React — faster than Webpack |
| **Axios** | JavaScript library for making HTTP requests to APIs |
| **Tailwind CSS** | Utility-first CSS framework for rapid UI development |
| **SDLC** | Software Development Life Cycle — stages of software development |

---

## LAST-MINUTE QUICK REVISION

### Project at a Glance
```
Project Name:    DialysisTrack
Type:            Web Application (Full Stack)
Backend:         Django REST Framework (Python)
Frontend:        React.js (JavaScript) + Vite
Database:        MySQL
Authentication:  JWT + 2FA (TOTP)
User Roles:      7 (Admin, Doctor, Nurse, Technician, Receptionist, Patient, Driver)
Modules:         9+ (Dashboard, Patients, Queue, Machines, Sessions, Staff, Billing, Reports, Appointments)
Security:        JWT, 2FA, RBAC, CORS, Password Hashing, Audit Logs
SDLC Model:      Agile (Iterative)
UML Diagrams:    9 diagrams
```

### One-Liner Answers (Quick Fire Round)

| Question | Quick Answer |
|----------|-------------|
| Project name? | DialysisTrack — Dialysis Queue Management System |
| Frontend framework? | React.js with Vite |
| Backend framework? | Django REST Framework |
| Database? | MySQL |
| Authentication? | JWT (JSON Web Tokens) |
| How many roles? | 7 roles |
| How many modules? | 9 main modules |
| What is 2FA? | Two-Factor Authentication using TOTP (Google Authenticator) |
| SDLC model? | Agile / Iterative |
| How frontend talks to backend? | REST API using Axios (HTTP client) |
| What is RBAC? | Role-Based Access Control |
| Bill calculation? | Subtotal + 18% GST - Discount = Total |
| Queue priority levels? | Emergency, Scheduled, Walk-in |
| Machine statuses? | Available, In Use, Maintenance, Cleaning, Out of Service |
| Payment methods? | Cash and UPI |
| Why this project? | Real healthcare problem, covers entire BCA syllabus practically |
| Future scope? | Mobile app, SMS notifications, IoT, AI predictions |
| Deployment? | Docker + Nginx |
| How is password stored? | Hashed using PBKDF2 + SHA256 (never plain text) |
| What makes it unique? | 7 roles + 2FA + real-time queue + Indian billing (GST/UPI) |

---

### Login Credentials for Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dialysis.com | Admin@2026 |
| Doctor | dr.smith@dialysis.com | staff123 |
| Nurse | nurse.wilson@dialysis.com | staff123 |
| Patient | ramesh.patil@email.com | patient123 |

---

**Best of luck for your internal viva! 🎓**

**Last Updated:** April 18, 2026
