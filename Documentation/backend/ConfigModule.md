# Backend: Config Module (`config/`)

## 📁 Folder Structure

```
config/
├── __init__.py
├── settings.py            # Main Django settings
├── production_settings.py # Production-specific overrides
├── urls.py                # Root URL routing
├── views.py               # Error handlers (production)
├── test_views.py          # Health check & API docs endpoints
├── asgi.py                # ASGI config (WebSocket support)
└── wsgi.py                # WSGI config (traditional HTTP)
```

---

## 🔧 How It Works

### 1. Django Settings (`settings.py`)

The central configuration file for the entire backend application.

#### Database Configuration
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME', default='dialysistrack_db'),
        'USER': config('DB_USER', default='root'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
    }
}
```
Uses **MySQL** with `pymysql` as the database driver. Supports `STRICT_TRANS_TABLES` mode and `utf8mb4` charset.

#### Installed Apps
```
Third-party: rest_framework, simplejwt, corsheaders, django_filters, channels, django_otp
Local apps:  users, patients, appointments, dialysis_queue, machines, staff, reports, billing, notifications, two_factor, fleet
```

#### Authentication
- **Custom User Model:** `AUTH_USER_MODEL = 'users.User'`
- **JWT Settings:**
  - Access token: 1 day lifetime
  - Refresh token: 7 days lifetime
  - Token rotation enabled
  - Blacklist after rotation

#### REST Framework
- Default auth: JWT
- Default permission: IsAuthenticated
- Pagination: 20 items per page
- Filter backend: django-filters

#### CORS Configuration
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Only in development
```

#### Security (Production)
When `DEBUG = False`:
- HSTS (1 year)
- XSS filter
- Content-type nosniff
- SSL redirect
- X-Frame: DENY
- Secure cookies

#### ASGI/Channels
```python
ASGI_APPLICATION = 'config.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}
```
Uses Daphne for ASGI and InMemoryChannelLayer for WebSocket support.

---

### 2. Root URL Routing (`urls.py`)

| Path | App | Description |
|------|-----|-------------|
| `/admin/` | Django Admin | Admin panel |
| `/` , `/api/` | test_views | API root / health check |
| `/api/health/` | test_views | Health check endpoint |
| `/api/auth/` | users | Authentication & user management |
| `/api/patients/` | patients | Patient management |
| `/api/appointments/` | appointments | Appointment scheduling |
| `/api/queue/` | dialysis_queue | Queue & session management |
| `/api/machines/` | machines | Machine management |
| `/api/staff/` | staff | Staff scheduling & attendance |
| `/api/reports/` | reports | Reports & exports |
| `/api/billing/` | billing | Billing & payments |
| `/api/two-factor/` | two_factor | 2FA management |
| `/api/fleet/` | fleet | Ambulance fleet management |
| `/swagger/` | test_views | API documentation page |

---

### 3. Environment Variables (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | (required) | Django secret key |
| `DEBUG` | True | Debug mode toggle |
| `DB_NAME` | dialysistrack_db | Database name |
| `DB_USER` | root | Database username |
| `DB_PASSWORD` | (empty) | Database password |
| `DB_HOST` | localhost | Database host |
| `DB_PORT` | 3306 | Database port |

---

### 4. Key Features

- **MySQL database** with PyMySQL driver
- **JWT authentication** via SimpleJWT
- **CORS configuration** for frontend at ports 3000, 5173
- **ASGI support** via Daphne for WebSocket real-time features
- **OTP middleware** for 2FA support
- **Production security headers** (HSTS, XSS, SSL)
- **Custom error handlers** for production (404, 500, 400, 403)
- **API documentation** accessible at `/swagger/`
