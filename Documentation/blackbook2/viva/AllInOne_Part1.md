# DialysisTrack — ALL-IN-ONE Viva (Part 1: Q1–Q50)

### BCA Sem 6 | Tilak Maharashtra Vidyapeeth | 60 Marks External

---

## Q1. What is your project?
**DialysisTrack** is a web-based management system for **I Care Dialysis Centre**, Pune. It replaces paper registers/Excel with a centralised system having **9 modules** (Patients, Appointments, Queue, Machines, Billing, Staff, Ambulance Tracking, Clinical Data, Reports) and **6 user roles** (Admin, Doctor, Nurse, Technician, Receptionist, Patient).

---

## Q2. Why did you choose this project?
The centre had 5 problems: (1) Machine double-booking via Excel, (2) Manual billing errors with GST, (3) No live dashboard, (4) Paper patient records, (5) No ambulance tracking. My system automates all of this.

---

## Q3. What technology stack did you use?

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18 + Vite |
| Backend | Python Django 4.2 + Django REST Framework |
| Database | MySQL 8.0 |
| Auth | JWT (djangorestframework-simplejwt) |
| Real-time | Django Channels + WebSocket (Daphne ASGI) |
| Payments | Razorpay + UPI QR Code |
| Maps | Google Maps JavaScript API |
| Deployment | Docker + Nginx |

---

## Q4. What is Django? Why did you use it?
Django is a **Python web framework** following the **MVT pattern**. I used it for: built-in ORM (no raw SQL), built-in admin panel, strong security (SQL injection, CSRF, XSS protection), and Django REST Framework for building APIs easily.

---

## Q5. What is React.js? Why did you use it?
React is a **JavaScript library** by Meta for building UIs. Benefits: **component-based** architecture, creates **SPA** (no page reloads), uses **Virtual DOM** (updates only changed parts), and React Router for client-side navigation.

---

## Q6. What is REST API?
REST API lets frontend and backend communicate via HTTP: **GET** (fetch data), **POST** (create), **PUT** (update), **DELETE** (remove). React uses **Axios** to send requests to Django API. Data is exchanged in **JSON format** with JWT token in every request header.

---

## Q7. What is JWT? How does authentication work?
JWT = **JSON Web Token**. Stateless authentication — server stores nothing. On login: backend returns **Access Token** (~30 min) + **Refresh Token** (~1 day). Frontend sends Access Token in every request. When it expires, Axios interceptor auto-refreshes it using Refresh Token.

---

## Q8. What is RBAC? How many roles?
RBAC = **Role-Based Access Control**. 6 roles: Admin (full access), Doctor (patients + prescriptions), Nurse (queue + vitals), Technician (machines + sessions), Receptionist (registration + billing), Patient (own data only). Enforced at both **frontend** (sidebar filtering) and **backend** (403 Forbidden if wrong role).

---

## Q9. Explain the database design.
MySQL 8.0 in **Third Normal Form (3NF)**. Major tables: `users_user`, `patients_patient`, `appointments_appointment`, `dialysis_queue_queue`, `billing_bill`, `billing_payment`, `machines_dialysismachine`, `fleet_ambulance`, `fleet_ambulanceride`, `patients_labresult`. All linked via **Foreign Keys**.

---

## Q10. How does appointment conflict detection work?
When booking: backend queries DB for existing appointments on same machine + same date with overlapping time. If overlap found → **400 error** (booking rejected). If no overlap → saved. This runs on **server side** so it cannot be bypassed. Double-booking is technically impossible.

---

## Q11. How does billing work?
**Automatic.** When session is marked "Completed," system auto-generates bill: `Subtotal = Session + Medicine + Consultation`, `GST = Subtotal × 18%`, `Total = Subtotal + GST`. Emergency patients get 20% surcharge. Payment via **Cash**, **UPI QR code**, or **Razorpay**.

---

## Q12. Explain ambulance GPS tracking.
Receptionist dispatches ambulance → Driver opens app → Phone sends GPS coordinates via **WebSocket** (real-time connection) → Admin screen shows **Google Maps** with live marker. Status: Assigned → En Route → Arrived → Completed. If WebSocket fails, falls back to **HTTP polling** (every 3 sec).

---

## Q13. What is WebSocket? How is it different from HTTP?
HTTP = opens/closes for each request, one-way. WebSocket = stays open, **two-way** (both can send anytime). HTTP for normal requests (login, billing). WebSocket for real-time GPS tracking. I used **Django Channels + Daphne ASGI** server for WebSocket.

---

## Q14. What is WSGI vs ASGI?
**WSGI** = synchronous, handles normal HTTP (uses **Gunicorn**). **ASGI** = asynchronous, handles HTTP + WebSocket (uses **Daphne**). In my project: normal API → Gunicorn (WSGI), GPS tracking → Daphne (ASGI). Nginx routes to correct server.

---

## Q15. What is Django ORM?
ORM = **Object-Relational Mapping**. Write Python instead of SQL. `Patient.objects.filter(is_active=True)` becomes `SELECT * FROM patients_patient WHERE is_active=1`. Benefits: no raw SQL (prevents SQL injection), database-agnostic, auto-migrations.

---

## Q16. What UML diagrams did you draw?
9 diagrams: (1) Use Case — actors & functions, (2) Class — models & relationships, (3) Sequence — appointment booking flow, (4) Activity — session lifecycle, (5) Statechart — machine states, (6) Collaboration — billing workflow, (7) Component — software parts, (8) Deployment — Docker containers, (9) DFD — data movement.

---

## Q17. What testing did you perform?
5 types: (1) **Unit** — individual functions (GST calc, conflict validator), (2) **Integration** — API endpoints together, (3) **System** — end-to-end workflows, (4) **Security** — JWT tampering, SQL injection, role escalation, (5) **UAT** — client (Miss Varsha Pote) tested. **25 test cases** — all passed.

---

## Q18. How do you prevent SQL Injection?
Django ORM uses **parameterised queries** automatically. Even malicious input like `' OR 1=1; DROP TABLE --` is treated as plain text string, never executed as SQL. Tested during security testing — all payloads stored harmlessly.

---

## Q19. What is the feasibility study?
Checks if project is possible. **Technical** — all tools are open-source, team knew Python/JS. **Economic** — all free software, hosting Rs.800-2500/month only. **Operational** — simple role-based UI, works on tablets, minimal training. All three: **Feasible**.

---

## Q20. What SDLC model did you follow?
**Waterfall Model**: (1) Requirement Gathering — interviewed client, (2) System Analysis — ERD, DFD, FDD, (3) System Design — database, UML diagrams, (4) Implementation — Django + React coding, (5) Testing — 5 types, 25 test cases, (6) Deployment — Docker containers.

---

## Q21. Existing system vs Proposed system?
Paper files → MySQL database. Excel appointments → Auto-conflict detection. Manual billing → Auto-bill with GST. Cash only → Cash + UPI + Razorpay. WhatsApp ambulance → GPS tracking on Google Maps. No access control → JWT + RBAC. No reports → Auto-generated dashboard.

---

## Q22. Future enhancements?
(1) Direct machine integration via HL7/FHIR, (2) Biometric login, (3) Inventory management for consumables, (4) AI/ML predictive analytics, (5) Multi-branch support, (6) IoT environment monitoring.

---

## Q23. What is Docker? Why did you use it?
Docker **containerises** the app with all dependencies. Same container runs identically everywhere. My docker-compose has **5 containers**: Nginx, Django (Gunicorn), Daphne (ASGI), MySQL, Redis. One command `docker-compose up` starts everything.

---

## Q24. What is Kt/V? Explain clinical data module.
Clinical module manages: (1) **Infection screening** — Hep B/C, HIV (Hep B positive = isolated machine), (2) **Prescriptions** — doctor-defined treatment parameters, (3) **Lab results** — blood tests. **Kt/V** = dialysis adequacy metric (K=clearance, t=time, V=fluid volume). Target ≥ 1.2. Auto-calculated using **Daugirdas formula** from BUN values. **URR** = (Pre-Post BUN)/Pre × 100, target ≥ 65%.

---

## Q25. How do you run the project?
Backend: `cd backend && python manage.py runserver` (port 8000). Frontend: `cd frontend && npm run dev` (port 3000). Production: `docker-compose up -d` starts all 5 containers.

---

## Q26. What is Two-Factor Authentication (2FA)?
User needs **two things**: password (something they know) + OTP from Google Authenticator (something they have). Uses **TOTP algorithm** — code changes every 30 seconds. Backend uses `django-otp`. QR code generated during setup. 10 backup codes for recovery. **Mandatory for all staff**, patients exempt.

---

## Q27. What is CORS?
**Cross-Origin Resource Sharing.** Browser blocks requests between different origins (React on :3000, Django on :8000). I configured `django-cors-headers` to allow `localhost:3000` and `localhost:5173`. Without this, no API call works.

---

## Q28. What is Middleware in Django?
Code that processes **every request/response** like a security checkpoint. I use 7: CorsMiddleware, SecurityMiddleware, SessionMiddleware, CsrfViewMiddleware, AuthenticationMiddleware, OTPMiddleware, ClickjackingMiddleware. **Order matters** — CORS must be first.

---

## Q29. What is a Serializer in DRF?
Converts Python objects → JSON (**serialization**) and JSON → Python objects (**deserialization**). Example: `UserSerializer` with `password = write_only=True` means password is accepted but **never returned** in API responses. `read_only_fields` prevent modification.

---

## Q30. ForeignKey vs OneToOneField vs ManyToManyField?
**ForeignKey** (1:N) — one Patient has many Bills. **OneToOneField** (1:1) — one User has one Patient profile. **ManyToManyField** (M:N) — not used in project. `on_delete=CASCADE` = delete children. `on_delete=SET_NULL` = set to NULL, preserve record.

---

## Q31. What is on_delete in models?
Tells Django what happens when parent is deleted. **CASCADE** = delete children too (Bill deleted when Patient deleted). **SET_NULL** = set field to NULL (doctor leaves, prescriptions preserved). **PROTECT** = prevent deletion if children exist.

---

## Q32. Why did you override the save() method?
To add **automatic calculations**. Bill model: auto-calculates `subtotal`, `GST (18%)`, `total_amount`, and generates `bill_number` on every save. LabResult model: auto-flags critical results (Potassium > 6.0 or Hemoglobin < 8.0).

---

## Q33. What is PWA?
**Progressive Web App** — web app that acts like native app. Can be installed on phone's home screen, full-screen mode, basic offline caching. DialysisTrack uses `vite-plugin-pwa`. Useful for nurses (tablets) and drivers (phones). Data operations still need internet.

---

## Q34. What is Axios? Why not fetch()?
Both make HTTP requests. Axios is better: auto JSON parsing, **interceptors** (auto-attach JWT token, auto-refresh expired token), better error handling (rejects on 4xx/5xx), built-in cancel. Interceptors are the main reason — user never notices token refresh.

---

## Q35. What is React Context?
Shares data across **all components** without prop drilling. I created **AuthContext** storing: `user`, `isAuthenticated`, `login()`, `logout()`. Any component calls `const { user } = useAuth()` to check role and permissions.

---

## Q36. What is React Router?
Handles **client-side navigation** in SPA. Changes URL without page reload. Two route types: **PublicRoute** (/login, /register) and **ProtectedRoute** (/dashboard, /patients). ProtectedRoute checks: (1) is authenticated? (2) has module access? (3) has 2FA setup?

---

## Q37. What is AbstractUser? Why extend it?
Django's built-in User has username, email, password. I needed `role`, `department`, `phone_number`. Extended it: `class User(AbstractUser)` with `ROLE_CHOICES` (7 roles). Set `AUTH_USER_MODEL = 'users.User'` in settings. Must be done **before first migration**.

---

## Q38. What is Nginx?
Web server and **reverse proxy**. Does 3 things: (1) Routes HTTP → Gunicorn, WebSocket → Daphne, (2) SSL/HTTPS termination, (3) Serves static files (React JS/CSS) directly without hitting Django. Django's runserver is single-threaded, Nginx handles thousands of connections.

---

## Q39. What is .env file?
Stores **secrets** (SECRET_KEY, DB_PASSWORD, API keys) that should never be in Git. Read using `python-decouple`: `SECRET_KEY = config('SECRET_KEY')`. Listed in `.gitignore`. Same code works in dev (`DEBUG=True`) and production (`DEBUG=False`) by changing .env.

---

## Q40. Explain complete login flow.
User enters email + password → React POSTs to `/api/users/login/` → Django validates credentials → If wrong: 401 error. If correct and **no 2FA needed** (patient/driver): returns JWT tokens → stored in localStorage → redirect to dashboard. If **2FA needed** (staff): returns `requires_2fa: true` → OTP screen → user enters 6-digit code → verified → JWT tokens issued → dashboard.

---

## Q41. What is manage.py? Commands used?
Django's command-line utility. Commands: `runserver` (start server), `makemigrations` (create migration files), `migrate` (apply to DB), `createsuperuser` (create admin), `shell` (Python shell), `collectstatic` (gather static files), `test` (run tests), `flush` (clear data).

---

## Q42. What are Django Migrations?
Track **database schema changes**. Change model → run `makemigrations` (creates migration file) → run `migrate` (executes SQL ALTER TABLE). Never write raw SQL. Version-controlled in Git. Can rollback. Keeps complete history of schema changes.

---

## Q43. How does Razorpay integration work?
Session completed → bill auto-generated. Payment options: **Cash** (mark as paid), **UPI** (generate QR code with `upi://pay?pa=...&am=3540.00`, patient scans), **Razorpay** (backend creates Order → frontend opens checkout popup → payment success → backend **verifies signature** → bill marked paid).

---

## Q44. What is Django Admin panel?
**Built-in web interface** at `/admin/`. Auto-generated from models. Used for: user management, password resets, debugging, machine inventory. Only **Super Admin** (created via `createsuperuser`) can access. Models registered in `admin.py`: `admin.site.register(Patient)`.

---

## Q45. Stateless vs Stateful authentication?
**Stateful** (session-based) = server stores session in memory, needs DB lookup every request. **Stateless** (JWT — my project) = server stores nothing, token contains all info, any server can verify independently. JWT is better for SPAs and REST APIs, easier to scale with Docker.

---

## Q46. GET vs POST requests?
**GET** = fetch data, data in URL, cacheable, idempotent. **POST** = create data, data in body, more secure, not cacheable. GET for patient lists, reports. POST for login, registration, appointment booking, payments.

---

## Q47. What is SPA?
**Single Page Application** — page never reloads. Server sends only JSON data, not full HTML. React Router swaps components based on URL. Faster than traditional sites. Examples: Gmail, Facebook, DialysisTrack. Sidebar/header/footer never reload.

---

## Q48. What is @property decorator?
Creates a **computed field** — method accessed like a field (no parentheses). `patient.is_infection_positive` returns True if any infection is positive. `patient.requires_isolated_machine` returns True if Hep B positive. `labresult.urr` calculates URR from BUN values. **Never stored in DB** — computed fresh every time.

---

## Q49. What security measures did you implement?
JWT auth, TOTP 2FA (mandatory for staff), RBAC (6 roles), password hashing (PBKDF2+SHA256), SQL injection prevention (ORM), CSRF middleware, XSS protection (React auto-escapes), CORS (allowed origins only), HTTPS (Nginx SSL), HSTS, Clickjacking protection, Token blacklisting, Backup codes, Environment variables.

---

## Q50. What fact-finding techniques did you use?
4 techniques: (1) **Interviews** — with Miss Varsha Pote (Senior Technician), (2) **Observation** — visited centre, watched workflows, (3) **Document Analysis** — studied paper forms, fee schedules, (4) **Questionnaire** — distributed to 3 admin staff to prioritize features.

---

## Q51. How much AI did you use in this project?
I used AI (ChatGPT/Copilot) as a **productivity tool** for generating boilerplate code, debugging errors, and creating dummy data. However, the **core architecture, database design, and business logic** (like the appointment conflict detection and clinical metrics) were entirely designed by me based on the client's requirements.

---

## Q52. Explain the project's file structure.
Two main folders: **Backend** (Django) and **Frontend** (React).
**Backend:** `manage.py` (server entry), `settings.py` (config), `urls.py` (routing). Each app has `models.py` (DB tables), `views.py` (API logic), and `serializers.py` (JSON conversion).
**Frontend:** `package.json` (dependencies), `main.jsx` (entry), `AppRouter.jsx` (routes). Folders for `pages/` (full screens) and `components/` (reusable UI).

---

## Q53. How would you introduce this project smartly? (Elevator Pitch)
"My project, DialysisTrack, automates the complex workflow of a dialysis centre. Unlike generic hospital apps, it handles dialysis-specific needs like **Smart Appointment Booking** to mathematically prevent machine double-booking, real-time **Clinical Vitals Monitoring**, auto-calculated **GST Billing** with UPI, and live **WebSocket GPS Tracking** for ambulances. It uses a modern React + Django + MySQL stack with Role-Based Access Control."

---

## Q54. Why did you choose a Senior Technician (Miss Varsha Pote) as the client?
While the owner handles finances, the **Senior Technician actually runs the daily floor operations**. She assigns nurses, schedules machines, and manages the queue. Gathering requirements from her ensured the system solves **real operational pain points** (like finding paper reports and double-booking machines) instead of just high-level administration.

---

## Q55. Explain the full end-to-end workflow of the system.
1. **Registration:** Receptionist registers patient (React → Django `Patient` model).
2. **Booking:** Books a session; system prevents machine conflicts.
3. **Session Start:** Patient arrives, Nurse marks machine "In Use" on the queue.
4. **Clinical Data:** Doctor/Nurse records vitals (BP, weight) during the 4 hours.
5. **Session End:** Technician ends session → Auto-generates GST bill.
6. **Payment:** Patient pays via dynamically generated UPI QR.
7. **Discharge:** Ambulance dispatched with live GPS tracking on maps.

---

*Continued in Part 2 (Q56–...)*
