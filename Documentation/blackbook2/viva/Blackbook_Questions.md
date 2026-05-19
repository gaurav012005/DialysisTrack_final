# DialysisTrack — Blackbook-Specific Questions

### BCA Semester 6 | Tilak Maharashtra Vidyapeeth | 60 Marks External
### Questions the examiner asks DIRECTLY from your Blackbook chapters

---

> **Why this file?**
> The examiner has your printed blackbook in front of them. They will FLIP through chapters and ask questions based on what they SEE — diagrams, tables, screenshots. These questions test whether you actually UNDERSTAND what you wrote. This file covers questions from **all 11 chapters** that were NOT already in the previous 4 viva files.

---

## CHAPTER-WISE COVERAGE CHECK

| Chapter | Topic | Covered in previous files? | Gaps found? |
|---------|-------|---------------------------|-------------|
| Ch 1 — Introduction | Company profile, existing problems | ✅ Yes (Q1, Q2, Q3) | No |
| Ch 2 — Proposed System | Tech stack, HW/SW, feasibility | ✅ Yes (Q3, Q19, Q21) | No |
| Ch 3 — Analysis | ERD symbols, DFD, FDD, Context Diagram | ⚠️ Partial (Q13, Q16) | **YES — DFD levels, FDD, Context Diagram** |
| Ch 4 — System Design | Data dictionary, table design, input/output | ⚠️ Partial (Q9, Q14, Q15) | **YES — Data dictionary, Input/Output design** |
| Ch 5 — Testing | Testing types, test cases | ✅ Yes (Q17, Q18) | No |
| Ch 6 — Output Screens | Screenshots of each module | ⚠️ Not covered | **YES — Explain specific screens** |
| Ch 7 — Implementation | Backend/Frontend procedure | ⚠️ Partial (R1, R2) | **YES — Implementation procedure details** |
| Ch 8 — User Manual | Step-by-step workflows | ⚠️ Not covered | **YES — Workflow walkthroughs** |
| Ch 9 — Future Enhancement | Limitations, future scope | ✅ Yes (Q22, R14) | Minor gap |
| Ch 10 — Conclusion | Summary, outcome | ⚠️ Not covered | **YES — Conclusion statement** |
| Ch 11 — Bibliography | References | ⚠️ Not covered | **YES — What references did you use** |

**Result: 7 gaps found. This file adds 15 questions to close all of them.**

---

## BK1. What is a Data Flow Diagram (DFD)? Explain the levels you drew. [90% ASKED from blackbook]

**Answer:**

"A DFD shows how **data moves** through the system — from users, through processes, into data stores.

I drew **2 levels**:

**Level 0 (Context Diagram):**
- The entire DialysisTrack system is shown as **one single circle** (process) in the centre.
- Around it are **7 external entities** — Receptionist, Doctor, Nurse, Technician, Patient, Driver, Admin.
- Arrows show what data each entity sends IN and receives OUT.
- Example: Receptionist sends 'Patient Registration Data' IN → System sends 'Appointment Confirmation' OUT.

**Level 1 (Detailed DFD):**
- The single circle from Level 0 is **expanded into 8 processes**:
  1. User Authentication
  2. Patient Management
  3. Appointment Scheduling
  4. Queue & Session Management
  5. Billing & Payment
  6. Fleet Management
  7. Clinical Data Management
  8. Reporting & Analytics
- Each process reads from and writes to **data stores** (MySQL tables).
- Example: 'Appointment Scheduling' process reads from the Appointment Store to check conflicts, then writes the confirmed appointment."

---

## BK2. What is a Functional Decomposition Diagram (FDD)? [70% ASKED from blackbook]

**Answer:**

"FDD shows the **breakdown of the system** into smaller modules and sub-functions using a **tree structure**.

At the top level: **DialysisTrack System**

It breaks into **11 modules**:
1. User Management → Registration, Role Assignment, JWT Auth, 2FA, Password Reset
2. Patient Management → Registration (auto ID), Profile, Emergency Flag, Search
3. Appointment Scheduling → Booking + Conflict Detection, Cancellation, Rescheduling
4. Queue Management → Check-In, Start Session, Record Vitals, Complete Session
5. Billing → Auto-Bill, GST Calculation, UPI QR, Razorpay, Cash Payment
6. Machine Inventory → Add/Edit Machine, Status Update, Maintenance Tracking
7. Fleet Management → Ambulance Registration, Dispatch, GPS Tracking via WebSocket
8. Clinical Data → Infection Screening, Prescriptions, Lab Results, Kt/V Calculation
9. Reports → Revenue Report, Session Count, Machine Utilisation
10. Notifications → Real-time alerts for each role
11. Audit & Security → JWT, 2FA, RBAC, Audit Logs

FDD does NOT show data flow — it only shows **what functions exist** in each module."

---

## BK3. What is a Context Diagram? How is it different from DFD Level 1? [80% ASKED from blackbook]

**Answer:**

| Feature | Context Diagram (Level 0) | DFD Level 1 |
|---------|--------------------------|-------------|
| **System shown as** | One single process (big circle) | Multiple processes (8 circles) |
| **Detail level** | Very high level — just inputs/outputs | Shows internal processing logic |
| **Data stores** | Not shown | Shown (MySQL tables) |
| **Purpose** | Shows system boundary — who interacts with the system | Shows how data flows inside the system |

"The Context Diagram is like a **bird's eye view** — you see the entire system as one box. DFD Level 1 **opens that box** and shows the 8 processes inside."

---

## BK4. What is a Data Element Dictionary? Give examples from your project. [70% ASKED from blackbook]

**Answer:**

"A Data Element Dictionary (also called Data Dictionary) defines **every field** in the database — its name, data type, allowed values, whether it is mandatory, and what it means.

Examples from my project:

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|------------|-------------|
| `patient_id` | VARCHAR(20) | Unique, NOT NULL, Auto-generated | Format: P-001, P-002 |
| `hepatitis_b_status` | ENUM | Values: negative, positive, unknown | Triggers isolated machine flag if positive |
| `session_cost` | DECIMAL(10,2) | Default: 2500.00 | Base cost per session in Rupees |
| `tax_amount` | DECIMAL(10,2) | Computed (18% GST) | Auto-calculated, never entered manually |
| `driver_lat` / `driver_lng` | DECIMAL(9,6) | Nullable | GPS coordinates updated via WebSocket |
| `role` | ENUM | 7 values | Controls entire RBAC access |
| `consent_given` | BOOLEAN | Default: FALSE | Sessions cannot start without TRUE |

The Data Dictionary is documented in **Chapter 4** of my blackbook."

---

## BK5. Explain the Input and Output design of your system. [80% ASKED from blackbook]

**Answer:**

"**Input Design** — The forms through which data enters the system:

| Input Screen | Fields | Validation |
|-------------|--------|-----------|
| **Login Form** | Email, Password | Required fields, min 8 chars password |
| **Patient Registration** | Name, DOB, Gender, Blood Type, Diagnosis, Infection Status | Required fields, DOB must be past date |
| **Appointment Booking** | Patient, Machine, Doctor, Date, Time | Server-side conflict check |
| **Vital Signs Form** | BP (systolic/diastolic), Heart Rate, Temperature, Weight | Numeric only, reasonable ranges |
| **Payment Form** | Amount, Payment Method (Cash/UPI) | Amount must match bill total |

**Output Design** — What the system displays back:

| Output Screen | Content |
|--------------|---------|
| **Dashboard** | Metric cards (total patients, sessions today, revenue), charts |
| **Patient List** | Searchable, paginated table with patient code, name, diagnosis |
| **Bill Invoice** | Itemised charges, GST breakdown, total, payment status |
| **Queue Board** | Live status of all sessions (Waiting → In Progress → Completed) |
| **GPS Map** | Google Maps with ambulance marker, updated in real-time |
| **Reports** | Bar charts, pie charts, CSV download |

All input forms have **client-side validation** (React) AND **server-side validation** (Django) — double protection."

---

## BK6. Explain the ERD symbols you used. [70% ASKED from blackbook]

**Answer:**

"In an Entity-Relationship Diagram:

| Symbol | Meaning | Example |
|--------|---------|---------|
| **Rectangle** | Entity (table) | Patient, Bill, Appointment |
| **Ellipse (oval)** | Attribute (field) | first_name, blood_type |
| **Underlined attribute** | Primary Key | patient_id, bill_number |
| **Diamond** | Relationship | 'Books' (Patient Books Appointment) |
| **Lines with 1:N** | Cardinality | One Patient → Many Bills |
| **Double rectangle** | Weak Entity | Entity that depends on parent |

**Cardinality examples in my project:**
- Patient **1:N** Appointment (one patient, many appointments)
- Patient **1:N** Bill (one patient, many bills)
- User **1:1** Patient (one user, one patient profile)
- Ambulance **1:N** AmbulanceRide (one ambulance, many rides)"

---

## BK7. What output screens does your system have? Explain any 3. [80% ASKED from blackbook]

**Answer:**

My system has **15 output screens** documented in Chapter 6. Here are 3:

**1. Admin Dashboard (Fig 6.2):**
Shows metric cards at the top — total active patients, sessions today, machines in use, pending bills. Below that, a real-time activity feed showing recent events (new registrations, session completions, payments). A side panel shows today's appointment schedule in chronological order. This replaces the need for morning floor walkthroughs.

**2. Queue Management Board (Fig 6.6):**
Shows all patients scheduled for today as a live board. Each row has patient name, machine, start time, status, and elapsed time. Technicians click 'Check-In' when patient arrives, 'Start Session' to begin, and nurses click 'Record Vitals' to enter readings. The board auto-refreshes every 30 seconds.

**3. Payment Screen — UPI QR Code (Fig 6.14):**
When receptionist clicks 'Process Payment', the system generates a **dynamic UPI QR code** containing the bill amount and centre's UPI ID. The patient scans it with Google Pay/PhonePe. After payment, receptionist clicks 'Mark as Paid' and the bill status changes to 'Paid'."

---

## BK8. What is the implementation procedure you followed? [80% ASKED from blackbook]

**Answer:**

"Implementation was done in **4 phases** (Chapter 7):

**Phase 1 — Backend Implementation:**
- Set up Django project with MySQL database using PyMySQL adapter.
- Created 11 Django apps (users, patients, billing, fleet, etc.).
- Wrote ORM models as Python classes → ran `makemigrations` and `migrate` to create tables.
- Built REST APIs using Django REST Framework ViewSets and Serializers.
- Implemented JWT authentication and custom RBAC permission classes.
- Wrote the WebSocket `LocationConsumer` for GPS tracking.

**Phase 2 — Frontend Implementation:**
- Scaffolded React project with Vite.
- Created AuthContext for global state management.
- Set up React Router with Public and Protected routes.
- Built 34 reusable components (Sidebar, PatientForm, Table, etc.).
- Integrated Axios with interceptors for auto-token attachment.
- Loaded Razorpay checkout script dynamically for payments.

**Phase 3 — Integration Testing:**
- Connected frontend to backend APIs.
- Tested all 9 modules end-to-end.
- Fixed CORS issues, JSON format mismatches.

**Phase 4 — Deployment:**
- Wrote Dockerfiles for Django and React.
- Created docker-compose.yml with 5 services.
- Configured Nginx as reverse proxy."

---

## BK9. Explain the User Manual workflows for the Receptionist role. [70% ASKED from blackbook]

**Answer:**

"Chapter 8 documents step-by-step workflows. For the Receptionist:

**Register a New Patient:**
1. Click 'Patients' → '+ New Patient'
2. Fill personal details (Name, DOB, Gender, Contact)
3. Fill medical details (Diagnosis, Blood Type, **Infection Status** — must be accurate for machine assignment)
4. Record consent status
5. Click 'Save Patient' → System shows auto-generated Patient ID (e.g., P-045)

**Book an Appointment:**
1. Click 'Appointments' → '+ Book Appointment'
2. Type patient name → select from dropdown
3. Select Date, Machine, Doctor
4. Select Start Time
5. Click 'Confirm Booking' → If conflict, system shows error → Choose different time/machine

**Process Payment:**
1. Go to 'Billing' → Find pending bill → Click 'Process Payment'
2. Review itemised charges + GST
3. Select payment method:
   - Cash → Click 'Confirm Payment'
   - UPI → Show QR code → Patient scans → Click 'Confirm Payment'
4. Bill status changes to 'Paid'"

---

## BK10. What is the conclusion of your project? What did you achieve? [80% ASKED from blackbook]

**Answer:**

"The conclusion (Chapter 10):

DialysisTrack successfully replaces the manual paper-based system at I Care Dialysis Centre with a **fully automated, web-based management platform**.

**Key achievements:**
1. **Eliminated machine double-booking** — server-side conflict detection makes it technically impossible.
2. **Automated billing** — GST calculation happens automatically when a session is completed, reducing errors to zero.
3. **Real-time visibility** — Dashboard shows live session status, machine availability, and ambulance locations.
4. **Secured patient data** — JWT + 2FA + RBAC ensures only authorised users access sensitive medical records.
5. **Reduced operational time** — Appointment booking that took 5-10 minutes with manual checking now takes under 30 seconds.
6. **Digitised records** — All patient records are searchable in MySQL instead of paper cabinets.

The project was tested with **25 formal test cases** — all passed. **Miss Varsha Pote** (client representative) conducted User Acceptance Testing and approved the system."

---

## BK11. What references/bibliography did you use? [70% ASKED from blackbook]

**Answer:**

"The main references used (Chapter 11):

**Books:**
- 'Django for Professionals' by William S. Vincent — for Django best practices
- 'Learning React' by Alex Banks and Eve Porcello — for React component patterns
- 'Two Scoops of Django' by Daniel Feldroy — for Django project structure

**Official Documentation:**
- Django Documentation (docs.djangoproject.com)
- React Documentation (react.dev)
- Django REST Framework (django-rest-framework.org)
- MySQL 8.0 Reference Manual
- Razorpay API Documentation

**Standards:**
- UML 2.5 specification for system diagrams
- IEEE 830 for Software Requirements Specification format

**Domain Knowledge:**
- National Kidney Foundation — KDOQI Clinical Practice Guidelines (for Kt/V target values)
- WHO Infection Prevention Guidelines for Dialysis Centres"

---

## BK12. What are the hardware and software requirements? [80% ASKED from blackbook]

**Answer:**

"Documented in Chapter 2:

**Hardware Requirements:**

| Component | Minimum Specification |
|-----------|----------------------|
| Processor | Intel Core i5 or equivalent |
| RAM | 8 GB |
| Storage | 256 GB SSD |
| Network | Broadband internet (minimum 10 Mbps) |
| Client Devices | Any device with a modern web browser |
| Server (Production) | Cloud VM — 2 vCPU, 4 GB RAM, 50 GB SSD |

**Software Requirements:**

| Software | Version |
|----------|---------|
| Operating System | Ubuntu 22.04 LTS (server), Windows/Mac (dev) |
| Python | 3.10+ |
| Django | 4.2 |
| Node.js | 18+ |
| React.js | 18 |
| MySQL | 8.0 |
| Docker | 24+ |
| Browser | Chrome, Firefox, Edge (latest) |"

---

## BK13. What DFD symbols did you use? Explain each. [70% ASKED from blackbook]

**Answer:**

"Data Flow Diagram uses 4 symbols:

| Symbol | Shape | Meaning | Example in project |
|--------|-------|---------|--------------------|
| **External Entity** | Rectangle | A person outside the system | Receptionist, Doctor, Patient |
| **Process** | Rounded rectangle / Circle | A function that processes data | 'Schedule Appointment', 'Process Payment' |
| **Data Store** | Open rectangle (two lines) | Where data is stored (DB table) | Patient Store, Bill Store |
| **Data Flow** | Arrow with label | Movement of data | 'Login Credentials' → Authentication process |

**Key rule:** External entities NEVER communicate directly with each other — all data flows through the system's processes. This ensures every action is validated and logged."

---

## BK14. What is the Dialysis Session lifecycle? Explain the complete flow from patient arrival to payment. [90% ASKED from blackbook]

**Answer:**

"This is the **core workflow** of the entire system:

```
1. Patient arrives at centre
        ↓
2. Receptionist checks appointment → Patient appears in Queue
        ↓
3. Technician clicks 'Check-In' → Status: WAITING
        ↓
4. Machine is prepared → Technician clicks 'Start Session'
   → Status: IN PROGRESS, timer starts
        ↓
5. Nurse records vitals every 30 minutes
   (BP, Heart Rate, Temperature, Weight)
        ↓
6. Session ends (3-5 hours) → Technician clicks 'Complete Session'
   → Post-dialysis vitals recorded
        ↓
7. System AUTO-GENERATES a Bill:
   Subtotal = Session Cost + Medicine + Consultation
   GST = Subtotal × 18%
   Total = Subtotal + GST
        ↓
8. Receptionist processes payment (Cash / UPI QR / Razorpay)
        ↓
9. Bill status → PAID. Patient leaves.
```

This entire flow covers **4 modules**: Queue → Sessions → Billing → Payments
And involves **3 roles**: Technician, Nurse, Receptionist"

---

## BK15. What is the difference between Super Admin (Django Admin) and Regular Admin (React Dashboard)? [70% ASKED from blackbook]

**Answer:**

"This is a deliberate **architectural decision** documented in Chapter 7:

| Feature | Regular Admin (React) | Super Admin (Django Admin) |
|---------|----------------------|---------------------------|
| **Access URL** | `localhost:3000` | `localhost:8000/admin/` |
| **Interface** | Custom-built React dashboard | Django's auto-generated admin panel |
| **Who uses it** | Centre manager (day-to-day operations) | IT administrator (system maintenance) |
| **Restrictions** | Workflow-appropriate constraints (cannot edit completed sessions) | **No restrictions** — direct database access |
| **Purpose** | Operational tasks — appointments, billing, reports | System tasks — password resets, bulk exports, 2FA resets |
| **Security** | JWT + 2FA | Superuser flag + 2FA |

The React admin has **business rules** built in (e.g., won't let you change a completed session's time). Django Admin **bypasses** all these rules and gives raw database control — which is why only the IT Super Admin has access."

---

## FINAL COMPLETE COVERAGE — ALL FILES

| File | Questions | Covers |
|------|-----------|--------|
| `Viva_Questions_Answers.md` | Q1–Q25 + B1–B5 | Core project + tech stack |
| `Important_Questions.md` | Q26–Q50 + B6–B15 | Deep technical + theory |
| `Most_Asked_Compulsory_Questions.md` | Top 25 prioritized | Study-first cheatsheet |
| `Remaining_Questions.md` | R1–R16 | Architecture, React, demo |
| **`Blackbook_Questions.md`** (this file) | **BK1–BK15** | **Chapter-wise blackbook gaps** |
| **GRAND TOTAL** | **96 questions** | **100% coverage** ✅ |

---

> **Examiner behaviour:** They will open your blackbook to a diagram (e.g., DFD or ERD), point at it, and ask "Explain this." Be ready to explain any diagram in your blackbook verbally. Practice by looking at each diagram and speaking for 1-2 minutes about it.

---

*Prepared for: BCA Semester 6 External Viva — Tilak Maharashtra Vidyapeeth, Pune*
*Project: DialysisTrack — Dialysis Centre Management System*
