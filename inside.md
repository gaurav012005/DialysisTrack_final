# DialysisTrack - Internal Code Documentation

## Overview
DialysisTrack is a comprehensive Dialysis Queue Management System built with Django REST Framework (backend) and React (frontend). It provides real-time management of dialysis patients, equipment, staff, and queue operations for hospitals.

## Technology Stack

### Backend
- **Django 4.2.7** - Web framework
- **Django REST Framework 3.14.0** - API development
- **SQLite/MySQL** - Database (configurable)
- **JWT Authentication** - Secure token-based auth with blacklist support
- **CORS Headers** - Cross-origin support
- **Django Filters** - API filtering capabilities

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Fetch API** - HTTP client
- **React Router** - Navigation

## Recent Updates & Fixes
- ✅ Fixed JWT authentication with token blacklist support
- ✅ Resolved timezone-aware datetime issues
- ✅ Fixed user activation and role assignment
- ✅ Implemented proper API authentication headers
- ✅ Added token refresh functionality
- ✅ Organized testing scripts in separate folder
- ✅ Fixed staff edit session functionality

---

## Project Structure

```
DialysisTrack/
├── backend/
│   ├── config/           # Django settings and main URLs
│   ├── users/            # User management and authentication
│   ├── patients/         # Patient records management
│   ├── appointments/     # Appointment scheduling
│   ├── dialysis_queue/   # Queue management system
│   ├── machines/         # Equipment tracking
│   ├── staff/            # Staff management
│   ├── reports/          # Analytics and reporting
│   ├── testing/          # All testing and debug scripts
│   ├── manage.py
│   ├── requirements.txt
│   └── db.sqlite3
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Main application pages
│   │   ├── context/      # React context providers
│   │   ├── utils/        # Utility functions
│   │   ├── api/          # API integration
│   │   └── styles/       # CSS and styling
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── deployment/
    └── docker-compose.yml
```

## Backend Structure & Code Functions

### Core Models (`backend/`)

#### 1. Users (`users/models.py`)
```python
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('nurse', 'Nurse'),
        ('technician', 'Technician'),
        ('receptionist', 'Receptionist'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='receptionist')
    department = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
```
**Functions:** User authentication, role-based access control, staff management

#### 2. Patients (`patients/models.py`)
```python
class Patient(models.Model):
    patient_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    blood_type = models.CharField(max_length=3, choices=BLOOD_TYPE_CHOICES, blank=True)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField()
    emergency_contact_name = models.CharField(max_length=100)
    emergency_contact_phone = models.CharField(max_length=15)
    primary_diagnosis = models.TextField()
    is_emergency = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
```
**Functions:** Patient records management, medical history tracking, emergency status handling

#### 3. Dialysis Machines (`machines/models.py`)
```python
class DialysisMachine(models.Model):
    machine_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    machine_type = models.CharField(max_length=20, choices=MACHINE_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    current_patient = models.ForeignKey('patients.Patient', on_delete=models.SET_NULL, null=True, blank=True)
    total_sessions = models.IntegerField(default=0)
    total_operating_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    needs_maintenance = property  # Calculated based on maintenance schedule
```
**Functions:** Equipment tracking, maintenance scheduling, usage statistics, status management

#### 4. Queue Management (`dialysis_queue/models.py`)
```python
class Queue(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='queue_entries')
    queue_number = models.CharField(max_length=10, unique=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='scheduled')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    check_in_time = models.DateTimeField(auto_now_add=True)
    estimated_wait_time = models.IntegerField(default=0)
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    assigned_machine = models.CharField(max_length=50, blank=True)
    assigned_staff = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
```
**Functions:** Real-time queue management, priority handling, session tracking, wait time estimation

---

## API Endpoints

### Authentication (`/api/auth/`)
- `POST /login/` - User login with JWT token generation
- `POST /register/` - User registration
- `POST /token/refresh/` - Refresh JWT access token
- `GET /profile/` - Get user profile
- `POST /logout/` - Logout and blacklist token

### Patients (`/api/patients/`)
- `GET /` - List all patients (with filtering)
- `POST /` - Create new patient
- `GET /{id}/` - Get patient details
- `PUT /{id}/` - Update patient
- `DELETE /{id}/` - Delete patient
- `POST /{id}/toggle_emergency/` - Toggle emergency status

### Queue Management (`/api/queue/`)
- `GET /` - Get current queue
- `POST /` - Add patient to queue
- `GET /current_queue/` - Get active queue entries
- `GET /dashboard_stats/` - Get queue statistics
- `POST /{id}/start_treatment/` - Start treatment session
- `POST /{id}/complete_treatment/` - Complete treatment
- `POST /{id}/assign_machine/` - Assign machine to patient

### Machines (`/api/machines/`)
- `GET /` - List all machines
- `POST /` - Add new machine
- `GET /{id}/` - Get machine details
- `PUT /{id}/` - Update machine
- `POST /{id}/maintenance/` - Schedule maintenance

### Reports (`/api/reports/`)
- `GET /dashboard-stats/` - Dashboard statistics
- `GET /patients/` - Patient reports
- `GET /queue/` - Queue performance reports
- `GET /machines/` - Machine utilization reports
- `GET /export/` - Export data to CSV

---

## Frontend Components

### Core Pages
- **Dashboard** - Overview with statistics and quick actions
- **Patients** - Patient management with CRUD operations
- **Queue** - Real-time queue management interface
- **Machines** - Equipment tracking and maintenance
- **Staff** - Staff management and scheduling
- **Reports** - Analytics and data visualization
- **Login** - Authentication interface

### Key Components
- **AuthContext** - Authentication state management with token refresh
- **PatientForm** - Patient data entry and editing
- **AddStaffModal** - Staff creation and editing modal (supports both add/edit)
- **LoadingSpinner** - Loading state indicator
- **EmptyState** - Empty data state display
- **RefreshButton** - Data refresh functionality

---

## Authentication System

### JWT Implementation
```python
# Settings configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

INSTALLED_APPS = [
    # ...
    'rest_framework_simplejwt.token_blacklist',  # Added for token blacklisting
]
```

### Frontend Auth Flow
```javascript
// API requests with authentication
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    ...options
  };
  return await fetch(`http://localhost:8000/api${endpoint}`, config);
};
```

---

## Testing & Development

### Testing Scripts (`/backend/testing/`)
- `create_admin_user.py` - Create admin user for testing
- `debug_auth.py` - Debug authentication issues
- `fix_user_active.py` - Fix user activation status
- `fix_admin_role.py` - Fix admin user role
- `create_sample_data.py` - Generate sample data
- `check_all_data.py` - Verify database integrity
- `test_auth.py` - Test authentication flow
- `create_user_roles.py` - Create default user roles

### Development Setup
```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python testing/create_admin_user.py
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

### Default Login Credentials
- **Email:** admin@test.com
- **Password:** admin123
- **Role:** Admin (fixed from receptionist)

---

## Key Features Implemented

1. **Real-time Queue Management**
   - Priority-based patient queuing (emergency, scheduled, walk-in)
   - Automatic wait time estimation
   - Session tracking and completion
   - Machine assignment

2. **Equipment Management**
   - Machine status tracking (available, in_use, maintenance, etc.)
   - Maintenance scheduling with automatic alerts
   - Usage statistics and operating hours
   - Technical specifications tracking

3. **Patient Records**
   - Comprehensive medical history
   - Emergency status handling
   - Contact information management
   - Dialysis-specific data (dry weight, vascular access, etc.)

4. **Staff Management**
   - Role-based access control (admin, doctor, nurse, technician, receptionist)
   - Staff creation and editing functionality
   - Shift scheduling display
   - Performance tracking

5. **Reporting & Analytics**
   - Dashboard statistics with real-time data
   - Performance reports by date range
   - Machine utilization reports
   - Data export capabilities (CSV)

6. **Security Features**
   - JWT authentication with refresh tokens
   - Token blacklisting for logout
   - Role-based permissions
   - CORS protection
   - Timezone-aware datetime handling

---

## Recent Bug Fixes

1. **Authentication Issues**
   - Fixed user activation status (is_active=False preventing login)
   - Corrected admin role assignment (was showing as receptionist)
   - Added JWT token blacklist support to INSTALLED_APPS
   - Implemented proper token refresh mechanism

2. **Timezone Problems**
   - Resolved "can't subtract offset-naive and offset-aware datetimes" error
   - Updated all datetime operations to use `timezone.now()` instead of `datetime.now()`
   - Fixed queue completion and treatment tracking

3. **API Integration**
   - Fixed missing authentication headers in Dashboard component
   - Implemented proper error handling across all API calls
   - Added token validation and auto-clearing of invalid tokens

4. **UI/UX Improvements**
   - Fixed staff edit functionality (modal now supports both add and edit modes)
   - Improved error messaging with detailed API responses
   - Enhanced loading states and empty state displays

---

## Deployment Notes

- Docker configuration available in `/deployment/docker-compose.yml`
- Environment variables configured via `.env` file
- Static files served via WhiteNoise
- Database migrations handled automatically
- CORS configured for development (localhost:3000, localhost:5173) and production
- JWT tokens configured with 1-day access and 7-day refresh lifetime

---

## Development Workflow

1. **Backend Changes:**
   ```bash
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
   ```

2. **Frontend Changes:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Testing:**
   ```bash
   cd backend
   python testing/script_name.py
   ```

4. **Database Reset (if needed):**
   ```bash
   rm db.sqlite3
   python manage.py migrate
   python testing/create_admin_user.py
   python testing/create_sample_data.py
   ```

---

## Future Enhancements

- Real-time notifications using WebSockets
- Mobile app integration
- Advanced reporting dashboard with charts
- Integration with hospital management systems
- Automated backup system
- Multi-language support
- Advanced scheduling algorithms
- Patient portal for self-service