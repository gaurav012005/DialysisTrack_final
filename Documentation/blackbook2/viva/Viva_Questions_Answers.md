# DialysisTrack — External Viva Questions & Answers

### BCA Semester 6 | Tilak Maharashtra Vidyapeeth | 60 Marks External

---

## Q1. What is your project? Explain it in brief.

**Answer:**

My project is called **DialysisTrack**. It is a web-based management system built for **I Care Dialysis Centre**, Pune. The centre treats patients with kidney failure who need regular dialysis treatment.

The system replaces the old paper-based registers and Excel sheets used by the centre. It manages **9 main modules** — Patient Registration, Appointment Scheduling, Dialysis Session Queue, Machine Inventory, Billing with UPI/Razorpay, Staff Management, Ambulance Fleet Tracking, Clinical Data, and Reports.

It supports **6 user roles** — Admin, Doctor, Nurse, Technician, Receptionist, and Patient — each with their own dashboard and permissions.

---

## Q2. Why did you choose this project? What problems does it solve?

**Answer:**

The dialysis centre was facing major problems with their manual system:

- **Machine double-booking** — Two patients were assigned to the same machine at the same time because Excel had no conflict checking.
- **Billing errors** — Staff had to manually calculate GST and charges after every session, leading to mistakes.
- **No real-time visibility** — There was no live dashboard showing which sessions were running and which machines were free.
- **Paper records** — Patient medical files were stored in physical cabinets, making it hard to find or review patient history quickly.
- **No ambulance tracking** — Drivers were contacted via WhatsApp with no formal tracking.

DialysisTrack solves all of these problems through automation and a centralised database.

---

## Q3. What technology stack (tools and languages) have you used?

**Answer:**

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 18, Vite (build tool), Axios, React Router v6 |
| **Backend** | Python 3.10+, Django 4.2, Django REST Framework |
| **Database** | MySQL 8.0 (production), SQLite (development) |
| **Authentication** | JWT (JSON Web Tokens) using `djangorestframework-simplejwt` |
| **Real-time GPS** | Django Channels + WebSocket (Daphne ASGI server) |
| **Payments** | Razorpay API + UPI QR Code generation |
| **Maps** | Google Maps JavaScript API |
| **Deployment** | Docker + Docker Compose + Nginx reverse proxy |

---

## Q4. What is Django? Why did you use Django instead of other frameworks?

**Answer:**

Django is a **high-level Python web framework** that follows the **MVT (Model-View-Template)** pattern. I used Django because:

- It has a **built-in ORM** — I can write Python classes (models) and Django automatically creates the database tables. No need to write raw SQL.
- It provides a **built-in admin panel** — useful for super admins to manage data directly.
- It has **strong security** — automatic protection against SQL Injection, CSRF, and XSS attacks.
- **Django REST Framework (DRF)** makes it easy to build REST APIs for the React frontend to consume.
- It is **mature and well-documented** — used by Instagram, Pinterest, etc.

---

## Q5. What is React.js? Why did you use it for the frontend?

**Answer:**

React.js is a **JavaScript library** developed by Meta (Facebook) for building **user interfaces**. I used React because:

- It uses a **component-based architecture** — each part of the UI (sidebar, patient form, billing table) is a reusable component.
- It creates a **Single Page Application (SPA)** — the page does not reload when navigating; only the content area changes, making it fast.
- It uses **Virtual DOM** — React compares changes and updates only the parts that changed, giving better performance.
- **React Router** handles client-side navigation without full page refreshes.
- **Vite** is used as the build tool — it gives fast hot-module replacement during development.

---

## Q6. What is REST API? How does the frontend communicate with the backend?

**Answer:**

REST (Representational State Transfer) API is a way for the frontend and backend to communicate over HTTP using standard methods:

| Method | Purpose | Example |
|--------|---------|---------|
| **GET** | Fetch data | `GET /api/patients/` — Get all patients |
| **POST** | Create new data | `POST /api/patients/` — Register a new patient |
| **PUT** | Update data | `PUT /api/patients/5/` — Update patient with ID 5 |
| **DELETE** | Delete data | `DELETE /api/patients/5/` — Remove patient |

The React frontend sends HTTP requests using **Axios** library to the Django REST API. Data is exchanged in **JSON format**. Every request includes a **JWT token** in the header for authentication.

---

## Q7. What is JWT? How does authentication work in your project?

**Answer:**

JWT stands for **JSON Web Token**. It is a secure way to authenticate users without storing sessions on the server.

**How it works in DialysisTrack:**

1. User enters email and password on the Login page.
2. The backend validates the credentials and returns two tokens:
   - **Access Token** (short-lived, ~30 minutes) — used for API requests.
   - **Refresh Token** (long-lived, ~1 day) — used to get a new access token when it expires.
3. The frontend stores these tokens and attaches the Access Token in the `Authorization` header of every API request.
4. If the Access Token expires, Axios **interceptors** automatically use the Refresh Token to get a new one.
5. If the Refresh Token also expires, the user is logged out.

This is **stateless authentication** — the server does not need to store any session data.

---

## Q8. What is RBAC? How many roles are there in your system?

**Answer:**

RBAC stands for **Role-Based Access Control**. It means different users see different menus, pages, and have different permissions based on their role.

My system has **6 roles**:

| Role | What they can do |
|------|-----------------|
| **Admin** | Full access to all 9 modules, staff management, Django admin |
| **Doctor** | View patients, write prescriptions, enter lab results |
| **Nurse** | Manage queue, record vital signs during sessions |
| **Technician** | Manage machines, start/complete sessions |
| **Receptionist** | Register patients, book appointments, process billing |
| **Patient** | View own appointments, bills, and medical history |

Permissions are enforced at **two levels**:
1. **Frontend** — The sidebar dynamically shows only the menu items allowed for the logged-in role.
2. **Backend** — Every API endpoint checks the user's role and returns **403 Forbidden** if they don't have permission.

---

## Q9. Explain the database design. How many tables are there?

**Answer:**

The database uses **MySQL 8.0** and is designed in **normalized form** (3NF) to avoid data duplication.

Major tables include:

| Table | Purpose |
|-------|---------|
| `users_user` | Stores all user accounts (admin, doctor, patient, etc.) |
| `patients_patient` | Patient demographics, infection status, consent |
| `appointments_appointment` | Appointment date, time, machine, doctor |
| `dialysis_queue_queue` | Daily session queue with priority and vitals |
| `billing_bill` | Auto-generated invoices with GST |
| `billing_payment` | Individual payment records (Cash/UPI) |
| `machines_dialysismachine` | Machine inventory and status |
| `fleet_ambulance` | Ambulance vehicle details |
| `fleet_ambulanceride` | Dispatch records with GPS lat/lng |
| `patients_dialysisprescription` | Doctor-defined treatment parameters |
| `patients_labresult` | Lab test results with Kt/V and URR |
| `notifications_notification` | Real-time user notifications |

All tables are linked using **Foreign Keys**. For example, `patients_patient.user_id` is a foreign key to `users_user.id`.

---

## Q10. What is the appointment conflict detection? How does it prevent double-booking?

**Answer:**

This is one of the most important features. When a receptionist tries to book an appointment:

1. She selects a **patient**, **machine**, **date**, and **time slot**.
2. The backend **queries the database** for any existing appointment on the same machine, same date, with overlapping times.
3. If any overlap is found → the system **rejects the booking** and returns a **400 Bad Request** error with a message saying "Machine already booked for this time."
4. If no overlap → the appointment is **confirmed and saved**.

This validation happens on the **server side** (not just frontend), so it cannot be bypassed. This makes **double-booking technically impossible**.

---

## Q11. How does billing work? What is GST calculation?

**Answer:**

Billing in DialysisTrack is **automatic**. When a nurse or technician marks a dialysis session as "Completed," the system auto-generates a bill.

**Bill calculation:**

```
Subtotal = Session Cost + Medicine Cost + Consultation Fee + Other Charges
GST (Tax) = Subtotal x 18%
Total = Subtotal + GST
```

Example:
- Session Cost = Rs.2,500
- Consultation = Rs.500
- Subtotal = Rs.3,000
- GST at 18% = Rs.540
- **Total = Rs.3,540**

If the patient is marked as **Emergency**, an extra **20% surcharge** is added.

**Payment options:**
- **Cash** — Receptionist marks payment as received.
- **UPI** — System generates a **QR code** that the patient can scan with Google Pay, PhonePe, etc.
- **Online** — Integrated with **Razorpay** gateway for card/net banking payments.

---

## Q12. Explain the ambulance GPS tracking feature.

**Answer:**

DialysisTrack has a fleet management module for the centre's ambulance service:

1. **Receptionist dispatches** an ambulance for a patient from the system.
2. The **driver receives a notification** and opens the Driver Dashboard on his phone.
3. The driver's device sends **GPS coordinates** (latitude and longitude) to the server.
4. These coordinates are sent in **real-time using WebSocket** (Django Channels).
5. On the admin/receptionist screen, a **Google Maps** view shows the ambulance's **live location** with a moving marker.
6. The ride status transitions through: **Assigned → En Route → Arrived → Completed**.

If WebSocket fails (e.g., poor connectivity), the system **falls back to HTTP polling** — it checks the location every 3 seconds via normal API calls.

---

## Q13. What is WebSocket? How is it different from HTTP?

**Answer:**

| Feature | HTTP | WebSocket |
|---------|------|-----------|
| **Connection** | Opens and closes for each request | Stays open continuously |
| **Direction** | One-way: Client asks, server responds | Two-way: Both can send data anytime |
| **Use case** | Normal page loads, form submissions | Real-time data like GPS tracking, chat |
| **In our project** | Patient registration, billing | Ambulance live location updates |

I used **Django Channels** with the **Daphne ASGI server** to handle WebSocket connections. The driver's phone opens a WebSocket connection, and every GPS update is pushed to all connected tracking screens instantly.

---

## Q14. What is the difference between WSGI and ASGI?

**Answer:**

- **WSGI (Web Server Gateway Interface)** — Handles normal HTTP requests (synchronous, one request at a time per worker). Django normally runs on WSGI using **Gunicorn**.
- **ASGI (Asynchronous Server Gateway Interface)** — Handles both HTTP and WebSocket connections (asynchronous, can handle many connections simultaneously). Django Channels runs on ASGI using **Daphne**.

In DialysisTrack:
- Normal API requests (patient registration, billing, login) go through **WSGI (Gunicorn)**.
- GPS real-time tracking uses **ASGI (Daphne)** for WebSocket connections.
- **Nginx** routes the requests to the correct server based on the URL path.

---

## Q15. What is Django ORM? How does it work?

**Answer:**

ORM stands for **Object-Relational Mapping**. It lets me write Python code instead of raw SQL queries.

**Example:**

Instead of writing SQL:
```sql
SELECT * FROM patients_patient WHERE is_active = TRUE;
```

I write Python:
```python
Patient.objects.filter(is_active=True)
```

Django ORM converts this Python code into SQL behind the scenes. Benefits:
- **No raw SQL** — Prevents SQL Injection attacks automatically.
- **Database-agnostic** — Same code works with MySQL, SQLite, PostgreSQL.
- **Migrations** — When I change a model, `python manage.py makemigrations` auto-generates the SQL to update the database schema.

---

## Q16. What UML diagrams have you drawn? Name and explain any two.

**Answer:**

I have drawn **9 UML diagrams**: Use Case, Class, Sequence, Activity, Statechart, Collaboration, Component, Deployment, and Data Flow Diagram.

**1. Use Case Diagram:**
Shows all actors (Admin, Doctor, Nurse, Technician, Receptionist, Patient, Driver) and the functions they can perform. For example, "Receptionist → Book Appointment", "Nurse → Record Vitals", "Patient → View Bills".

**2. Sequence Diagram:**
Shows the step-by-step flow of the Appointment Booking process:
- Receptionist submits booking request → React sends POST to Django API → JWT middleware validates token → System checks machine availability → System checks doctor availability → If both OK, appointment saved → Success response sent back.

---

## Q17. What testing have you performed? Name the types.

**Answer:**

I performed **5 types of testing**:

| Testing Type | What was tested |
|-------------|----------------|
| **Unit Testing** | Individual functions — GST calculation, patient ID generation, conflict validator |
| **Integration Testing** | API endpoints — appointment creation, session-to-billing flow, role permissions |
| **System Testing** | Full end-to-end workflow — patient registration to payment completion |
| **Security Testing** | JWT tampering, SQL injection, role escalation, CORS validation |
| **User Acceptance Testing** | Client (Miss Varsha Pote) tested the system for real-world usability |

Total **25 formal test cases** were documented — all passed successfully.

---

## Q18. How do you prevent SQL Injection in your project?

**Answer:**

SQL Injection is prevented automatically because I use **Django ORM** which uses **parameterised queries** internally.

For example, even if a user enters malicious input like:
```
' OR 1=1; DROP TABLE patients_patient; --
```

Django treats it as a **plain text string**, not as SQL code. The input is stored harmlessly in the database.

I also tested this during **Security Testing** — all SQL injection payloads were stored as literal strings, and no database query was executed.

---

## Q19. What is the feasibility study? Explain the three types.

**Answer:**

A feasibility study checks whether a project is possible and practical before starting development.

**1. Technical Feasibility:**
All technologies used (Django, React, MySQL) are open-source, well-documented, and widely used. The team had prior Python and JavaScript knowledge. No specialised hardware is needed. **Result: Technically feasible.**

**2. Economic Feasibility:**
All software is free (open-source). The only cost is cloud hosting (Rs.800-2,500/month). This is much cheaper than buying commercial hospital software that charges per-user license fees. **Result: Economically feasible.**

**3. Operational Feasibility:**
The interface is designed to be simple — each role sees only their relevant features. The system is accessible from any browser, and the tablet-friendly design means nurses can use it while standing at the bedside. **Result: Operationally feasible.**

---

## Q20. What is the SDLC model you followed?

**Answer:**

We followed the **Waterfall Model** with some elements of the **Iterative Model**:

1. **Requirement Gathering** — Interviewed Miss Varsha Pote (Senior Technician), observed centre operations, distributed questionnaires.
2. **System Analysis** — Created ER Diagram, DFD, FDD; identified data entities.
3. **System Design** — Designed database tables, UML diagrams, input/output screens.
4. **Implementation** — Coded backend (Django) and frontend (React) simultaneously.
5. **Testing** — Unit, Integration, System, Security, and UAT testing.
6. **Deployment** — Docker containers with Nginx, deployed on cloud VM.

---

## Q21. What is the difference between your existing system and proposed system?

**Answer:**

| Feature | Existing System (Manual) | Proposed System (DialysisTrack) |
|---------|-------------------------|-------------------------------|
| Patient Records | Paper files in cabinet | Centralised MySQL database |
| Appointments | Wall calendar + Excel | Auto-conflict detection system |
| Billing | Manual calculator + accounting software | Auto-bill on session completion with GST |
| Payments | Cash only | Cash + UPI QR + Razorpay online |
| Ambulance | WhatsApp + phone calls | Real-time GPS tracking on Google Maps |
| Access Control | No restriction, anyone can read files | Role-based access with JWT authentication |
| Reports | Manual counting | Auto-generated analytics dashboard |

---

## Q22. What are the future enhancements you have planned?

**Answer:**

- **Direct Machine Integration** — Connect dialysis machines via HL7/FHIR protocols to auto-capture vitals instead of manual entry.
- **Biometric Login** — Fingerprint/facial recognition for quick staff authentication.
- **Inventory Management** — Track dialyzer, tubing, and heparin stock; auto-deduct on session completion.
- **Predictive Analytics** — Use machine learning on patient data to predict complications like intradialytic hypotension.
- **Multi-Branch Support** — Upgrade architecture to support multiple dialysis centres from one system.
- **IoT Monitoring** — Integrate temperature/humidity sensors for facility environment monitoring.

---

## Q23. What is Docker? Why did you use it for deployment?

**Answer:**

Docker is a **containerisation platform** that packages an application with all its dependencies into a single container.

**Why I used Docker:**
- **Consistency** — The same container runs identically on my laptop and on the production server. No "it works on my machine" problem.
- **Isolation** — Each service (Django, Nginx, MySQL, Redis) runs in its own container.
- **Easy Deployment** — One command `docker-compose up` starts the entire application.
- **Scalability** — I can scale individual services independently.

**My Docker Compose setup has 5 containers:**
1. Nginx (reverse proxy + static file server)
2. Django Backend (Gunicorn WSGI)
3. Django Channels (Daphne ASGI)
4. MySQL Database
5. Redis (message broker for WebSocket channels)

---

## Q24. What is the clinical data management module? What is Kt/V?

**Answer:**

The Clinical Data module manages three critical aspects:

1. **Infection Screening** — Records Hepatitis B, Hepatitis C, and HIV status for every patient. If Hep B is positive, the patient is flagged to use a **dedicated/isolated machine** (infection safety rule). If screening is older than 90 days, the system auto-flags it as overdue.

2. **Dialysis Prescription** — Doctor defines treatment parameters: session duration (3-5 hours), blood flow rate, dialysate composition, heparin dose, target dry weight.

3. **Lab Results** — Records monthly blood tests.

**Kt/V** is the **most important metric** for dialysis adequacy:
- **K** = Dialyzer clearance
- **t** = Treatment time
- **V** = Patient's body fluid volume
- **Target Kt/V >= 1.2** means dialysis is effective.
- The system **auto-calculates** Kt/V from pre and post-dialysis BUN (Blood Urea Nitrogen) values using the **Daugirdas formula**.

**URR (Urea Reduction Ratio)** is another metric:
```
URR = (Pre BUN - Post BUN) / Pre BUN x 100
Target: >=65%
```

---

## Q25. How do you run the project? Explain the steps.

**Answer:**

**Step 1: Start the Backend**
```bash
cd backend
python manage.py runserver
```
This starts the Django server on `http://localhost:8000`.

**Step 2: Start the Frontend**
```bash
cd frontend
npm run dev
```
This starts the React development server on `http://localhost:3000`.

**Step 3: Create Test Users (first time only)**
```bash
cd backend
python testing/create_test_users.py
```

**Step 4: Access the Application**
- Open browser and go to `http://localhost:3000`
- Login with test credentials:
  - Admin: `admin@test.com` / `admin123`
  - Patient: `patient@test.com` / `patient123`
  - Receptionist: `receptionist@test.com` / `reception123`

**For Production:**
```bash
docker-compose up -d
```
This starts all 5 containers (Nginx, Django, Daphne, MySQL, Redis) in the background.

---

## Q26. How much AI did you use in this project?

**Answer:**

I used AI (like ChatGPT and GitHub Copilot) as a **productivity tool and coding assistant**, but the **core architecture, database design, and business logic were entirely designed by me**.

Specifically, I used AI for:
1. **Generating boilerplate code** — For example, writing repetitive React components or basic Django models quickly.
2. **Debugging errors** — If I got a tricky React state error or a Django database constraint error, I used AI to help trace the root cause.
3. **Understanding documentation** — To quickly learn how to implement Razorpay API or configure WebSocket with Daphne.
4. **Writing dummy data** — Generating the `setup_database.py` script to populate the database with fake patient names and appointments for testing.

The system's logic—like the appointment conflict detection, the RBAC role permissions, and the clinical metrics (Kt/V) formulas—were all implemented based on my own system design and the requirements gathered from the client. Using AI allowed me to build a much larger, production-ready system in a single semester.

---

## Q27. Explain the file structure of your project. Which files do what?

**Answer:**

The project is divided into two main folders: **frontend** (React) and **backend** (Django).

**Backend Structure (Django):**
- `backend/manage.py` — The main entry point to run the server, make migrations, and run commands.
- `backend/backend/settings.py` — Contains all core configurations (database connection, JWT settings, installed apps).
- `backend/backend/urls.py` — The main router that directs API endpoints to the right apps.
- **Apps** (`users/`, `patients/`, `machines/`, `billing/`, etc.):
  - `models.py` — Defines the database tables (e.g., Patient, Machine, Bill).
  - `views.py` — Contains the business logic and API endpoints (e.g., `dispatch_ambulance`, `login_view`).
  - `serializers.py` — Converts Python objects to JSON and vice-versa.

**Frontend Structure (React):**
- `frontend/package.json` — Lists all dependencies (React, Tailwind, Axios) and scripts to run the app (`npm run dev`).
- `frontend/src/main.jsx` — The entry point of the React app that renders the application into the browser DOM.
- `frontend/src/AppRouter.jsx` — Handles the routing, linking URLs like `/patients` to the right page component.
- `frontend/src/pages/` — Contains full-page components like `Dashboard.jsx`, `Patients.jsx`, `BillingPage.jsx`.
- `frontend/src/components/` — Contains reusable UI pieces like `Navbar.jsx`, `Sidebar.jsx`, `RoleGuard.jsx`.
- `frontend/src/context/AuthContext.jsx` — Manages the user's login state globally.

---

## Q28. How will you introduce this project smartly to the examiner?

**Answer:**

*(Pitch this confidently in 45-60 seconds):*

"Good morning sir/madam. My project is **DialysisTrack**, a complete hospital management system custom-built for 'I Care Dialysis Centre'. 

Instead of a generic hospital app, I focused specifically on the **complex workflow of a dialysis unit**. Dialysis isn't like a normal doctor visit; patients come 3 times a week, stay for 4 hours, and require a dedicated machine.

Currently, the centre manages this on whiteboards and Excel, leading to double-booked machines, lost patient consent forms, and manual billing errors.

My system automates this entire lifecycle. It handles everything from **Patient Registration** and **Smart Appointment Booking** (which mathematically prevents machine double-booking), to real-time **Clinical Monitoring**, automated **GST Billing** with UPI, and even live **GPS Tracking of Ambulances**. 

It is built using a modern stack: **React** for the frontend, **Django** for the API backend, and **MySQL** for the database, fully secured with Role-Based Access Control and Two-Factor Authentication."

---

## Q29. Where did you get the idea for this project? Why is your client a Senior Technician instead of the Owner/Doctor?

**Answer:**

**Idea Source:** 
I got the idea when I visited the dialysis centre and saw the chaos at the reception desk. They were trying to figure out which machine was free, while a patient was waiting, and a nurse was searching through a massive physical file cabinet for a patient's recent HIV/Hepatitis blood report. I realized that a specialized digital system could solve all of this.

**Why the Senior Technician (Miss Varsha Pote) is the client:**
While the owner handles the business finances and the nephrologist handles medical diagnoses, it is the **Senior Technician and the Head Nurse who actually run the daily operations** of the dialysis floor. 

Miss Varsha is the one who schedules the machines, assigns the nurses, manages the queues, and deals with the billing handoffs. Therefore, she understands the **actual operational pain points** better than anyone else. Designing the system based on her requirements ensured that DialysisTrack solves real, on-the-ground problems rather than just high-level administrative ones.

---

## Q30. Explain the full end-to-end workflow of the system (Frontend to Backend).

**Answer:**

Here is the complete journey of a patient through the DialysisTrack system:

1. **Registration (Frontend):** The Receptionist logs in. React (`Login.jsx`) sends credentials to Django (`users/views.py`). Django verifies and returns a JWT. The Receptionist navigates to the Patients page and registers a new patient. Django saves this in the `patients_patient` table.
2. **Booking (Frontend → Backend):** The Receptionist books a session. They select the patient, date, time, and machine. React sends a POST request. Django checks the `appointments_appointment` table to ensure the machine is free. If yes, it saves the booking.
3. **Session Start (Frontend):** The Patient arrives. The Nurse logs in, goes to the Queue dashboard, and clicks "Start Session". The React frontend sends an API call to update the machine status to "In Use". 
4. **Clinical Data (Backend):** During the 4-hour session, the Doctor/Nurse enters the patient's vitals (blood pressure, weight) into the clinical data panel, which is stored in the `patients_dialysisprescription` and `patients_labresult` tables.
5. **Session End & Auto-Billing (Full Stack):** The session ends. The Technician clicks "End Session". 
   - *Backend:* Django marks the machine as 'Available', calculates the session costs (Dialysis fee + Consumables + 18% GST), and automatically generates an invoice in the `billing_bill` table.
6. **Payment (Frontend):** The Receptionist clicks "Pay". React displays a dynamically generated UPI QR Code. The patient scans and pays. Django records the payment in the `billing_payment` table.
7. **Discharge/Ambulance:** If the patient needs transport, the Receptionist clicks 'Dispatch Ambulance'. The driver's phone sends live WebSocket GPS updates to Django Channels, which pushes the live location to the React Maps dashboard so the Receptionist can track the drop-off.

---

## Bonus Quick-Fire Questions (Often Asked)

### B1. What is the difference between SQL and MySQL?
**SQL** is a language (Structured Query Language) used to interact with databases. **MySQL** is a database management system (DBMS) that uses SQL as its query language.

### B2. What is a Primary Key?
A primary key is a column (or combination of columns) that **uniquely identifies** each row in a table. In my project, `patient_id` (like P-001) is the primary key for the patient table.

### B3. What is a Foreign Key?
A foreign key is a column in one table that **refers to the primary key** of another table. Example: `billing_bill.patient_id` refers to `patients_patient.id`, linking each bill to a patient.

### B4. What is Normalization?
Normalization is the process of organising data to **reduce redundancy**. My database is in **3NF (Third Normal Form)** — no repeating groups, no partial dependencies, and no transitive dependencies.

### B5. What is MVC vs MVT?
- **MVC** (Model-View-Controller) — Used by frameworks like Spring, Laravel.
- **MVT** (Model-View-Template) — Used by Django.
  - **Model** = Database structure (tables).
  - **View** = Business logic (processes the request).
  - **Template** = HTML/frontend (what user sees).

In my project, the frontend is React (SPA), so Django acts purely as a REST API backend.

---

> **Tip:** When answering in the viva, always start with a one-line definition, then explain how you used it in DialysisTrack with a real example. This shows practical knowledge and will impress the examiner.

---

*Prepared for: BCA Semester 6 External Viva — Tilak Maharashtra Vidyapeeth, Pune*
*Project: DialysisTrack — Dialysis Centre Management System*
