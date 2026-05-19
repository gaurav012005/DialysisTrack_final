# DialysisTrack — Additional Important Viva Questions

### BCA Semester 6 | Tilak Maharashtra Vidyapeeth | 60 Marks External
### (Supplement to Viva_Questions_Answers.md)

---

## Q26. What is Two-Factor Authentication (2FA)? How did you implement it?

**Answer:**

Two-Factor Authentication means the user needs **two things** to login — something they **know** (password) and something they **have** (phone with authenticator app).

**How it works in DialysisTrack:**

1. Staff user logs in with email + password (first factor).
2. System asks for a **6-digit OTP code** from their authenticator app like Google Authenticator (second factor).
3. The code changes every **30 seconds** — this is called **TOTP (Time-Based One-Time Password)**.
4. If the code is correct, the user gets a JWT token and can access the system.

**Implementation:**
- Backend uses `django-otp` library with the **TOTP algorithm**.
- During setup, the server generates a **QR code** — the user scans it with Google Authenticator.
- 10 **backup codes** are generated for recovery if the user loses their phone.
- 2FA is **mandatory for all staff** (Admin, Doctor, Nurse, Technician, Receptionist).
- Patients and Drivers are exempt from 2FA.

---

## Q27. What is CORS? Why is it needed?

**Answer:**

CORS stands for **Cross-Origin Resource Sharing**. It is a security feature built into web browsers.

**Problem:** My React frontend runs on `http://localhost:3000` and Django backend runs on `http://localhost:8000`. These are different origins (different ports). By default, the browser **blocks** requests from one origin to another for security.

**Solution:** I configured CORS in Django settings using `django-cors-headers`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

This tells the backend: "Allow requests from these frontend URLs." Without this, the React app would get a CORS error and no API call would work.

---

## Q28. What is Middleware in Django? Name the middlewares you used.

**Answer:**

Middleware is a **layer of code** that processes every request before it reaches the view, and every response before it reaches the client. Think of it like a **security checkpoint**.

Middlewares I used:

| Middleware | Purpose |
|-----------|---------|
| `CorsMiddleware` | Handles Cross-Origin requests from React frontend |
| `SecurityMiddleware` | Adds security headers (HSTS, XSS protection) |
| `SessionMiddleware` | Manages user sessions |
| `CsrfViewMiddleware` | Protects against Cross-Site Request Forgery attacks |
| `AuthenticationMiddleware` | Attaches the logged-in user to every request |
| `OTPMiddleware` | Supports Two-Factor Authentication verification |
| `ClickjackingMiddleware` | Prevents the site from being loaded inside an iframe |

The order matters — CORS must be first so that it can add headers before other middlewares process the request.

---

## Q29. What is a Serializer in Django REST Framework?

**Answer:**

A Serializer converts complex data (like Django model objects) into **JSON format** (for the API response) and also converts incoming JSON data back into model objects (for saving to the database).

**It does two jobs:**
1. **Serialization** — Python Object to JSON (when sending data to frontend)
2. **Deserialization** — JSON to Python Object (when receiving data from frontend)

**Example from my project — UserSerializer:**

```python
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'first_name', 'last_name')
```

- `write_only=True` on password means it can be **sent to** the server but will **never be returned** in API responses — this protects the password.
- `read_only_fields = ('id', 'date_joined')` means these fields cannot be modified by the user.

---

## Q30. What is the difference between `ForeignKey`, `OneToOneField`, and `ManyToManyField`?

**Answer:**

| Relationship | Meaning | Example in DialysisTrack |
|-------------|---------|-------------------------|
| **ForeignKey** (One-to-Many) | One parent can have many children | One Patient can have **many** Bills |
| **OneToOneField** (One-to-One) | One parent has exactly one child | One User has exactly **one** Patient profile |
| **ManyToManyField** (Many-to-Many) | Both sides can have many | Not used in my project, but example: one Student can enroll in many Courses, and one Course can have many Students |

**Code example:**
```python
# One Patient can have MANY bills (ForeignKey)
patient = models.ForeignKey(Patient, on_delete=models.CASCADE)

# One User has exactly ONE patient profile (OneToOneField)
user = models.OneToOneField(User, on_delete=models.SET_NULL)
```

`on_delete=CASCADE` means: if the patient is deleted, delete all their bills too.
`on_delete=SET_NULL` means: if the user is deleted, set this field to NULL (don't delete the patient record).

---

## Q31. What is `on_delete` in Django models? Explain CASCADE vs SET_NULL.

**Answer:**

`on_delete` tells Django what to do when the **parent record is deleted**.

| Option | What happens | When to use |
|--------|-------------|-------------|
| `CASCADE` | Delete child records too | Bill is deleted when Patient is deleted |
| `SET_NULL` | Set the field to NULL | If a doctor leaves, don't delete their prescriptions — just remove the doctor reference |
| `PROTECT` | Prevent deletion of parent | Cannot delete a patient who has active appointments |
| `SET_DEFAULT` | Set to a default value | Rarely used |

In my project:
- `Bill → Patient` uses **CASCADE** — if a patient is removed, their bills are also removed.
- `Patient → User` uses **SET_NULL** — if the login account is deleted, the patient medical record is preserved with `user=NULL`.

---

## Q32. What is the `save()` method in your models? Why did you override it?

**Answer:**

The `save()` method is called every time a record is saved to the database. I **overrode** (customized) it to add automatic calculations.

**Example 1 — Bill model:**
```python
def save(self, *args, **kwargs):
    self.subtotal = (self.dialysis_sessions * self.session_cost) + self.medicine_cost + self.consultation_cost
    self.tax_amount = self.subtotal * Decimal('0.18')  # 18% GST
    self.total_amount = self.subtotal + self.tax_amount - self.discount
    if not self.bill_number:
        self.bill_number = f"DT{datetime.now().strftime('%Y%m%d')}{random.randint(100,999)}"
    super().save(*args, **kwargs)
```

This means every time a bill is saved, the **GST and total are auto-calculated**. The receptionist never has to manually compute the total.

**Example 2 — LabResult model:**
```python
def save(self, *args, **kwargs):
    if self.is_potassium_critical or self.is_hemoglobin_low:
        self.is_critical = True
    super().save(*args, **kwargs)
```

This auto-flags **critical lab results** (Potassium > 6.0 or Hemoglobin < 8.0) for immediate clinical attention.

---

## Q33. What is Progressive Web App (PWA)? Is your app a PWA?

**Answer:**

A PWA is a web application that behaves like a **native mobile app**. Users can:
- **Install it** on their phone's home screen.
- Use it in **full-screen mode** (no browser address bar).
- Get basic **offline caching** of static files.

Yes, DialysisTrack is configured as a PWA using `vite-plugin-pwa`. This is especially useful for:
- **Nurses** who use tablets on the treatment floor — they can install the app and use it like a native app.
- **Drivers** who access the Driver Dashboard on their phones for GPS tracking.

However, data operations (like saving vitals or updating queue) still need an active internet connection because the app must communicate with the backend.

---

## Q34. What is Axios? Why use Axios instead of `fetch()`?

**Answer:**

Both Axios and `fetch()` are used to make HTTP requests from the frontend. I chose **Axios** because:

| Feature | fetch() | Axios |
|---------|---------|-------|
| **Auto JSON parsing** | Need to call `.json()` manually | Automatic |
| **Interceptors** | Not available | Can intercept every request/response |
| **Error handling** | Only rejects on network errors | Rejects on 4xx/5xx HTTP errors too |
| **Request cancel** | Needs AbortController | Built-in cancel token |
| **Browser support** | Modern browsers only | Works everywhere |

**Interceptors are the main reason.** In DialysisTrack, I have an Axios interceptor that:
1. Automatically attaches the JWT token to every API request.
2. If a request fails with **401 (token expired)**, it automatically uses the **refresh token** to get a new access token and retries the failed request — the user never notices.

---

## Q35. What is React Context? How do you manage authentication state?

**Answer:**

React Context is a way to share data across **all components** without passing props manually at every level (called "prop drilling").

In DialysisTrack, I created an **AuthContext** that stores:
- `user` — the logged-in user's details (name, role, email)
- `isAuthenticated` — whether user is logged in or not
- `login()` — function to log the user in
- `logout()` — function to log the user out

**How it works:**
```jsx
// In AuthContext.jsx — wraps the entire app
<AuthProvider>
  <AppRouter />
</AuthProvider>

// In any component — access auth data
const { user, isAuthenticated } = useAuth();

if (user.role === 'admin') {
  // show admin features
}
```

This way, **every page and component** can check who is logged in and what their role is, without fetching the user from the API again.

---

## Q36. What is React Router? How does client-side routing work?

**Answer:**

React Router handles **navigation** in a Single Page Application. Instead of loading a new HTML page from the server on every click, React Router:

1. Changes the **URL in the browser** (e.g., `/dashboard` to `/patients`).
2. **Renders a different React component** based on the URL.
3. The page **does not reload** — only the content area changes.

**In DialysisTrack, I have two types of routes:**

- **Public Routes** — `/login`, `/forgot-password`, `/register` — accessible without login.
- **Protected Routes** — `/dashboard`, `/patients`, `/billing` — require authentication.

```jsx
<Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
<Route path="/patients" element={
  <ProtectedRoute requiredModule="patients">
    <Patients />
  </ProtectedRoute>
} />
```

The `ProtectedRoute` component checks:
1. Is user authenticated? If no → redirect to `/login`.
2. Does user have access to this module? If no → show "Access Denied".
3. Has staff user set up 2FA? If no → redirect to `/2fa-setup`.

---

## Q37. What is `AbstractUser` in Django? Why did you extend it?

**Answer:**

Django comes with a built-in User model that has fields like username, email, password, first_name, last_name. But my project needed **extra fields** like `role`, `department`, `phone_number`.

So I created a **custom User model** by extending `AbstractUser`:

```python
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('nurse', 'Nurse'),
        ('technician', 'Technician'),
        ('receptionist', 'Receptionist'),
        ('patient', 'Patient'),
        ('driver', 'Driver'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=15, blank=True)
    department = models.CharField(max_length=100, blank=True)
```

I also set `AUTH_USER_MODEL = 'users.User'` in settings.py to tell Django: "Use my custom User model instead of the default one."

This is the **recommended way** to add fields to the user model — you must do it **before the first migration**, otherwise it becomes very difficult to change later.

---

## Q38. What is Nginx? What role does it play in your deployment?

**Answer:**

Nginx (pronounced "engine-x") is a **web server and reverse proxy**.

**In DialysisTrack, Nginx does 3 things:**

1. **Reverse Proxy** — It receives all incoming requests from the browser and forwards them:
   - Normal HTTP requests → go to **Gunicorn (Django WSGI server)**
   - WebSocket requests → go to **Daphne (Django ASGI server)**

2. **SSL Termination** — In production, Nginx handles HTTPS encryption. The backend containers communicate over plain HTTP internally.

3. **Static File Server** — Nginx directly serves React's compiled JavaScript, CSS, and images without hitting Django at all. This is much faster.

**Why not just use Django directly?**
Django's built-in server (`runserver`) is for development only — it is **single-threaded** and not secure. Nginx can handle **thousands of concurrent connections** efficiently.

---

## Q39. What is the `.env` file? Why do you use environment variables?

**Answer:**

The `.env` file stores **sensitive configuration** like passwords, secret keys, and API keys that should **never be committed to Git**.

My `.env` file contains:
```
SECRET_KEY=my-super-secret-django-key
DB_NAME=dialysistrack_db
DB_USER=root
DB_PASSWORD=mypassword
DB_HOST=localhost
DEBUG=True
```

In `settings.py`, I read these values using `python-decouple`:
```python
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=True, cast=bool)
```

**Why?**
- **Security** — If someone sees your code on GitHub, they cannot access your database or forge JWT tokens.
- **Flexibility** — Same code works in development (`DEBUG=True`) and production (`DEBUG=False`) just by changing the `.env` file.
- The `.env` file is listed in `.gitignore` so it is never pushed to the repository.

---

## Q40. Explain the complete login flow of your application step by step.

**Answer:**

1. User opens `http://localhost:3000/login` → React renders the **Login page**.
2. User enters email and password → clicks "Login".
3. React sends a **POST request** to `http://localhost:8000/api/users/login/` with `{username, password}`.
4. Django's `LoginSerializer` validates the credentials using `authenticate()`.
5. If credentials are wrong → return **401 Unauthorized**.
6. If credentials are correct, Django checks if the user's role requires **2FA** (admin, doctor, nurse, technician, receptionist).
7. **If 2FA is NOT required** (patient, driver):
   - Django generates **JWT Access + Refresh tokens**.
   - Returns tokens + user data to React.
   - React stores tokens in `localStorage` and user in `AuthContext`.
   - Redirects to `/dashboard`.
8. **If 2FA IS required:**
   - Django returns `{requires_2fa: true}` without issuing tokens yet.
   - React shows the **OTP verification page**.
   - User enters the 6-digit code from Google Authenticator.
   - React sends the code to `/api/two-factor/verify-login/`.
   - If correct → Django issues JWT tokens → redirect to dashboard.
   - If wrong → show error "Invalid code".

---

## Q41. What is `manage.py` in Django? What commands have you used?

**Answer:**

`manage.py` is Django's **command-line utility**. It helps you manage your project without writing extra scripts.

**Commands I used:**

| Command | Purpose |
|---------|---------|
| `python manage.py runserver` | Start the development server |
| `python manage.py makemigrations` | Create migration files when models change |
| `python manage.py migrate` | Apply migrations (create/update database tables) |
| `python manage.py createsuperuser` | Create an admin user for Django Admin panel |
| `python manage.py shell` | Open Python shell with Django loaded |
| `python manage.py collectstatic` | Gather all static files for production |
| `python manage.py test` | Run unit tests |
| `python manage.py flush` | Clear all data from the database |

---

## Q42. What are Django Migrations? Why are they important?

**Answer:**

Migrations are Django's way of **tracking changes** to your database schema.

**Workflow:**
1. I change a model (e.g., add a new field `hepatitis_b_status` to Patient).
2. I run `python manage.py makemigrations` → Django creates a migration file like `0003_add_hepatitis_field.py`.
3. I run `python manage.py migrate` → Django executes the SQL to **ALTER the table** and add the new column.

**Why important:**
- I **never write raw SQL** like `ALTER TABLE` — Django handles it automatically.
- Migrations are **version-controlled** (stored in Git) — every team member gets the same database structure.
- I can **rollback** to a previous migration if something goes wrong.
- It keeps a **history** of every change made to the database schema.

---

## Q43. What is Razorpay integration? How does the payment flow work?

**Answer:**

Razorpay is an Indian **payment gateway** that allows accepting online payments via credit cards, debit cards, UPI, net banking, and wallets.

**Payment flow in DialysisTrack:**

1. Session is completed → Bill is auto-generated with GST.
2. Receptionist clicks "Pay Now" on the billing page.
3. She selects payment method:
   - **Cash** → Simply marks as "Paid" and records timestamp.
   - **UPI** → System generates a **QR code** using the UPI deep link URL (`upi://pay?pa=...&am=3540.00`). Patient scans it with Google Pay/PhonePe.
   - **Online (Razorpay)** → Backend calls the Razorpay API to create an **Order**. Frontend opens the Razorpay checkout popup. After successful payment, Razorpay sends a **signature**. Backend **verifies the signature** to confirm the payment is genuine.

4. Payment record is saved in the `billing_payment` table with the transaction ID.
5. Bill status changes from "Pending" to "Paid".

---

## Q44. What is the Django Admin panel? How is it used in your project?

**Answer:**

Django Admin is a **built-in web interface** that Django auto-generates from your models. It allows super admins to directly view, add, edit, and delete records in the database through a browser.

**In DialysisTrack, Django Admin is used for:**
- Creating and managing **user accounts** (especially for password resets).
- Viewing raw database records for **debugging**.
- Managing **machine inventory** directly.
- Checking **audit logs** and system data.

It is accessible at `http://localhost:8000/admin/` and only the **Super Admin** (created via `createsuperuser`) can access it.

I registered my models in `admin.py` to make them visible:
```python
from django.contrib import admin
from .models import Patient
admin.site.register(Patient)
```

---

## Q45. What is the difference between Stateless and Stateful authentication?

**Answer:**

| Feature | Stateful (Session-based) | Stateless (JWT-based — my project) |
|---------|--------------------------|-------------------------------------|
| **Storage** | Server stores session data in memory/database | Server stores nothing — token contains all info |
| **Token** | Session ID cookie | JWT token in Authorization header |
| **Scalability** | Hard — session data must be shared across servers | Easy — any server can verify the token independently |
| **Logout** | Delete session from server | Blacklist the token or let it expire |
| **Speed** | Needs database lookup every request | Just verify the token signature (no DB query) |

I used **JWT (stateless)** because:
- React is a SPA — it does not use traditional server-rendered pages.
- JWT works better with REST APIs.
- It is easier to scale — no need to share sessions between Docker containers.

---

## Q46. What is the difference between `GET` and `POST` requests?

**Answer:**

| Feature | GET | POST |
|---------|-----|------|
| **Purpose** | Fetch/retrieve data | Send/create data |
| **Data location** | In the URL (query parameters) | In the request body |
| **Security** | Less secure (data visible in URL) | More secure (data in body) |
| **Caching** | Can be cached by browser | Never cached |
| **Idempotent** | Yes (same request gives same result) | No (each request may create new data) |
| **Example** | `GET /api/patients/` — List patients | `POST /api/patients/` — Register new patient |

In DialysisTrack, **GET** is used for fetching patient lists, reports, and dashboard data. **POST** is used for login, patient registration, appointment booking, and payment processing.

---

## Q47. What is SPA (Single Page Application)? How is it different from traditional websites?

**Answer:**

| Feature | Traditional Website | SPA (DialysisTrack) |
|---------|-------------------|---------------------|
| **Page Load** | Full page reload on every click | Only content area changes, no reload |
| **Server** | Server sends complete HTML pages | Server sends only JSON data |
| **Speed** | Slower (re-downloads header, footer, CSS) | Faster (downloads data only) |
| **Navigation** | Browser makes new request | React Router swaps components |
| **Example** | WordPress, college websites | Gmail, Facebook, DialysisTrack |

In DialysisTrack, when you click "Patients" in the sidebar, the browser URL changes to `/patients`, React Router renders the Patients component, and an API call fetches patient data — but the **sidebar, header, and footer never reload**.

---

## Q48. What is `@property` decorator in Python? How did you use it?

**Answer:**

The `@property` decorator lets you create a method that can be accessed like a **field** (no parentheses needed). It is a **computed property** — it calculates its value on the fly.

**Examples from my Patient model:**

```python
@property
def is_infection_positive(self):
    return (self.hepatitis_b_status == 'positive' or 
            self.hepatitis_c_status == 'positive' or 
            self.hiv_status == 'positive')

@property
def requires_isolated_machine(self):
    return self.hepatitis_b_status == 'positive'
```

**Usage:** `patient.is_infection_positive` (no parentheses — looks like a field, but it is computed every time you access it).

**Another example — URR calculation in LabResult:**
```python
@property
def urr(self):
    if self.pre_dialysis_bun and self.post_dialysis_bun:
        return round((self.pre_dialysis_bun - self.post_dialysis_bun) / self.pre_dialysis_bun * 100, 1)
    return None
```

This means URR is **never stored** in the database — it is calculated fresh every time from the BUN values.

---

## Q49. What security measures have you implemented in the project?

**Answer:**

| Security Feature | Implementation |
|-----------------|----------------|
| **Authentication** | JWT tokens (access + refresh) |
| **2FA** | TOTP-based Two-Factor Authentication for all staff |
| **RBAC** | 6 roles with different permissions; enforced at backend |
| **Password Hashing** | Django uses **PBKDF2** algorithm with SHA256 — passwords are never stored as plain text |
| **SQL Injection Prevention** | Django ORM uses parameterised queries |
| **CSRF Protection** | Django's CsrfViewMiddleware |
| **XSS Protection** | React auto-escapes HTML by default; Django sets X-XSS-Protection header |
| **CORS** | Only allowed frontend origins can call the API |
| **HTTPS** | SSL/TLS via Nginx in production |
| **HSTS** | Forces browsers to always use HTTPS (in production) |
| **Clickjacking Protection** | `X-Frame-Options: DENY` header prevents iframe embedding |
| **Token Blacklisting** | Used refresh tokens are blacklisted to prevent reuse |
| **Backup Codes** | 10 one-time backup codes for 2FA recovery |
| **Environment Variables** | Secrets stored in `.env`, never in code |

---

## Q50. What fact-finding techniques did you use for requirements gathering?

**Answer:**

I used **4 techniques:**

1. **Interviews** — Conducted structured interviews with **Miss Varsha Pote** (Senior Technician at I Care Dialysis Centre). She explained day-to-day workflows, pain points, and requirements.

2. **Observation** — Visited the centre and physically observed operations — how patients check in, how nurses record vitals at bedside (confirmed need for tablet-friendly interface), how billing is done manually.

3. **Document Analysis** — Collected and studied existing paper forms — patient registration forms, appointment sheets, billing formats, fee schedules. This gave exact field names and calculation rules.

4. **Questionnaire** — Distributed a questionnaire to 3 admin staff asking them to rate the severity of problems and prioritize features. This helped decide which modules to build first.

---

## Bonus Theory Questions (Commonly Asked in BCA Viva)

### B6. What is the difference between a Framework and a Library?
- **Library** (e.g., React) — You call it. You are in control of the flow. You decide when and where to use it.
- **Framework** (e.g., Django) — It calls your code. It provides the overall structure and you fill in the details.

**In simple terms:** With a library, you are the boss. With a framework, the framework is the boss.

### B7. What is JSON?
JSON (JavaScript Object Notation) is a lightweight format for sending data between frontend and backend. Example:
```json
{
  "patient_id": "P-001",
  "first_name": "Rahul",
  "blood_type": "B+",
  "is_emergency": false
}
```
All API responses in DialysisTrack are in JSON format.

### B8. What is the difference between Authentication and Authorization?
- **Authentication** = "Who are you?" → Login with email and password.
- **Authorization** = "What can you do?" → A Nurse can record vitals but cannot delete a patient.

In DialysisTrack, **JWT handles authentication** and **RBAC handles authorization**.

### B9. What is Git? Why did you use it?
Git is a **version control system** that tracks every change made to the code. Benefits:
- Multiple developers can work on the same project without conflicts.
- Every change is recorded — I can go back to any previous version if something breaks.
- `.gitignore` ensures sensitive files (`.env`, `node_modules/`) are not uploaded.

### B10. What is an API endpoint?
An API endpoint is a specific **URL path** that accepts requests and returns data. Examples from DialysisTrack:
- `GET /api/patients/` — Returns all patients
- `POST /api/billing/bills/` — Creates a new bill
- `PUT /api/patients/5/` — Updates patient with ID 5
- `DELETE /api/staff/3/` — Deactivates staff member with ID 3

### B11. What is the difference between `localStorage` and `sessionStorage`?
| Feature | localStorage | sessionStorage |
|---------|-------------|----------------|
| **Lifetime** | Permanent (until manually cleared) | Until browser tab is closed |
| **Use in project** | JWT tokens, user data | 2FA verification flag |
| **Scope** | All tabs of same origin | Only the current tab |

### B12. What is Docker Compose?
Docker Compose is a tool to define and run **multiple Docker containers** together. I wrote a `docker-compose.yml` file that defines all 5 services (Nginx, Django, Daphne, MySQL, Redis). One command `docker-compose up` starts everything. One command `docker-compose down` stops everything.

### B13. What is Redis? Why is it used in your project?
Redis is an **in-memory data store** — extremely fast because it stores data in RAM, not on disk. In DialysisTrack, Redis is the **message broker** for Django Channels. When the driver sends a GPS update via WebSocket, Redis delivers the message to all connected tracking screens instantly.

### B14. What is Pagination? Why is it needed?
If there are 500 patients, loading all of them at once would be slow. Pagination splits data into **pages** (e.g., 20 patients per page). I configured this in Django settings:
```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```
The API returns `?page=1`, `?page=2`, etc.

### B15. What is the difference between `==` and `===` in JavaScript?
- `==` (loose equality) — compares values after type conversion: `"5" == 5` is `true`.
- `===` (strict equality) — compares both value AND type: `"5" === 5` is `false`.
- Always use `===` in JavaScript to avoid unexpected bugs.

---

> **Examiner Tip:** If the examiner asks a question you don't know, say: "I have not implemented this specific feature in my project, but I understand the concept." Then explain what you know. Never stay silent.

---

*Prepared for: BCA Semester 6 External Viva — Tilak Maharashtra Vidyapeeth, Pune*
*Project: DialysisTrack — Dialysis Centre Management System*
