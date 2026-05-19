# DialysisTrack — MUST-KNOW Compulsory Questions

### BCA Semester 6 | Tilak Maharashtra Vidyapeeth | 60 Marks External
### These questions are asked in EVERY viva — prepare these FIRST

---

> **How to use this file:**
> - Questions marked with **[100% ASKED]** — Examiner will DEFINITELY ask this. No escape.
> - Questions marked with **[90% ASKED]** — Almost always asked. Very high chance.
> - Questions marked with **[80% ASKED]** — Frequently asked. Be ready.
> - Each answer is SHORT and SIMPLE — speak exactly like this in the viva.

---

## PART 1: PROJECT INTRODUCTION (Examiner asks this FIRST — 100% guaranteed)

---

### 1. What is your project? Explain in brief. [100% ASKED]

**Answer (speak this):**

"Sir/Madam, my project is called **DialysisTrack**. It is a **web-based management system** built for **I Care Dialysis Centre** in Pune. The centre treats kidney failure patients who need dialysis 2-3 times per week.

Earlier they used paper registers and Excel for everything — patient records, appointments, billing. This caused problems like machine double-booking, billing errors, and no real-time visibility.

My system solves all these problems. It has **9 modules** — Patient Registration, Appointments, Session Queue, Machines, Billing, Staff, Ambulance Tracking, Clinical Data, and Reports. It supports **6 user roles** — Admin, Doctor, Nurse, Technician, Receptionist, and Patient — each with different permissions."

---

### 2. What technology did you use? [100% ASKED]

**Answer (speak this):**

"For **frontend** I used **React.js** with Vite as the build tool. For **backend** I used **Python Django** with Django REST Framework for building APIs. The **database** is **MySQL**. For authentication I used **JWT (JSON Web Tokens)**. For real-time ambulance GPS tracking I used **WebSocket** with Django Channels. For payments I integrated **Razorpay** and **UPI QR code**. For deployment I used **Docker** with **Nginx** as reverse proxy."

---

### 3. Why did you choose this project / What problem does it solve? [100% ASKED]

**Answer (speak this):**

"The dialysis centre had 5 major problems:

1. **Machine double-booking** — same machine assigned to 2 patients because Excel has no conflict check.
2. **Billing errors** — manual GST calculation caused mistakes.
3. **No real-time dashboard** — staff had to physically walk to the floor to check session status.
4. **Paper records** — patient history was in physical files, hard to find and no security.
5. **No ambulance tracking** — drivers were contacted via WhatsApp calls.

My system automates all of this with a single centralised database."

---

## PART 2: TECHNOLOGY QUESTIONS (Examiner ALWAYS asks 3-4 from these)

---

### 4. What is Django? Why did you use it? [100% ASKED]

**Answer:**

"Django is a **high-level Python web framework** that follows the **MVT pattern** (Model-View-Template). I used it because:
- It has a **built-in ORM** — I write Python, it generates SQL automatically.
- **Built-in admin panel** for managing data.
- **Strong security** — protects against SQL injection, CSRF, XSS by default.
- **Django REST Framework** makes building APIs very easy.
- It is used by big companies like Instagram and Pinterest."

---

### 5. What is React.js? Why did you use it? [100% ASKED]

**Answer:**

"React is a **JavaScript library** by Meta (Facebook) for building user interfaces. I used it because:
- **Component-based** — each part of UI is a reusable component.
- Creates a **Single Page Application (SPA)** — page does not reload on navigation, only content changes.
- Uses **Virtual DOM** — only updates what changed, making it fast.
- Huge community and ecosystem."

---

### 6. What is REST API? [90% ASKED]

**Answer:**

"REST API is a way for frontend and backend to communicate using HTTP methods:
- **GET** — Fetch data (e.g., get patient list)
- **POST** — Create new data (e.g., register patient)
- **PUT** — Update existing data (e.g., edit patient)
- **DELETE** — Remove data

In my project, React sends requests to Django API using **Axios** library. Data is exchanged in **JSON format**. Every request carries a **JWT token** for authentication."

---

### 7. What is JWT? How does authentication work? [90% ASKED]

**Answer:**

"JWT stands for **JSON Web Token**. It is a stateless authentication method — the server does not store session data.

When user logs in:
1. Backend verifies email + password.
2. Returns an **Access Token** (valid 30 mins) and a **Refresh Token** (valid 1 day).
3. Frontend sends the Access Token in every API request header.
4. When Access Token expires, the Refresh Token is used to get a new one automatically.
5. If Refresh Token also expires, user is logged out.

This is called **stateless** because the server does not store any session — the token itself contains the user's information."

---

### 8. What database did you use? Why MySQL? [90% ASKED]

**Answer:**

"I used **MySQL 8.0** as the production database and **SQLite** for development.

I chose MySQL because:
- It is **open-source** and free.
- It supports **ACID transactions** — ensures data integrity for billing.
- It handles **concurrent users** well — multiple staff accessing the system at the same time.
- It uses `utf8mb4` character set for full Unicode support.
- Time zone is set to **Asia/Kolkata** for accurate Indian timestamps."

---

## PART 3: FEATURES & MODULES (Examiner picks 2-3 features and asks deeply)

---

### 9. How does appointment booking work? How do you prevent double-booking? [90% ASKED]

**Answer:**

"When a receptionist books an appointment:
1. She selects patient, machine, date, and time.
2. The backend **queries the database** for any existing booking on the same machine with overlapping time.
3. If overlap found → **400 error** — booking rejected with message 'Machine already booked'.
4. If no overlap → appointment is confirmed and saved.

This validation happens on the **server side**, not frontend — so nobody can bypass it. This makes double-booking **technically impossible**."

---

### 10. How does billing work? [80% ASKED]

**Answer:**

"Billing is **automatic**. When a session is marked 'Completed', the system auto-generates a bill:

```
Subtotal = Session Cost + Medicine + Consultation + Other Charges
GST = Subtotal x 18%
Total = Subtotal + GST
```

If patient is **emergency**, a **20% surcharge** is added.

Payment options: **Cash**, **UPI QR code** (patient scans with Google Pay), or **Razorpay** (cards/net banking)."

---

### 11. Explain the ambulance GPS tracking feature. [80% ASKED]

**Answer:**

"1. Receptionist dispatches an ambulance for a patient.
2. Driver opens the app on his phone.
3. His phone sends **GPS coordinates** (latitude, longitude) to the server via **WebSocket** — a real-time, always-open connection.
4. On the admin screen, **Google Maps** shows the ambulance's live location with a moving marker.
5. Ride status goes through: Assigned → En Route → Arrived → Completed.
6. If WebSocket fails, it **falls back to HTTP polling** (checks every 3 seconds)."

---

### 12. What is RBAC? How many roles? [80% ASKED]

**Answer:**

"RBAC means **Role-Based Access Control** — different users have different permissions.

My system has **6 roles**: Admin (full access), Doctor (patients + prescriptions), Nurse (queue + vitals), Technician (machines + sessions), Receptionist (registration + billing + appointments), Patient (own data only).

Permissions are enforced at **two levels**:
1. **Frontend** — sidebar shows only allowed menu items.
2. **Backend** — every API endpoint checks the role, returns **403 Forbidden** if not allowed."

---

## PART 4: DATABASE & DESIGN (Examiner asks 2-3 from these)

---

### 13. What is ER Diagram? Name the entities in your project. [90% ASKED]

**Answer:**

"ER Diagram shows the **entities** (tables), their **attributes** (columns), and **relationships** between them.

Main entities: **User**, **Patient**, **Appointment**, **Queue**, **DialysisSession**, **Bill**, **Payment**, **DialysisMachine**, **Ambulance**, **AmbulanceRide**, **DialysisPrescription**, **LabResult**, **Notification**.

Key relationships:
- One Patient → Many Appointments (One-to-Many)
- One Patient → Many Bills (One-to-Many)
- One User → One Patient Profile (One-to-One)
- One Ambulance → Many Rides (One-to-Many)"

---

### 14. What is Primary Key and Foreign Key? Give example from your project. [100% ASKED]

**Answer:**

"**Primary Key** — uniquely identifies each row. In my `patients_patient` table, `id` is the primary key. Also, `patient_id` (like P-001, P-002) is a unique identifier.

**Foreign Key** — a column in one table that refers to the primary key of another table. It creates a link between tables.

Example: In the `billing_bill` table, `patient_id` is a **Foreign Key** pointing to `patients_patient.id`. This means every bill is linked to a specific patient."

---

### 15. What is Normalization? What normal form is your database? [90% ASKED]

**Answer:**

"Normalization is organising database tables to **reduce data redundancy** (duplicate data).

My database is in **Third Normal Form (3NF)**:
- **1NF** — No repeating groups. Each column has atomic (single) values.
- **2NF** — No partial dependency. Every non-key column depends on the full primary key.
- **3NF** — No transitive dependency. Non-key columns do not depend on other non-key columns.

Example: Patient's address is stored in the `patients_patient` table, not repeated in the `billing_bill` table. The bill just links to the patient via a foreign key."

---

### 16. What UML diagrams did you draw? [80% ASKED]

**Answer:**

"I drew **9 UML diagrams**:
1. **Use Case Diagram** — shows actors and their functions
2. **Class Diagram** — shows model classes and relationships
3. **Sequence Diagram** — shows step-by-step appointment booking flow
4. **Activity Diagram** — shows session lifecycle from arrival to payment
5. **Statechart Diagram** — shows machine states (Available → In Use → Maintenance)
6. **Collaboration Diagram** — shows billing generation workflow
7. **Component Diagram** — shows software components (React, Django, Nginx, MySQL)
8. **Deployment Diagram** — shows Docker containers on the server
9. **Data Flow Diagram** — shows data movement between users and system"

---

## PART 5: TESTING & SECURITY (Always asked — at least 1-2 questions)

---

### 17. What types of testing did you perform? [90% ASKED]

**Answer:**

"I performed **5 types**:
1. **Unit Testing** — tested individual functions (GST calculation, conflict validator).
2. **Integration Testing** — tested API endpoints together (appointment → billing flow).
3. **System Testing** — tested complete workflows end-to-end.
4. **Security Testing** — tested JWT tampering, SQL injection, role escalation.
5. **User Acceptance Testing** — the client (Miss Varsha Pote) tested the system.

Total **25 formal test cases** — all passed."

---

### 18. How do you prevent SQL Injection? [80% ASKED]

**Answer:**

"I use **Django ORM** which automatically uses **parameterised queries**. Even if someone enters malicious SQL like `' OR 1=1; DROP TABLE --` in a form field, Django treats it as a **plain text string**, not as SQL code. It never gets executed as a query. I also tested this during security testing — all injection payloads were stored as harmless strings."

---

### 19. What security features does your project have? [80% ASKED]

**Answer:**

"My project has:
- **JWT authentication** with access + refresh tokens
- **Two-Factor Authentication (2FA)** for all staff using Google Authenticator
- **Role-Based Access Control** — 6 roles with enforced permissions
- **Password hashing** — Django uses PBKDF2 with SHA256, never stores plain text
- **SQL Injection prevention** — ORM uses parameterised queries
- **CORS protection** — only allowed frontend origins
- **HTTPS** in production via Nginx SSL
- **CSRF protection** middleware
- **Environment variables** — secrets stored in `.env`, not in code"

---

## PART 6: SOFTWARE ENGINEERING (Theory questions — always asked)

---

### 20. What SDLC model did you follow? [90% ASKED]

**Answer:**

"I followed the **Waterfall Model**:
1. **Requirement Gathering** — interviewed the client, observed operations.
2. **System Analysis** — created ER Diagram, DFD, FDD.
3. **System Design** — designed database, UML diagrams, input/output screens.
4. **Implementation** — coded backend (Django) and frontend (React).
5. **Testing** — unit, integration, system, security, UAT.
6. **Deployment** — Docker containers on cloud server."

---

### 21. What is the feasibility study? [80% ASKED]

**Answer:**

"Feasibility study checks if the project is possible before starting.

- **Technical Feasibility** — All tools (Django, React, MySQL) are open-source, well-documented, and we had prior Python/JS knowledge. **Result: Feasible.**
- **Economic Feasibility** — All software is free. Only cost is hosting (Rs.800-2500/month). Much cheaper than commercial hospital software. **Result: Feasible.**
- **Operational Feasibility** — Simple role-based interface. Works on tablets for nurses. Minimal training needed. **Result: Feasible.**"

---

### 22. What is the difference between existing system and proposed system? [80% ASKED]

**Answer:**

| Existing (Manual) | Proposed (DialysisTrack) |
|-------------------|-------------------------|
| Paper files | MySQL database |
| Excel appointments | Auto-conflict detection |
| Manual billing calculator | Auto-bill with GST on session completion |
| Cash only | Cash + UPI QR + Razorpay |
| WhatsApp for ambulance | GPS tracking on Google Maps |
| No access control | JWT + RBAC with 6 roles |
| No reports | Auto-generated analytics dashboard |

---

## PART 7: QUICK THEORY (Examiner often asks 1-2 as rapid fire)

---

### 23. MVC vs MVT? [80% ASKED]

**Answer:**

"**MVC** (Model-View-Controller) — used by Laravel, Spring.
**MVT** (Model-View-Template) — used by Django.
- **Model** = database tables
- **View** = business logic (in MVC this is the Controller)
- **Template** = HTML page (in MVC this is the View)

In my project, I don't use Django templates because my frontend is React SPA. Django acts purely as a REST API backend."

---

### 24. What is the difference between SQL and MySQL? [80% ASKED]

**Answer:**

"**SQL** is a **language** (Structured Query Language) used to interact with databases — SELECT, INSERT, UPDATE, DELETE. **MySQL** is a **software** (Database Management System) that stores data and understands SQL commands. MySQL is one of many DBMS — others include PostgreSQL, Oracle, SQL Server."

---

### 25. What is the difference between Authentication and Authorization? [80% ASKED]

**Answer:**

"**Authentication** = 'Who are you?' — Login with email + password. Proves your identity.
**Authorization** = 'What can you do?' — A Nurse can record vitals but cannot delete a patient.

In my project: **JWT handles authentication**, **RBAC handles authorization**."

---

## FINAL TIP: How to Answer in Viva

> 1. **Start with a one-line definition.** "JWT stands for JSON Web Token. It is used for stateless authentication."
> 2. **Then explain your project's usage.** "In my project, when a user logs in, the server returns an Access Token and Refresh Token..."
> 3. **Give a real example.** "For example, when the receptionist opens the Patients page, the Access Token is sent in the header of the GET request."
> 4. **If you don't know something**, say: "I have not implemented this specific feature, but I understand the concept..." — Then explain whatever you know. NEVER stay silent.
> 5. **Be confident.** You built this project — you know it best.

---

## ORDER OF PREPARATION (Study in this order)

| Priority | Questions | Time Needed |
|----------|-----------|-------------|
| **Do FIRST** | Q1, Q2, Q3 (Project intro) | 15 mins |
| **Do SECOND** | Q4, Q5, Q6, Q7, Q8 (Tech stack) | 20 mins |
| **Do THIRD** | Q9, Q10, Q11, Q12 (Features) | 20 mins |
| **Do FOURTH** | Q13, Q14, Q15, Q16 (Database & Design) | 15 mins |
| **Do FIFTH** | Q17, Q18, Q19 (Testing & Security) | 15 mins |
| **Do LAST** | Q20, Q21, Q22, Q23, Q24, Q25 (Theory) | 15 mins |
| **TOTAL** | **25 must-know questions** | **~2 hours** |

---

*Good luck! You built a full-stack healthcare application with real-time GPS, payment gateway, 2FA, and RBAC — that is impressive for a BCA project. Be proud and speak with confidence.*

---

*Prepared for: BCA Semester 6 External Viva — Tilak Maharashtra Vidyapeeth, Pune*
*Project: DialysisTrack — Dialysis Centre Management System*
