# Backend: Users Module (`users/`)

## 📁 Folder Structure

```
users/
├── __init__.py
├── models.py          # Custom User model (extends AbstractUser)
├── views.py           # Login, Register, Profile, Logout & User CRUD
├── urls.py            # URL routing for auth & user endpoints
├── serializers.py     # User data serialization
├── permissions.py     # Hospital Role-Based Access Control (RBAC)
├── management/        # Custom Django management commands
├── tests.py           # Unit tests
├── admin.py           # Django admin registration
└── migrations/        # Database migrations
```

---

## 🔧 How It Works

### 1. Custom User Model (`models.py`)

The system extends Django's built-in `AbstractUser` to add hospital-specific fields.

**Model: `User`**

| Field | Type | Description |
|-------|------|-------------|
| `role` | CharField (choices) | One of: `admin`, `doctor`, `nurse`, `technician`, `receptionist`, `patient`, `driver` |
| `department` | CharField | Hospital department the staff belongs to |
| `phone_number` | CharField | Contact number |
| `address` | TextField | Full address |
| `date_of_birth` | DateField | User's DOB |
| `hire_date` | DateField | Staff hire date |
| `is_active` | BooleanField | Whether the account is active |

**Code Highlight:**
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
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='receptionist')
```

The custom user model is registered in `settings.py` as:
```python
AUTH_USER_MODEL = 'users.User'
```

---

### 2. Authentication Views (`views.py`)

#### a) Login (`POST /api/auth/login/`)
- Accepts `email` and `password`
- Handles **duplicate email** scenarios by selecting the most recently created active user
- Integrates with **2FA flow**:
  - If staff user has no 2FA → returns `requires_2fa_setup: true` (mandatory for staff)
  - If staff user has 2FA + grace period active → allows login with `grace_logins_remaining` count
  - If staff user has 2FA + grace period expired → returns `requires_2fa: true` for code verification
  - Non-staff (patients) → logs in normally without 2FA
- Returns JWT tokens (`access` + `refresh`) on success
- **Rate limited** to 5 attempts/minute via `LoginRateThrottle`

#### b) Register (`POST /api/auth/register/`)
- Creates new user account
- Returns JWT tokens immediately after registration
- Uses `UserRegisterSerializer` for validation

#### c) Profile (`GET /api/auth/profile/`)
- Returns current authenticated user's profile data
- Requires valid JWT token

#### d) Logout (`POST /api/auth/logout/`)
- Blacklists the refresh token using SimpleJWT's token blacklist
- Returns `HTTP 205 Reset Content`

#### e) User CRUD (`UserViewSet`)
- Full ModelViewSet for managing users (admin only)
- Supports `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Uses `UserRegisterSerializer` for creation, `UserSerializer` for other actions

---

### 3. Role-Based Access Control (`permissions.py`)

The `HospitalRolePermission` class is the **central RBAC engine** for the entire backend.

**How it works:**
1. Intercepts **every HTTP request** to protected views
2. Extracts the user's `role` from the JWT token
3. Determines which app/module the request targets (via `app_name` attribute or view name pattern matching)
4. Checks the **permissions matrix** to determine if the role+method combination is allowed

**Permissions Matrix:**

| Role | Patients | Appointments | Queue | Machines | Reports | Staff | Billing | Fleet |
|------|----------|-------------|-------|----------|---------|-------|---------|-------|
| **Admin** | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| **Doctor** | CRUD (no delete) | CRUD (no delete) | CRUD (no delete) | Read | Read | Read | Read | — |
| **Nurse** | Read/Update | Read/Update | Full CRUD | Read/Update | Read | Read | — | — |
| **Technician** | Read | — | Read/Update | Full CRUD | Read | — | — | — |
| **Receptionist** | CRUD (no delete) | Full CRUD | Read | — | Read | Read | CRUD (no delete) | Read |
| **Patient** | — | Read | Read | — | Read | — | Read | Read |

**Object-Level Permissions:**
- Patients can only access **their own** records (IDOR protection)
- Admin, Doctor, Nurse have access to all records
- Receptionist has access for administrative purposes

**Additional Permission Classes:**
- `IsAdminOrDoctor` — restricts to admin/doctor roles
- `IsMedicalStaff` — restricts to admin/doctor/nurse
- `IsPatientOrMedicalStaff` — restricts to admin/doctor/nurse/patient

---

### 4. URL Routing (`urls.py`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/` | GET | List authentication endpoints |
| `/api/auth/login/` | POST | User login |
| `/api/auth/register/` | POST | User registration |
| `/api/auth/profile/` | GET | Get current user profile |
| `/api/auth/logout/` | POST | Logout (blacklist token) |
| `/api/auth/token/refresh/` | POST | Refresh JWT access token |
| `/api/auth/users/` | GET/POST | List/Create users |
| `/api/auth/users/{id}/` | GET/PUT/PATCH/DELETE | User detail operations |

---

### 5. Security Features

- **JWT Authentication** via `djangorestframework-simplejwt`
  - Access token lifetime: 1 day
  - Refresh token lifetime: 7 days
  - Token rotation enabled (new refresh token on each refresh)
  - Old refresh tokens blacklisted after rotation
- **Rate Limiting** on login endpoint (5 requests/min)
- **Password hashing** via Django's built-in PBKDF2
- **CORS protection** configured for specific origins
- **CSRF protection** with trusted origins
