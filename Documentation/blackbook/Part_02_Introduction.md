
# 1. INTRODUCTION

## 1.1 Project Overview

DialysisTrack is a web-based management system that we developed for handling the everyday operations of a dialysis centre. The idea came from a simple observation — most dialysis centres in India, especially the smaller and mid-sized ones, are still managing their patients, billing, and machine schedules using a combination of handwritten registers, Excel files, and basic accounting software. These tools were never designed to talk to each other, so the same patient's data ends up being entered in three or four different places. Over time, this creates a mess of duplicated records, missed appointments, and billing mistakes that somebody has to go back and sort out manually.

We wanted to build one platform that handles everything under a single roof. From the moment a patient walks in to register, to booking their appointment, getting treated, having their vitals recorded, getting billed, and making the payment — every single step is tracked inside DialysisTrack. It even handles ambulance dispatch and live GPS tracking, which most existing hospital systems do not bother with.

We built the system using:

- **Backend:** Django 4.2 with Django REST Framework (Python) — serves a RESTful JSON API
- **Frontend:** React 18 with Vite as the build tool — a single page application
- **Database:** MySQL 8.0 for production, SQLite for development and testing
- **Real-Time Tracking:** Django Channels with WebSocket for ambulance GPS streaming
- **Security:** JWT (JSON Web Token) based login, Role-Based Access Control (RBAC) with seven user roles, and mandatory TOTP-based two-factor authentication for all staff
- **Deployment:** Docker containers behind an Nginx reverse proxy
- **PWA:** The app installs directly from the browser on phones and tablets

The system supports seven different user roles — Admin, Doctor, Nurse, Technician, Receptionist, Patient, and Driver. Each role gets a customised dashboard and can only access the modules they are supposed to use. For example, a patient can only view their own records and bills, while a nurse can manage the treatment queue and record vitals but cannot access billing or staff management.

The name "DialysisTrack" reflects the core idea of the project — tracking. We wanted to track everything: patient records, treatment sessions, vital sign trends, machine usage, staff attendance, payments, ambulance location, and system events (via an audit log). By tracking all of this in one place, we give the centre's management real-time visibility into how things are running, something that simply is not possible with paper-based systems.

### 1.1.1 What Makes This Different from a Generic Hospital System

There are many "Hospital Management Systems" (HMS) available online, including several open-source ones. However, most of them are designed for general hospitals and cover a wide range of departments — OPD, IPD, pharmacy, lab, radiology, etc. They treat dialysis as just one of many services, without going into the specific workflows that a dialysis centre requires.

DialysisTrack, on the other hand, is purpose-built for dialysis. There are certain features that only make sense in a dialysis setting:

| Feature | Why it matters for dialysis specifically |
|:--------|:-----------------------------------------|
| Three-shift scheduling | Dialysis centres run morning, evening, and sometimes night shifts to serve more patients with limited machines |
| Priority queue with machine assignment | Patients need a specific dialysis machine — the queue cannot just be "next patient please" |
| Pre/Post vital tracking | Blood pressure, heart rate, temperature, SpO2, and weight must be recorded before AND after every session |
| Dialysis parameters | Blood flow rate, dialysate flow rate, UF goal, heparin dose — these are specific to dialysis |
| Machine maintenance scheduling | Dialysis machines need regular maintenance. A breakdown during a session is medically dangerous |
| Session timer | Each session runs for 3–4 hours. Staff need to know when each machine will be free |

A general HMS does not have these features, so a dialysis centre using a generic tool ends up maintaining a separate set of records just for treatment specifics — which defeats the purpose of having a system in the first place.

---
<div style="page-break-after: always;"></div>

## 1.2 Background and Motivation

### 1.2.1 Understanding Chronic Kidney Disease and Dialysis

Chronic Kidney Disease (CKD) is a progressive condition where the kidneys gradually lose their ability to filter waste products from the blood. When kidney function drops below approximately 10-15% of normal capacity (known as End-Stage Renal Disease or ESRD), the patient needs either a kidney transplant or regular dialysis to survive.

Dialysis is a medical procedure that performs the function of healthy kidneys — it removes waste, excess salt, and extra water from the blood to prevent them from building up in the body. There are two main types:

1. **Haemodialysis** — The patient's blood is pumped through an external machine (called a dialyser) that filters it and returns it to the body. This is the most common type in centres. Each session takes 3–4 hours and is typically done 3 times per week.

2. **Peritoneal Dialysis** — Uses the lining of the patient's abdomen (peritoneum) and a cleansing solution (dialysate) to filter waste. Usually done at home by the patient, so centre-based systems focus primarily on haemodialysis.

DialysisTrack primarily supports haemodialysis workflows, as that is what centre-based operations revolve around.

### 1.2.2 The Scale of the Problem in India

Some numbers that gave us the context for building this project:

| Statistic | Figure |
|:----------|:-------|
| CKD patients worldwide | ~850 million |
| Dialysis patients in India | ~200,000 and growing |
| Annual growth rate | 10–15% per year |
| Leading causes | Diabetes (44%), Hypertension (28%), Glomerulonephritis (12%) |
| Dialysis centres in India | ~6,000 (as of 2024) |
| Centres using digital management | Estimated less than 20% |
| Average sessions per patient per month | 12 (3 per week) |
| Average session duration | 3.5 hours |
| Machines per small centre | 5–15 |
| Patients served per small centre per day | 15–45 (across shifts) |

Sources: Indian Journal of Nephrology, National Kidney Foundation, NITI Aayog Health Report 2024.

The gap between the number of centres and the number using proper software management gives a clear business case. Even if only 10% of the undigitised centres adopt a tool like DialysisTrack, that would be around 500 potential installations.

### 1.2.3 What We Observed at Real Centres

Before we started coding, we visited two dialysis centres in Pune — one attached to a large hospital and one that operates independently. Here is what we saw:

**At the hospital-attached centre:** They used the hospital's general HMS for patient registration and billing, but maintained separate paper registers for dialysis sessions, vital signs, and machine logs. The nurses had a laminated chart pinned to the wall showing which patient was on which machine. When we asked how they tracked trends in a patient's vitals over time, the head nurse said they would have to physically go through months of register pages.

**At the independent centre:** Everything was on paper. The receptionist had a thick register for appointments, a separate notebook for billing, and sticky notes on her desk for reminders. The doctor said his biggest frustration was that he could never quickly see a patient's treatment history — he had to ask the nurse to pull out the physical file, which sometimes took 10 minutes during a busy shift.

These visits convinced us that there is a genuine need for a purpose-built digital system.

---
<div style="page-break-after: always;"></div>

## 1.3 Problem Statement

Based on our research and the centre visits, we identified the following specific problems that DialysisTrack aims to solve:

**Problem 1: Fragmented tools and data silos.**
Scheduling sits in one notebook, clinical records in another, billing in an Excel file. There is no central database, so the same patient's name, phone number, and blood group get manually entered in multiple places. This leads to inconsistencies (one register says the patient's blood group is B+, another says B–) and wastes staff time on duplicate data entry.

**Problem 2: No real-time visibility into centre operations.**
The head nurse wants to know at a glance which machines are currently in use, which ones are free, who is waiting in the queue, and how long the current sessions have been running. With a paper-based system, she has to physically walk to each machine station, check the whiteboard queue, and then make decisions. This takes time and slows down the entire workflow. If someone needs to make a quick decision — like rescheduling a patient because a machine broke down — they are working blind.

**Problem 3: Weak security and no access control.**
Patient health records are classified as sensitive personal data under Indian IT rules. But in most small centres, the billing person, the receptionist, and sometimes even the cleaning staff can see the same paper files. There is no concept of "this person should only see billing data, not medical records." A digital system without role-based access control has the same problem — if everyone shares one login, there is no accountability.

**Problem 4: No patient self-service.**
Every time a patient wants to know their next appointment date, check their pending bill, or see their last session's vitals, they have to call the centre. During peak hours, the phone is busy. This frustrates patients and eats into staff time that could be spent on clinical work.

**Problem 5: Paper-based vitals recording loses historical trends.**
When a nurse records BP (blood pressure) readings on paper, it is nearly impossible to look at 6 months of readings and spot a trend. Is this patient's blood pressure slowly increasing over time? Is their dry weight changing? These trends matter for the doctor's treatment decisions, but they are invisible in a paper system. A digital system with a proper database can show charts and flag anomalies automatically.

**Problem 6: No mobile access for staff on the floor.**
Nurses and technicians move around the ward constantly. They cannot sit at a desktop computer to update records. They need to access the system from a phone or tablet while standing next to the patient's machine. Most existing systems either do not have a mobile-friendly interface or require installing a separate app.

**Problem 7: Manual ambulance dispatch with no tracking.**
Some centres offer ambulance transport for patients who cannot travel on their own. Currently, the dispatch process is: the receptionist calls the driver, the driver says "I will be there in 30 minutes," and everyone waits. There is no map, no live location, and no way to verify the ETA. If the driver gets stuck in traffic, nobody knows until the patient calls again to complain.

DialysisTrack was designed to solve each of these seven problems with specific, concrete features:

| Problem # | Solution in DialysisTrack |
|:---------:|:--------------------------|
| 1 | Single MySQL database with a REST API — one source of truth |
| 2 | Real-time dashboards showing queue, machine status, and sessions |
| 3 | JWT authentication + RBAC with 7 roles + mandatory 2FA for staff |
| 4 | Patient portal with self-service views for appointments, history, bills |
| 5 | Digital vitals stored in database, charted with Recharts library |
| 6 | Progressive Web App (PWA) — works on any phone browser |
| 7 | WebSocket-based GPS tracking with live map (Leaflet + OpenStreetMap) |

---
<div style="page-break-after: always;"></div>

## 1.4 Objectives

The specific technical and functional objectives we set for this project were:

1. **Unified platform** — Build a single web application that covers all operational areas of a dialysis centre: patient registration, appointment scheduling, treatment queue, dialysis session management, machine management, staff scheduling, billing and payments, fleet management, and reporting.

2. **Role-based access control** — Design and implement RBAC with seven distinct roles (Admin, Doctor, Nurse, Technician, Receptionist, Patient, Driver), where each role has precisely defined permissions for each API endpoint. No user should be able to access data or functions outside their role.

3. **Smart queue system** — Build a treatment queue with three priority levels (Emergency, Scheduled, Walk-in). Emergency patients go to the front automatically. The system should auto-calculate estimated wait times based on the current queue length and average session duration.

4. **Patient self-service portal** — Give patients their own login where they can view upcoming appointments, check queue status, see treatment history (including past vitals), view and pay pending bills.

5. **Two-factor authentication** — Enforce TOTP-based 2FA (compatible with Google Authenticator, Authy, Microsoft Authenticator) for all staff roles. Patients login with email/password only since they have limited access.

6. **Automated billing** — The system should auto-calculate bill totals based on session charges, apply 18% GST, subtract any discount, and generate downloadable invoices. Payment methods: cash, UPI (with auto-generated QR code), card, and net banking.

7. **Live ambulance tracking** — Use WebSocket (Django Channels) to stream GPS coordinates from the driver's phone to a live map that hospital staff can monitor. Track ride status (dispatched → en route → arrived → returning).

8. **Progressive Web App** — The frontend should be installable on phones and tablets directly from the browser. A service worker should cache static assets for fast loading. An offline indicator should clearly show when the network is down.

9. **Exportable reports** — Generate summary reports and allow export in three formats: CSV (for opening in Excel), XLSX (native Excel with formatting), and PDF (for printing).

10. **Docker deployment** — Package the backend, frontend, and database as Docker containers so that the entire system can be deployed on a new server with a single docker-compose up command.

11. **Audit trail** — Log all significant system events (logins, password changes, record modifications) with timestamps, user IDs, IP addresses, and action descriptions. Only the admin can view the audit log.

12. **Responsive design** — Every page should work correctly on desktops (1920×1080), laptops (1366×768), tablets (768×1024), and phones (360×800) without horizontal scrolling or broken layouts.

---
<div style="page-break-after: always;"></div>

## 1.5 Scope of the Project

### 1.5.1 What is Included

| Module | What it covers |
|:-------|:--------------|
| User Management | Registration with email verification, login with JWT tokens, password reset via email OTP, profile management, seven user roles with per-endpoint access control |
| Patient Management | Full CRUD for patient records including demographics, medical history (diagnosis, allergies, comorbidities, dialysis access type), dry weight tracking, and emergency contact storage |
| Appointment Scheduling | Shift-based booking across three slots (Morning 6am–12pm, Evening 12pm–6pm, Night 6pm–12am), automatic slot availability checking, appointment status tracking (scheduled → confirmed → completed/cancelled) |
| Queue Management | Real-time priority queue with three levels (Emergency/Scheduled/Walk-in), auto queue numbering, machine assignment, estimated wait-time calculation, queue position updates |
| Dialysis Session Tracking | Pre-dialysis vitals (BP, heart rate, temp, SpO2, weight), dialysis parameters (blood flow, dialysate flow, UF goal, heparin), post-dialysis vitals, session timer, doctor treatment notes, nurse notes |
| Machine Management | Machine inventory with unique IDs (M-001 format), five status types (available/in_use/cleaning/maintenance/out_of_service), maintenance scheduling with alerts, usage logs, cleaning records |
| Staff Management | Staff directory, three-shift scheduling, daily attendance tracking, leave request and approval workflow, role and department assignment |
| Billing | Auto-calculation with itemised breakdown (session charge + consultation + medicines + other), 18% GST application, discount support, four payment methods (cash/UPI/card/net banking), UPI QR code generation, invoice download |
| Reports | Dashboard statistics (patient count, session count, revenue), exportable reports in CSV, Excel (XLSX), and PDF formats |
| Fleet Management | Ambulance registration, ride dispatch, four-state ride tracking (dispatched/en_route/arrived/returning), live GPS via WebSocket on Leaflet map |
| Two-Factor Authentication | TOTP setup with QR code scan, backup recovery codes, grace period for initial setup, mandatory enforcement for staff roles |
| PWA | Web app manifest, service worker for static asset caching, install prompt, offline status indicator |
| Audit Log | Complete event log with timestamp, user, IP address, action type, and description. Admin-only access |

### 1.5.2 What is Not Included (and Why)

| Feature Not Included | Reason |
|:---------------------|:-------|
| Direct machine data feed | Dialysis machines use proprietary protocols (e.g., Fresenius OPC-UA). Integrating with them requires vendor partnerships and certifications that are beyond the scope of an academic project |
| Native mobile apps (iOS/Android) | The PWA approach provides 90% of the mobile experience without requiring separate iOS and Android codebases. It also avoids App Store review processes |
| Video consultations / Telemedicine | Would require WebRTC integration, which is a separate large project. Also, dialysis patients physically visit the centre, so tele-consultation is less relevant |
| Multi-hospital / Multi-branch support | Would require multi-tenant database architecture, which adds significant complexity. We prioritised feature depth for a single centre over breadth for multiple locations |
| HL7/FHIR standard compliance | Healthcare interoperability standards need extensive testing and certification. This would be a major future project on its own |
| Pharmacy and lab management | These are separate domains with their own workflows. Including them would make the project scope unmanageable for a two-person team in 6 months |

These features were intentionally left out to keep the project scope realistic for our team and timeline. However, the modular architecture (separate Django apps for each feature) was designed so that these can be added as independent modules in the future without rewriting the existing code. See Chapter 10 (Future Scope) for specific plans.

### 1.5.3 Project Timeline

The following Gantt-style table shows how we divided the work across the 24-week development period:

| Week | Phase | Key Deliverables |
|:----:|:------|:-----------------|
| 1–2 | Requirements and Research | Centre visits, stakeholder interviews, feature list, SRS draft |
| 3–5 | System Design | Database schema, UML diagrams (DFD, Use Case, Class, Sequence, Activity), API endpoint design |
| 6–8 | Backend Core | Django project setup, User model, JWT auth, RBAC middleware, Patient and Appointment APIs |
| 9–11 | Backend Modules | Queue, Session, Machine, Staff, Billing APIs, 2FA implementation |
| 12–14 | Frontend Core | React project setup, routing, auth flow, dashboard layouts, reusable components |
| 15–17 | Frontend Modules | All module pages (patients, queue, sessions, machines, billing, staff), forms and validation |
| 18–19 | Real-Time and Advanced | WebSocket GPS tracking, PWA setup, report generation (CSV/Excel/PDF) |
| 20–22 | Testing and Debugging | Unit tests, API tests, role permission tests, cross-browser testing, bug fixes |
| 23–24 | Deployment and Documentation | Docker setup, Nginx config, production deployment, user manual, project report |

