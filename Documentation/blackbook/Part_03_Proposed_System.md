
# 2. PROPOSED SYSTEM

## 2.1 Existing System vs Proposed System

### 2.1.1 What Exists Today

We researched the tools and methods that dialysis centres currently use for their management. We looked at paper-based approaches, general-purpose software, and the few dialysis-specific products available in the market. Here is a summary:

| System | Type | Problems |
|:-------|:-----|:---------| 
| Paper registers and notebooks | Fully manual | No searching, no backups, no reporting, handwriting illegibility, physical storage takes space, risk of loss from fire/water |
| Microsoft Excel / Google Sheets | Semi-digital | No real-time sharing between staff, no role-based access, limited to 1 million rows, no automation, one accidental delete can wipe months of data |
| Fresenius EuCliD | Proprietary software | Only works with Fresenius brand machines, very expensive licensing, no Indian billing or GST support, requires vendor support for any customisation |
| NephroPlus internal system | In-house built | Proprietary — not available to independent or smaller centres, closed source |
| General Hospital Management Systems | Generic software | Not designed for dialysis-specific workflows, missing session tracking, missing machine-patient assignment, missing vital trends |
| Tally / QuickBooks | Accounting only | Handles billing but nothing clinical, no patient records, no scheduling |

### 2.1.2 Problems We Identified in Current Systems

We spoke with staff at two centres and identified these recurring frustrations:

**From the receptionist:**
"I maintain three separate books. If a patient calls and asks about their last bill, I have to find the billing notebook, search for their name, and read out the details. It takes 5 minutes for something that should take 5 seconds."

**From the head nurse:**
"When all 10 machines are running and a new patient walks in, I have no quick way to know which machine will be free next. I have to walk around and check each one."

**From the doctor:**
"I want to see how a patient's blood pressure has changed over the last 3 months. But the vitals are written in a daily register, so I would have to flip through 90 pages and manually note down each reading. I never do it because I just do not have the time."

**From the administrator:**
"At the end of the month, I need to know: how many sessions we did, what was the revenue, which machines were out of service and for how long. Getting this data takes my accountant a full day of counting and adding."

### 2.1.3 How DialysisTrack Solves These

| Feature Area | Before (Existing System) | After (DialysisTrack) |
|:-------------|:------------------------|:---------------------|
| Patient records | Paper files in cabinets, or rows in Excel | Centralised MySQL database, searchable by name/phone/blood group/ID |
| Appointment booking | Written in a diary, sometimes double-booked | Shift-based scheduling with automatic conflict detection, no double-booking |
| Treatment queue | Whiteboard with names, manually updated | Priority queue (Emergency > Scheduled > Walk-in) with auto wait-time calculation |
| Machine tracking | Written status on a chart pinned to the wall | Live status dashboard: available/in_use/cleaning/maintenance, with alerts |
| Vital signs | Handwritten on paper registers | Digital entry with historical charts showing 30/60/90-day trends |
| Billing | Calculated by hand or in Excel, often with errors | Auto-calculated with itemised breakdown, 18% GST, and UPI QR code generation |
| Payment tracking | Receipt book with carbon copies | Digital payment tracking with method (cash/UPI/card), amount, date, receipt download |
| Patient self-service | "Call and ask" — phone always busy | Patient portal: view appointments, queue status, treatment history, pending bills |
| Ambulance tracking | "Call the driver and ask his ETA" | Real-time GPS on map, live location streaming via WebSocket |
| Reports | Manual counting at month-end | Dashboard with live statistics, one-click download in CSV/Excel/PDF |
| Security | Shared password or no password at all | JWT authentication, 7 discrete roles, mandatory TOTP 2FA for all staff |
| Mobile access | None — system tied to one desktop | PWA — installable on any phone or tablet, works from the browser |
| Deployment | Manual installation, takes days to set up | Docker containers — deploy the entire system with one command |

### 2.1.4 Cost Comparison

| Item | Existing Approach | DialysisTrack |
|:-----|:-----------------|:-------------|
| Software license | Rs. 50,000–5,00,000/year (for commercial HMS) | Rs. 0 (fully open source stack) |
| Hardware | Dedicated server + IT support | Any cloud VM (Rs. 2,000–5,000/month) or on-premises PC |
| Data entry staff | 1–2 dedicated clerks | Staff enters data themselves, no dedicated clerk needed |
| Maintenance | Vendor dependency, annual contracts | Self-maintainable, community support, detailed documentation |
| Mobile access | Extra cost or not available | Built-in PWA, no extra cost |
| Estimated annual total | Rs. 2,00,000–8,00,000 | Rs. 25,000–65,000 |

The cost advantage alone makes a compelling case. A small centre that spends Rs. 3 lakh per year on a commercial system plus data entry salaries could bring that down to under Rs. 1 lakh with DialysisTrack.

---
<div style="page-break-after: always;"></div>

## 2.2 Hardware and Software Specifications

### 2.2.1 Hardware Requirements

**For Development (Minimum):**

| Component | Specification |
|:----------|:-------------|
| Processor | Dual-core 2 GHz or higher (Intel i5 / AMD Ryzen 5 or equivalent) |
| RAM | 4 GB minimum, 8 GB recommended |
| Hard Disk | 20 GB free space (SSD preferred for faster build times) |
| Internet | Broadband WiFi or Ethernet (for downloading packages and testing API calls) |
| Display | 1366 × 768 minimum resolution |
| Operating System | Windows 10/11, Ubuntu 20.04+, or macOS 12+ |

**For Production Server:**

| Component | Specification |
|:----------|:-------------|
| Processor | Quad-core 2.5 GHz or higher |
| RAM | 8 GB minimum, 16 GB recommended for centres with 50+ daily patients |
| Storage | 100 GB SSD (database growth: approximately 1 GB per year for a 15-machine centre) |
| Network | 100 Mbps dedicated internet connection |
| Backup | External drive or cloud storage for daily automated backups |
| UPS | 30-minute battery backup to handle power cuts during data writes |

**For End Users (Client Devices):**

| Device | Minimum Requirement |
|:-------|:-------------------|
| Desktop / Laptop | Any processor from the last 5 years, 2 GB RAM, modern browser |
| Tablet | iPad (2018+) or Android 8.0+ tablet with Chrome |
| Mobile Phone | Android 8.0+ or iOS 14+ with Chrome/Safari |
| Browser | Chrome 90+, Edge 90+, Firefox 88+, Safari 14+ |
| Screen Resolution | 360 × 800 minimum (responsive design handles all sizes) |

### 2.2.2 Software Specifications

**Backend:**

| Component | Technology | Version | Purpose |
|:----------|:-----------|:--------|:--------|
| Language | Python | 3.10+ | Backend programming |
| Framework | Django | 4.2.7 | Web framework with ORM |
| API Layer | Django REST Framework | 3.14.0 | RESTful API endpoints |
| ASGI Server | Daphne | 4.0+ | WebSocket support |
| Process Manager | Gunicorn | 21.2.0 | Production WSGI server |

**Frontend:**

| Component | Technology | Version | Purpose |
|:----------|:-----------|:--------|:--------|
| Language | JavaScript (ES6+) | — | Frontend programming |
| Framework | React | 18.2.0 | UI component library |
| Build Tool | Vite | 5.0.8 | Fast HMR dev server + production bundler |
| CSS | Tailwind CSS | 3.3.6 | Utility-first styling |
| Routing | React Router | 6.8.0 | Client-side navigation |
| HTTP Client | Axios | 1.6.0 | API requests |

**Database and Infrastructure:**

| Component | Technology | Version | Purpose |
|:----------|:-----------|:--------|:--------|
| Database (Dev) | SQLite | 3.x | Zero-config development database |
| Database (Prod) | MySQL | 8.0+ | ACID-compliant production database |
| Web Server | Nginx | 1.24+ | Reverse proxy, SSL termination, static files |
| Containerisation | Docker | 24+ | Application packaging |
| Orchestration | Docker Compose | 2.x | Multi-container management |
| Version Control | Git + GitHub | 2.30+ | Source code management |

---
<div style="page-break-after: always;"></div>

## 2.3 Feasibility Study

Before starting development, we evaluated whether the project was technically, economically, operationally, and schedule-wise feasible.

### 2.3.1 Technical Feasibility

The question here was: can we actually build this with the technology available, and do we have the skills to do it?

All the technologies we chose are mature, well-documented, and widely used in production systems globally:

| Technology | First Released | Community Size | Documentation Quality |
|:-----------|:--------------|:--------------|:---------------------|
| Django (Python) | 2005 (18+ years) | 77,000+ GitHub stars | Official docs rated among the best in the industry |
| React (JavaScript) | 2013 (11+ years) | 220,000+ GitHub stars | Extensive official docs + massive tutorial ecosystem |
| MySQL | 1995 (27+ years) | Industry standard RDBMS | Complete reference manual, Stack Overflow: 700K+ questions |
| Docker | 2013 (11+ years) | De facto standard for containers | Official docs + Docker Hub |
| Tailwind CSS | 2017 (7+ years) | 80,000+ GitHub stars | Full reference guide with examples |

Our team had:
- Python experience from Data Structures and Algorithms coursework (3rd semester)
- Basic web development (HTML/CSS/JS) from Web Technology elective (4th semester)
- Database knowledge from DBMS course (4th semester)
- Django basics from a self-paced Udemy course one team member had taken

We spent the first two weeks going through official tutorials for Django REST Framework, React, and Docker to fill in the gaps. The learning curve was manageable because all four technologies have beginner-friendly documentation.

**Conclusion: Technically feasible.** All technologies are proven and accessible for a team with our background.

### 2.3.2 Economic Feasibility

| Cost Item | Amount |
|:----------|:-------|
| Django, React, MySQL, Docker, Nginx, Tailwind | Rs. 0 (all open source, MIT/BSD/GPL licences) |
| Development tools: VS Code, Git, Postman | Rs. 0 (free editions) |
| GitHub (for version control and collaboration) | Rs. 0 (free for public/private repos) |
| Cloud server (AWS EC2 t3.small or DigitalOcean droplet) | Rs. 2,000–5,000 per month |
| Domain name (e.g., dialysistrack.in) | Rs. 500–1,000 per year |
| SSL Certificate (Let's Encrypt) | Rs. 0 (free, auto-renewable) |
| **Total cost for first year** | **Rs. 25,000–65,000** |

Compare this with a commercial HMS licence (Rs. 50,000–5,00,000 per year) and the savings are obvious. Even if a centre hires a freelance developer for Rs. 50,000 to help with the initial setup, the total cost is still a fraction of commercial alternatives.

**Conclusion: Economically feasible.** The project can be deployed for under Rs. 65,000 per year.

### 2.3.3 Operational Feasibility

The key question: will the actual users (receptionists, nurses, doctors) be able to use this system without extensive training?

We designed the interface with simplicity as a priority. Each page has a clear heading, forms have labelled fields with validation messages, and common actions are accessible in one or two clicks. We tested this informally by having friends and family members (who are not computer science students) try the basic workflows:

| Task | Average Time to Complete (untrained user) |
|:-----|:------------------------------------------|
| Register a new patient | 3 minutes |
| Schedule an appointment | 2 minutes |
| Check in a patient and add to queue | 1 minute |
| Record pre-dialysis vitals | 2 minutes |
| Create a bill and process payment | 3 minutes |
| Find a patient by name or phone | Under 30 seconds |

The longest task took under 3 minutes, which is comparable to or faster than doing the same thing on paper. Staff who already use smartphones daily will find the interface familiar.

**Conclusion: Operationally feasible.** Minimal training required — the system is intuitive enough for users with basic computer literacy.

### 2.3.4 Schedule Feasibility

| Phase | Duration | Team Members Active |
|:------|:---------|:-------------------|
| Requirements gathering and analysis | 2 weeks | Both |
| System design (architecture, DB, UML diagrams) | 3 weeks | Both |
| Backend development (Django apps, models, serializers, views) | 6 weeks | Member 1 (primary) |
| Frontend development (React pages, components, API integration) | 6 weeks | Member 2 (primary) |
| Security layer (JWT + TOTP 2FA + RBAC middleware) | 2 weeks | Both |
| Testing, debugging, and cross-browser fixes | 3 weeks | Both |
| Deployment setup (Docker, Nginx) and documentation | 2 weeks | Both |
| **Total** | **24 weeks (~6 months)** | |

We followed an agile development process with two-week sprints. At the end of each sprint, we had a working version of the system with the newly added features. This helped us catch issues early and also gave us something to show our guide during progress reviews.

**Conclusion: Schedule feasible.** 24 weeks (6 months) is sufficient for a two-person team working part-time alongside other 6th semester courses.

---
<div style="page-break-after: always;"></div>

## 2.4 Technology Stack

### 2.4.1 Backend — Django REST Framework (Python)

Django is a high-level Python web framework that follows the Model-View-Template (MVT) architecture. We chose it for several reasons:

1. **Built-in ORM** — We write Python classes (models), and Django automatically generates the SQL tables, relationships, and queries. This saved us from writing hundreds of raw SQL statements.

2. **Admin panel** — Django ships with a fully functional admin interface at /admin/. We used this during development to quickly inspect database records, create test users, and verify data was being stored correctly.

3. **Authentication system** — Django has built-in user authentication (login, logout, password hashing, sessions). We extended this with JWT tokens and TOTP 2FA.

4. **Migrations** — When we change a model (for example, adding a new field to the Patient table), Django generates a migration file that can be applied to any database. This makes schema changes safe and version-controlled.

5. **Security defaults** — Django protects against CSRF (Cross-Site Request Forgery), XSS (Cross-Site Scripting), SQL injection, and clickjacking out of the box.

Django REST Framework (DRF) sits on top of Django and adds everything needed for building REST APIs — serializers (converting Python objects to/from JSON), viewsets (CRUD operations with minimal code), permissions (per-endpoint access control), pagination, filtering, and throttling.

Key backend libraries we used:

| Package | Version | What we use it for |
|:--------|:--------|:-------------------|
| djangorestframework | 3.14.0 | Building the REST API layer |
| djangorestframework-simplejwt | 5.3.0 | JWT token generation and validation |
| django-cors-headers | 4.3.1 | Allowing cross-origin requests from the React frontend (runs on different port) |
| django-filter | 23.3 | Adding filter parameters to list APIs (e.g., filter patients by blood group) |
| django-otp | 1.3.0 | TOTP-based two-factor authentication |
| channels | 4.0+ | WebSocket support for real-time GPS streaming |
| daphne | 4.0+ | ASGI server that handles both HTTP and WebSocket connections |
| reportlab | 4.0.7 | Generating PDF reports and invoices |
| openpyxl | 3.1.2 | Generating formatted Excel (.xlsx) reports |
| qrcode | 7.4.2 | Generating UPI payment QR code images |
| Pillow | 10.1.0 | Image processing for QR codes and profile pictures |

### 2.4.2 Frontend — React 18 with Vite

React is a JavaScript library for building user interfaces using reusable components. Every part of the DialysisTrack interface — from a single button to the entire dashboard page — is a React component.

We chose React because:

1. **Component-based architecture** — We built generic components like `DataTable`, `FormInput`, `StatsCard`, and `Modal` that are reused across all modules. For example, the same `DataTable` component renders the patient list, machine list, bill list, and staff list — just with different columns and data.

2. **Virtual DOM** — React updates only the parts of the page that actually changed, which makes the interface feel fast and responsive even with complex pages showing dozens of data points.

3. **Rich ecosystem** — There is a React library for almost everything we needed (charts, maps, date pickers, toast notifications, icons).

4. **Large community** — React has 220,000+ GitHub stars and millions of developers. Finding solutions to problems was almost always a Google search away.

We used Vite instead of Create React App as the build tool because Vite starts in under 300ms (CRA takes 10+ seconds), and hot module replacement (HMR) is near-instant — when we change a file, the browser updates in under one second without a full page reload.

Key frontend libraries:

| Package | Version | What we use it for |
|:--------|:--------|:-------------------|
| react | 18.2.0 | Core UI framework |
| react-router-dom | 6.8.0 | Client-side routing and navigation |
| axios | 1.6.0 | HTTP client for all API calls (with interceptors for JWT) |
| recharts | 3.7.0 | Charts for dashboard analytics (bar charts, line charts, pie charts) |
| leaflet + react-leaflet | 1.9.4 | Interactive maps for ambulance GPS tracking |
| tailwindcss | 3.3.6 | Utility-first CSS framework for styling |
| lucide-react | 0.294.0 | SVG icon library (600+ icons) |
| react-hot-toast | 2.4.1 | Toast notification popups for success/error messages |
| vite-plugin-pwa | 0.17.4 | PWA support — manifest, service worker, install prompt |

### 2.4.3 Database — MySQL 8.0

MySQL was chosen because:

1. **ACID compliance** — Every database transaction is Atomic, Consistent, Isolated, and Durable. This is critical for healthcare data (a half-saved session record could cause treatment errors) and financial data (a half-saved payment could cause billing discrepancies).

2. **Industry standard** — MySQL powers some of the world's largest applications including Facebook, Twitter, and YouTube. It is proven at scale.

3. **Django ORM support** — Django's ORM has first-class support for MySQL, so we can use the same Python code regardless of whether we are querying SQLite (in development) or MySQL (in production).

4. **InnoDB engine** — Supports row-level locking, foreign key constraints, and crash recovery, which are essential for data integrity.

During development, we used SQLite because it requires zero configuration — it stores the entire database in a single file (db.sqlite3). For production, we switch to MySQL by changing one line in Django's settings file.

### 2.4.4 Deployment — Docker and Nginx

**Docker** lets us package the backend, frontend, and database into separate containers, each with their own isolated environment. The advantage is reproducibility — if the system works on our development machine, it will work exactly the same way on any server in the world, because Docker includes all the dependencies inside the container.

Our Docker Compose setup creates four containers:

| Container | Image | Port | Purpose |
|:----------|:------|:-----|:--------|
| nginx | nginx:1.24 | 80, 443 | Reverse proxy, SSL termination, static file serving |
| frontend | node:18 | 3000 (internal) | React development server or built static files |
| backend | python:3.10 | 8000 (internal) | Django + DRF + Daphne (API + WebSocket) |
| db | mysql:8.0 | 3306 (internal) | MySQL database server |

**Nginx** serves as the entry point for all traffic. It:
- Terminates SSL (converts HTTPS to HTTP internally)
- Serves static files (JS, CSS, images) directly from disk with aggressive caching
- Forwards /api/* requests to the Django backend
- Forwards /ws/* requests to Daphne for WebSocket
- Adds security headers (X-Frame-Options, X-Content-Type-Options, Content-Security-Policy)

---
<div style="page-break-after: always;"></div>

## 2.5 User Roles and Access Control

### 2.5.1 RBAC Design

We implemented Role-Based Access Control (RBAC), meaning every user is assigned a single role, and their role determines exactly which API endpoints they can call and what data they can see.

The seven roles are:

**1. Admin:**
The hospital administrator. Has full access to everything. Can create and manage user accounts, configure system settings, view all reports and analytics, manage staff schedules, and access the audit log. This is the only role that can see the complete picture.

**2. Doctor:**
The nephrologist or attending physician. Can view patient records, add treatment notes during dialysis sessions, prescribe dialysis parameters (type, duration, blood flow rate), and view their assigned patients. Cannot access billing, staff management, or system settings.

**3. Nurse:**
The primary operator during dialysis. Can manage the treatment queue (check-in patients, assign machines, start and end sessions), record patient vitals (pre and post treatment), and update queue positions. Cannot access billing or staff management.

**4. Technician:**
Responsible for dialysis machines. Can view and update machine status, log maintenance activities, record cleaning after each session, and mark machines as out of service. Cannot access patient medical records or billing.

**5. Receptionist:**
Handles the front desk. Can register new patients, schedule and manage appointments, create and manage bills, process payments, and generate invoices. Cannot access clinical data (vitals, treatment notes).

**6. Patient:**
Self-service access. Can only view their own records — appointments, queue status, treatment history, vital sign trends, and pending bills. Can make payments against their own bills. Cannot access any other patient's data or any administrative functions.

**7. Driver:**
Ambulance driver. Can view assigned rides, update ride status (en route, arrived, returning), and stream GPS location from their mobile device. Cannot access any patient data, billing, or administrative functions.

### 2.5.2 Permission Matrix

This table shows the exact permission level for each role in each module:

| Module | Admin | Doctor | Nurse | Technician | Receptionist | Patient | Driver |
|:-------|:-----:|:------:|:-----:|:----------:|:------------:|:-------:|:------:|
| Dashboard | Full | Full | Full | Full | Full | Own | Own |
| Patient Records | CRUD | R, U | R, U | — | CRUD | Own | — |
| Queue Management | CRUD | R, U | CRUD | R, U | — | — | — |
| Sessions | CRUD | CRUD | CRUD | — | — | Own | — |
| Machines | CRUD | R | R, U | CRUD | R | — | — |
| Staff Management | CRUD | — | — | — | — | — | — |
| Billing | CRUD | — | — | — | CRUD | Own | — |
| Reports | All | View | Limited | Machine | Billing | — | — |
| Appointments | CRUD | R, U | R, U | — | CRUD | Own | — |
| Fleet | Full | — | — | — | R | — | Own |
| Audit Log | View | — | — | — | — | — | — |

Legend: R = Read, U = Update, CRUD = Full access (Create/Read/Update/Delete), Own = Own records only, — = No access

### 2.5.3 Two-Factor Authentication Requirements

| Role | 2FA Required? | Reason |
|:-----|:-------------|:-------|
| Admin | Mandatory | Has access to everything including user management and audit logs |
| Doctor | Mandatory | Accesses sensitive patient medical records |
| Nurse | Mandatory | Records vitals and manages sessions — medical data access |
| Technician | Mandatory | Machine management affects patient safety |
| Receptionist | Mandatory | Handles patient registration and billing — PII and financial access |
| Patient | Not required | Limited to viewing own records only, lower risk profile |
| Driver | Not required | Only accesses ride information and GPS — no patient data |

Staff accounts that have not set up 2FA are redirected to the 2FA setup page on every login attempt. They cannot access any other part of the system until 2FA is configured and verified with a valid TOTP code.

