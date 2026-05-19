# PROJECT SYNOPSIS

**For TYBCA Students**  
**Academic Year: 2025–26**

**Student Full Name 1 & PRN:** Gaurav Vishwanath Mahadik & 04423002593  
**Student Full Name 2 & PRN:** Sani Sharad Satpute & 04423002700  
**Client Name:** Miss. Varsha Pote  
**Client's Company Name:** I Care Dialysis Centre  
**Client's Designation:** Senior Technician  
**Client's Contact Info:** 8655831839

---

## 1. Title of the Project:

**Dialysis Track – Comprehensive Dialysis Management System**

---

## 2. Introduction / Background:

Dialysis is one of the most critical treatments for patients suffering from chronic kidney disease or kidney failure. These patients need regular dialysis sessions, sometimes multiple times a week, and each session requires careful planning, machine availability, staff coordination, and proper record keeping.

At present, many dialysis centres including I Care Dialysis Centre rely on manual registers, paper records, and basic spreadsheets to manage patient data, appointments, billing, and machine schedules. This manual approach leads to several problems — data gets misplaced, scheduling conflicts arise, bills are sometimes incorrectly calculated, and there is no easy way to track a patient's complete treatment history at a glance.

With these practical challenges in mind, we decided to build "Dialysis Track" — a web-based management system that brings all the daily operations of a dialysis centre into one single platform. The system is designed to handle patient records, appointment scheduling, billing, queue management, staff coordination, and much more. Our goal was to make the day-to-day workflow smoother for the staff and provide patients better visibility into their own treatment schedules and records.

---

## 3. Objectives of the Project:

1. To develop a web-based application that manages all aspects of a dialysis centre's daily operations.
2. To maintain accurate and organized digital records of patients, their medical history, and treatment sessions.
3. To create an appointment scheduling system that supports shift-based booking (Morning, Evening, Night).
4. To implement a real-time queue management system with priority levels for handling walk-ins and emergencies.
5. To provide role-based access so that admins, doctors, nurses, technicians, receptionists, and patients each see only what they need.
6. To generate bills, track payments, and produce downloadable invoices.
7. To build a reporting dashboard with charts and data export options (CSV, Excel, PDF).
8. To ensure system security through JWT authentication and role-based permissions.
9. To implement Two-Factor Authentication (2FA) using TOTP for all staff members, making logins more secure.
10. To build the application as a Progressive Web App (PWA) so it can be installed on phones and desktops and works even with limited internet.
11. To develop an ambulance fleet management module with live GPS tracking and a dispatch system.
12. To add an in-app notification system with a notification bell, unread badges, and appointment reminders.
13. To allow patients to register themselves from the login page without needing staff assistance.
14. To provide a forgot password feature with token-based email recovery.
15. To integrate a UPI QR code payment option so patients can pay bills by scanning with PhonePe, GPay, Paytm, etc.
16. To maintain an audit log that tracks every important action performed in the system for accountability.

---

## 4. Scope of the Project:

### Included:

- Patient registration, profile management, and medical history tracking
- Appointment scheduling with shift support (Morning / Evening / Night)
- Dialysis session tracking from start to completion
- Real-time queue management with Normal, Urgent, and Emergency priority levels
- Machine management — tracking availability, usage status, and maintenance schedules
- Staff management with defined user roles and permission control
- Billing — creating bills, marking payments, generating PDF invoices
- Reporting dashboard with charts, statistics, and data export (CSV, Excel, PDF)
- Django Admin panel for backend database management
- Two-Factor Authentication (TOTP-based) — mandatory setup for all staff roles with a grace period of 3 logins or 24 hours
- Progressive Web App (PWA) — the application can be installed on any device and has basic offline support
- Ambulance Fleet Management — adding vehicles, assigning drivers, live GPS tracking on a map, and dispatch management
- Notification System — in-app notification bell with unread count, appointment reminders, and system alerts
- Audit Log — records who did what, when, and from which IP address; accessible only to admins
- Patient Self-Registration — patients can create their own accounts from the login page
- Forgot Password / Password Reset — email-based token recovery flow
- UPI QR Code Payments — generates scannable QR codes for bill amounts, works with all major UPI apps
- AI Chatbot — a simple in-app chatbot to help users navigate the system
- Driver Role & Dashboard — a separate dashboard for ambulance drivers to manage their trips

### Not Included:

- Direct integration with dialysis machines or IoT sensors
- Insurance claim processing or third-party billing integrations
- Video calling or telemedicine consultation features

---

## 5. Proposed System / Methodology:

The system is built using a client-server architecture where the frontend and backend are developed separately and communicate through REST APIs.

**Backend:** We used Django with Django REST Framework to build the API. The backend handles all business logic, data validation, authentication, and database operations. JWT (JSON Web Tokens) are used for secure login sessions. For staff security, we added TOTP-based Two-Factor Authentication using the django-otp library.

**Frontend:** The frontend is a single-page application built with React and bundled using Vite. We used Tailwind CSS for styling and Recharts for displaying charts on the reports page. The app also works as a Progressive Web App with a service worker for caching and offline support.

**Database:** MySQL is used as the primary database in production. During development, SQLite was used for quick testing.

**Real-time Features:** For ambulance GPS tracking, we used Django Channels with WebSocket to push live location updates to the frontend map.

### Major Modules:

1. **Patient Management** — Add, edit, view, and search patients; manage medical history, allergies, emergency contacts
2. **Appointments** — Book appointments with date, shift, time, and machine assignment; track status from Scheduled to Completed
3. **Queue Management** — Add patients to the queue with priority (Normal / Urgent / Emergency); start and complete sessions
4. **Machine Management** — Track machine status (Available / In Use / Maintenance); schedule and log maintenance
5. **Staff Management** — Create staff accounts with roles; manage passwords; view 2FA status
6. **Billing & Payments** — Create bills, mark as paid, generate PDF invoices, track payment history; UPI QR code payment support
7. **Reports & Analytics** — View dashboard statistics, weekly trends, machine utilization charts; export reports in CSV, Excel, and PDF
8. **Sessions** — View active and past dialysis sessions with full details
9. **Django Admin Panel** — Backend admin interface for direct database management
10. **Two-Factor Authentication** — Mandatory 2FA setup for staff using Google Authenticator or similar TOTP apps; includes grace period and backup codes
11. **Notifications** — Bell icon in the navigation bar showing unread notification count; supports appointment reminders and system alerts
12. **Audit Log** — Logs every significant user action with details like user name, action type, module, IP address, and timestamp
13. **Ambulance Fleet** — Manage ambulance vehicles, assign drivers, track live GPS location on a map, and handle dispatch requests
14. **PWA Support** — Service worker handles caching, app can be installed from the browser, shows offline page when disconnected
15. **QR Code Payments** — Backend generates UPI QR codes with the bill amount; patients scan with any UPI app to pay
16. **Patient Self-Registration** — A public registration page where patients can create their own login account
17. **Forgot Password** — Email-based password reset using secure tokens

---

## 6. Software & Hardware Requirements:

### Software Requirements:

| Component | Technology Used |
|-----------|----------------|
| Frontend Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |
| Routing | React Router |
| PWA | Service Worker, Web Manifest |
| Backend Framework | Django 4.x with Django REST Framework |
| Language | Python 3.10+, JavaScript (ES6+) |
| Authentication | JWT (SimpleJWT) |
| Two-Factor Auth | django-otp (TOTP) |
| WebSocket | Django Channels + Daphne |
| PDF Generation | ReportLab |
| Excel Export | OpenPyXL |
| QR Code | qrcode library |
| Database | MySQL 8.0+ (production), SQLite 3 (development) |
| Web Server | Nginx |
| Containerization | Docker, Docker Compose |
| Version Control | Git |
| IDE | VS Code |
| API Testing | Postman |

### Hardware Requirements:

| Component | Minimum Requirement |
|-----------|-------------------|
| Processor | Intel i3 or equivalent |
| RAM | 4 GB |
| Storage | 100 GB |
| Internet | Required for real-time features |
| Client Device | Any modern web browser (Chrome, Edge, Firefox) |

---

## 7. System Design (Brief):

The project follows a modular structure on the backend with 11 separate Django apps: `users`, `patients`, `appointments`, `dialysis_queue`, `machines`, `staff`, `billing`, `reports`, `notifications`, `fleet`, and `two_factor`. Each app handles a specific part of the system, which keeps the code organized and maintainable.

The frontend is a React single-page application that sends API requests to the Django backend. All API endpoints are protected with JWT tokens, and staff members must additionally verify with a TOTP code after the initial grace period.

We implemented Role-Based Access Control (RBAC) with 7 user roles:

| Role | Access Level |
|------|-------------|
| Admin | Full system access including Django Admin |
| Doctor | Patients, queue, reports, sessions |
| Nurse | Queue, patients, sessions, machines (view) |
| Technician | Machines, queue (view), maintenance |
| Receptionist | Patients, appointments, billing |
| Patient | Own appointments, records, and bills only |
| Driver | Driver dashboard, ambulance GPS tracking |

The system includes mandatory Two-Factor Authentication for all staff roles. When a staff member logs in for the first time, they are required to set up 2FA by scanning a QR code with an authenticator app. A grace period of 3 logins or 24 hours is provided before the 2FA code is required on every login.

The application is also a Progressive Web App — it can be installed on phones and desktops from the browser, and a service worker caches static assets so the interface loads even with poor internet connectivity.

An audit log system records all significant actions performed in the system, which is useful for compliance and troubleshooting.

---

## 8. Expected Outcome:

1. A fully working web-based dialysis management system covering patient records, appointments, billing, queue, machines, staff management, and reports.
2. Reduction in manual paperwork and administrative errors.
3. Faster patient check-in and session management through the queue system.
4. Organized and searchable digital records replacing paper-based files.
5. Role-based dashboards showing only relevant information to each user type.
6. Downloadable reports in CSV, Excel, and PDF formats.
7. Stronger security for staff accounts through mandatory Two-Factor Authentication.
8. App installable on mobile and desktop devices as a PWA with offline support.
9. Ambulance fleet tracking with live GPS updates on a map.
10. Staff and patients stay informed through the in-app notification system.
11. Full audit trail of all actions for accountability and compliance.
12. Contactless payment option through UPI QR code scanning.
13. Reduced front-desk load due to patient self-registration.
14. Quick user assistance through the in-app chatbot.

---

## 9. Conclusion:

Dialysis Track was developed to address the real challenges faced at dialysis centres like I Care Dialysis Centre. The system brings all the daily operations — from patient registration to billing — into a single, easy-to-use web application. Staff members no longer need to rely on paper registers or isolated spreadsheets; everything is accessible from one place with proper access controls.

The system covers a wide range of features including Two-Factor Authentication for secure logins, PWA support for access from any device, UPI QR payments for contactless billing, ambulance fleet management with GPS tracking, in-app notifications, audit logs, and a self-registration option for patients. Together, these features make Dialysis Track a practical and complete solution for managing a dialysis centre efficiently.

We believe this project demonstrates how a well-planned web application can genuinely improve the efficiency and organization of a healthcare facility.

---

## 10. References:

1. Django Documentation — https://docs.djangoproject.com/
2. Django REST Framework — https://www.django-rest-framework.org/
3. React.js Documentation — https://react.dev/
4. Vite Documentation — https://vitejs.dev/
5. Tailwind CSS — https://tailwindcss.com/
6. MySQL Documentation — https://dev.mysql.com/doc/
7. JWT / SimpleJWT — https://django-rest-framework-simplejwt.readthedocs.io/
8. Django Channels — https://channels.readthedocs.io/
9. Progressive Web Apps (MDN) — https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
10. TOTP / RFC 6238 — https://datatracker.ietf.org/doc/html/rfc6238
11. UPI Standards (NPCI) — https://www.npci.org.in/what-we-do/upi/product-overview
12. OWASP Security Guidelines — https://owasp.org/
13. Recharts — https://recharts.org/
14. ReportLab — https://www.reportlab.com/