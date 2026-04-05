
# 5. IMPLEMENTATION

This chapter covers the actual code implementation — how we built the backend, frontend, security layer, and real-time features. We have included key code snippets with explanations to show the logic behind each major component.

---
<div style="page-break-after: always;"></div>

## 5.1 Backend Implementation

### 5.1.1 Project Structure

The backend is organized into **12 Django apps**. Each app is a self-contained module with its own models (database tables), views (API endpoints), serializers (data validation and transformation), and URL routing.

| App | Key Files | Purpose |
|:----|:----------|:--------|
| users | models.py, views.py, serializers.py, permissions.py | Custom User model with 7 roles, registration, login, RBAC middleware |
| patients | models.py, views.py, serializers.py | Patient CRUD operations, medical history, dashboard statistics |
| appointments | models.py, views.py, serializers.py | Appointment scheduling with shift-based booking, conflict detection |
| dialysis_queue | models.py, views.py, serializers.py | Treatment queue management, dialysis session tracking with vitals |
| machines | models.py, views.py, serializers.py | Machine inventory, status management, maintenance and cleaning logs |
| staff | models.py, views.py, serializers.py | Staff schedules, daily attendance, leave request workflow |
| billing | models.py, views.py, serializers.py | Bill generation with GST, payment processing, insurance management |
| reports | views.py | Report generation — CSV, Excel (openpyxl), and PDF (ReportLab) |
| fleet | models.py, views.py, consumers.py, routing.py | Ambulance and ride management, WebSocket GPS streaming |
| two_factor | views.py | TOTP setup, QR code generation, verification, backup codes |
| notifications | models.py, views.py | In-app notifications and audit event logging |
| config | settings.py, urls.py, asgi.py, wsgi.py | Project-level configuration, URL routing, ASGI/WSGI setup |

The backend also contains a `testing/` directory with **38 automated test scripts** covering models, serializers, views, and permissions.

### 5.1.2 How Django REST Framework Works

Before diving into code, here is a quick overview of how DRF processes an API request:

```
Browser → Nginx → Django URL Router → ViewSet → Permission Check →
Serializer (validate input / format output) → Model (database operation) →
Response (JSON)
```

| Step | Component | What it does |
|:-----|:----------|:-------------|
| 1 | urls.py | Maps URL paths to view classes (e.g., /api/patients/ → PatientViewSet) |
| 2 | ViewSet | Contains the CRUD logic (list, create, retrieve, update, destroy) |
| 3 | Permission class | Checks if the user's role is allowed (HospitalRolePermission) |
| 4 | Serializer | Validates incoming data, converts model instances to JSON for responses |
| 5 | Model | The Django ORM class that maps to a database table |

This pattern keeps each layer focused on one job. The ViewSet does not know about URL routing. The serializer does not know about permissions. And the model does not know about HTTP.

### 5.1.3 Custom User Model

We extended Django's built-in `AbstractUser` to add role, department, phone, and other fields that a hospital system needs:

```python
# backend/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

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
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='receptionist'
    )
    department = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    hire_date = models.DateField(null=True, blank=True)
```

**Why AbstractUser and not a separate Profile model?**
We considered creating a separate `UserProfile` table linked via a OneToOne FK, which is a common pattern. But we decided against it because the role field needs to be checked on every single API request (for permission enforcement). Having it directly on the User model saves a database JOIN on every request, which adds up when you are serving dozens of requests per page load.

---
<div style="page-break-after: always;"></div>

### 5.1.4 Role-Based Permission Class

This is the single most important class in the entire backend. It sits between the URL router and the view, and decides whether a user is allowed to perform the requested operation.

```python
# backend/users/permissions.py (simplified for readability)
from rest_framework.permissions import BasePermission

class HospitalRolePermission(BasePermission):
    """
    Permission class that checks role against
    a module-method matrix.
    """
    PERMISSION_MATRIX = {
        'admin': {
            'patients': ['GET','POST','PUT','PATCH','DELETE'],
            'queue': ['GET','POST','PUT','PATCH','DELETE'],
            'machines': ['GET','POST','PUT','PATCH','DELETE'],
            'billing': ['GET','POST','PUT','PATCH','DELETE'],
            'staff': ['GET','POST','PUT','PATCH','DELETE'],
            'reports': ['GET'],
            'fleet': ['GET','POST','PUT','PATCH','DELETE'],
            'appointments': ['GET','POST','PUT','PATCH','DELETE'],
        },
        'doctor': {
            'patients': ['GET', 'PUT', 'PATCH'],
            'queue': ['GET', 'PUT', 'PATCH'],
            'sessions': ['GET','POST','PUT','PATCH'],
        },
        'nurse': {
            'patients': ['GET', 'PUT', 'PATCH'],
            'queue': ['GET', 'POST', 'PUT', 'PATCH'],
            'machines': ['GET', 'PUT', 'PATCH'],
        },
        'technician': {
            'machines': ['GET','POST','PUT','PATCH','DELETE'],
            'queue': ['GET', 'PUT'],
        },
        'receptionist': {
            'patients': ['GET','POST','PUT','PATCH','DELETE'],
            'billing': ['GET','POST','PUT','PATCH','DELETE'],
            'appointments': ['GET','POST','PUT','PATCH','DELETE'],
            'fleet': ['GET'],
        },
        'patient': {
            'patients': ['GET'],
            'appointments': ['GET'],
            'billing': ['GET'],
            'queue': ['GET'],
        },
        'driver': {
            'fleet': ['GET', 'PUT', 'PATCH'],
        },
    }

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = request.user.role
        module = self._get_module_name(view)
        allowed_methods = self.PERMISSION_MATRIX.get(
            role, {}
        ).get(module, [])
        return request.method in allowed_methods
```

The beauty of this approach is its simplicity. Adding a new permission just means adding a line to the matrix dictionary. There is no complex inheritance tree, no database lookups, and no per-model permission flags scattered around the codebase.

### 5.1.5 Patient Auto-ID Generation

When a new patient is created, the system automatically generates a human-readable ID in the format P001, P002, etc. This happens in the model's `save()` method:

```python
# backend/patients/models.py (save method)
def save(self, *args, **kwargs):
    if not self.patient_id:
        last = Patient.objects.order_by('-id').first()
        if last and last.patient_id:
            num = int(last.patient_id[1:]) + 1
        else:
            num = 1
        self.patient_id = f'P{num:03d}'
    super().save(*args, **kwargs)
```

This ensures IDs are sequential and padded to 3 digits (P001, P002, ... P099, P100, etc.). The format was chosen to match what we saw in physical patient registers during our centre visits.

---
<div style="page-break-after: always;"></div>

### 5.1.6 Bill Auto-Calculation

The Bill model overrides save() to auto-compute all financial fields. This means the frontend just sends the individual cost items and the backend calculates the rest:

```python
# backend/billing/models.py (key part)
from decimal import Decimal
from datetime import datetime
import random

def save(self, *args, **kwargs):
    # Calculate subtotal
    self.subtotal = (
        Decimal(self.dialysis_sessions) * self.session_cost
        + self.medicine_cost
        + self.consultation_cost
        + self.other_charges
    )
    # Apply 18% GST on (subtotal - discount)
    taxable = self.subtotal - self.discount
    self.tax_amount = taxable * Decimal('0.18')
    # Final total
    self.total_amount = taxable + self.tax_amount

    # Auto-generate bill number
    if not self.bill_number:
        date_str = datetime.now().strftime('%Y%m%d')
        rand = random.randint(100, 999)
        self.bill_number = f"DT{date_str}{rand}"

    super().save(*args, **kwargs)
```

**Example calculation:**

| Item | Amount |
|:-----|-------:|
| 2 sessions × Rs. 2,500 | Rs. 5,000 |
| Medicine cost | Rs. 500 |
| Consultation cost | Rs. 500 |
| Other charges | Rs. 0 |
| **Subtotal** | **Rs. 6,000** |
| Discount | Rs. 500 |
| Taxable amount | Rs. 5,500 |
| GST (18%) | Rs. 990 |
| **Total** | **Rs. 6,490** |

### 5.1.7 API Endpoint Summary

The backend exposes **47 API endpoints** across all modules. Here are the key ones:

| Method | Endpoint | Purpose |
|:-------|:---------|:--------|
| POST | /api/auth/register/ | Register new user |
| POST | /api/auth/login/ | Login, returns JWT tokens |
| POST | /api/auth/token/refresh/ | Refresh access token |
| GET | /api/patients/ | List all patients (filtered by role) |
| POST | /api/patients/ | Create new patient |
| GET | /api/patients/{id}/ | Get patient details |
| PUT | /api/patients/{id}/ | Update patient |
| GET | /api/appointments/ | List appointments |
| POST | /api/appointments/ | Book appointment |
| GET | /api/queue/ | Get current queue |
| POST | /api/queue/ | Add patient to queue |
| PATCH | /api/queue/{id}/ | Update queue entry (assign machine, change status) |
| GET | /api/queue/{id}/session/ | Get session vitals |
| PUT | /api/queue/{id}/session/ | Update session vitals |
| GET | /api/machines/ | List all machines |
| GET | /api/billing/ | List bills |
| POST | /api/billing/ | Create bill |
| POST | /api/billing/{id}/payment/ | Process payment |
| GET | /api/staff/schedules/ | Get staff schedules |
| GET | /api/fleet/ambulances/ | List ambulances |
| POST | /api/fleet/rides/ | Dispatch ambulance |
| POST | /api/2fa/setup/ | Start TOTP setup |
| POST | /api/2fa/verify/ | Verify TOTP code |
| GET | /api/reports/export/ | Generate and download report |

---
<div style="page-break-after: always;"></div>

### 5.1.8 JWT Authentication Configuration

```python
# backend/config/settings.py
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

| Setting | Value | Explanation |
|:--------|:------|:------------|
| Access token lifetime | 1 day | Staff work 6–8 hour shifts. A 1-day token means they log in once per shift |
| Refresh token lifetime | 7 days | Covers a work week without re-authentication |
| Rotate refresh tokens | True | Each refresh request returns a new refresh token |
| Blacklist after rotation | True | Old refresh tokens cannot be reused (prevents token theft replay) |

### 5.1.9 WebSocket Consumer for GPS Tracking

The fleet module uses Django Channels to implement real-time GPS streaming. The driver's browser sends coordinates every 2–3 seconds, and all hospital staff watching the ride see the marker move on the map.

```python
# backend/fleet/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class LocationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.ride_id = self.scope['url_route']['kwargs']['ride_id']
        self.room = f'ride_{self.ride_id}'
        # Join the room for this specific ride
        await self.channel_layer.group_add(
            self.room, self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room, self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Broadcast coordinates to all room subscribers
        await self.channel_layer.group_send(
            self.room,
            {
                'type': 'location_update',
                'lat': data['lat'],
                'lng': data['lng'],
            }
        )

    async def location_update(self, event):
        # Send update to the client
        await self.send(text_data=json.dumps({
            'lat': event['lat'],
            'lng': event['lng'],
        }))
```

**How it works step by step:**
1. Driver opens the ride page on their phone browser
2. JavaScript calls `navigator.geolocation.watchPosition()` to get GPS
3. Coordinates are sent via WebSocket to `ws://host/ws/ride/42/`
4. The consumer receives the data and broadcasts it to all connected clients in the same "room" (`ride_42`)
5. The hospital staff's browser receives the update and moves the marker on the Leaflet map

---
<div style="page-break-after: always;"></div>

## 5.2 Frontend Implementation

### 5.2.1 Frontend Project Structure

| Folder | File Count | Contents |
|:-------|:-----------|:---------|
| src/components/ | 37 files | Reusable UI components (Sidebar, Navbar, DataTable, Forms, Cards, Modals) |
| src/pages/ | 10+ files | Full-page components (Dashboard, Patients, Queue, Machines, Billing, etc.) |
| src/context/ | 2 files | AuthContext (JWT + user state), ThemeContext (dark/light mode) |
| src/api/ | 6 files | Axios service modules (one per backend module) |
| src/styles/ | 3 files | index.css (global + dark mode), custom animations |
| src/utils/ | 3 files | Toast notifications, error handling, date formatting |
| public/ | 5 files | manifest.json, favicon, service worker |

### 5.2.2 Authentication Context

This is the central state management for user authentication. Every component in the app can access the current user and login/logout functions through React Context.

```javascript
// src/context/AuthContext.jsx (key parts)
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem('authToken')
  );
  const [loading, setLoading] = useState(true);

  // Automatically attach JWT token to every API request
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      config => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }
    );
    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  const login = async (email, password) => {
    const response = await axios.post(
      '/api/auth/login/', { email, password }
    );
    const { access, user: userData } = response.data;
    localStorage.setItem('authToken', access);
    setToken(access);
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Key design decisions:**
- We use `localStorage` for tokens because the Vite dev server runs on a different port than Django, so cookies with SameSite restrictions would not work in development
- The Axios interceptor ensures every API call automatically includes the Bearer token — individual components never have to worry about authentication headers
- On page refresh, the token is loaded from localStorage and the user profile is fetched from the backend to verify the token is still valid

### 5.2.3 Role-Based Route Guards

We protect frontend routes so that users cannot access pages outside their role, even if they type the URL directly into the browser's address bar:

```javascript
// src/AppRouter.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const RoleGuard = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

// Usage in the router:
<Route path="/staff" element={
  <RoleGuard allowedRoles={['admin']}>
    <Staff />
  </RoleGuard>
} />

<Route path="/billing" element={
  <RoleGuard allowedRoles={['admin', 'receptionist', 'patient']}>
    <Billing />
  </RoleGuard>
} />
```

This provides **double protection**: the backend checks permissions on every API request (server-side), and the frontend hides pages that the user should not see (client-side). Even if someone bypasses the frontend guard using browser developer tools, the backend will reject any unauthorised API call with a 403 error.

---
<div style="page-break-after: always;"></div>

### 5.2.4 Reusable Components

One of the biggest advantages of React is component reuse. We built shared components that are used across multiple modules, ensuring visual consistency and reducing code duplication:

**DataTable Component:** Used on every list page (patients, machines, queue, billing, staff). It accepts columns and data as props and renders a sortable, searchable table with pagination.

**StatsCard Component:** The dashboard summary cards (Total Patients, Active Sessions, Revenue Today, etc.) all use the same StatsCard component with different icons, numbers, and colours.

**Modal Component:** A generic popup used for confirmations ("Are you sure you want to delete?"), forms (quick-add patient), and details views (session vitals popup).

**Sidebar Component:** The navigation sidebar dynamically shows/hides menu items based on the user's role. A patient sees 4 items; an admin sees 12.

### 5.2.5 Dark Mode Implementation

We implemented a full dark mode using CSS custom properties (CSS variables). The ThemeContext toggles a `dark` class on the `<body>` element, and all styles use CSS variables that change value based on this class:

```css
/* Light mode (default) */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --border-primary: #e2e8f0;
}

/* Dark mode */
.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-primary: #334155;
}

/* Components use the variables */
.card {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
```

This approach means we never have to write separate dark-mode styles for each component. Adding dark mode support to a new component is as simple as using the CSS variables instead of hardcoded colours.

---
<div style="page-break-after: always;"></div>

## 5.3 Authentication and Security

Our security architecture has three layers that work together:

### 5.3.1 Layer 1 — JWT Authentication

Every API request (except login and register) must include a Bearer token in the Authorization header. Without it, the server returns **401 Unauthorized**.

**How it works:**

| Step | Action |
|:-----|:-------|
| 1 | User submits email + password to /api/auth/login/ |
| 2 | Server verifies credentials against the hashed password in the database |
| 3 | If valid, server generates two tokens: ACCESS (short-lived) and REFRESH (longer-lived) |
| 4 | Frontend stores the access token in localStorage |
| 5 | Every subsequent API request includes the header: Authorization: Bearer <access_token> |
| 6 | When the access token expires, frontend sends the refresh token to /api/auth/token/refresh/ |
| 7 | Server issues a new access token and rotates the refresh token |
| 8 | Old refresh token is blacklisted and cannot be reused |

### 5.3.2 Layer 2 — Role-Based Access Control

Even with a valid JWT, the server checks whether the user's role is permitted to perform the requested action. The `HospitalRolePermission` class (shown in Section 5.1.4) is attached to every ViewSet:

```python
class PatientViewSet(ModelViewSet):
    permission_classes = [
        IsAuthenticated,
        HospitalRolePermission
    ]
```

If a patient tries to DELETE another patient's record, the permission matrix returns False, and the server responds with **403 Forbidden**.

### 5.3.3 Layer 3 — Two-Factor Authentication

All staff roles (Admin, Doctor, Nurse, Technician, Receptionist) must set up TOTP-based 2FA. We chose TOTP because:
- Works with free apps (Google Authenticator, Authy, Microsoft Authenticator)
- No SMS required (no cost per message, works without mobile signal)
- Industry standard (RFC 6238)

**Setup flow:**

| Step | What Happens |
|:----:|:-------------|
| 1 | Staff logs in with email + password |
| 2 | Server checks if 2FA is set up for this user |
| 3 | If not, server returns `2fa_required: 'setup'` |
| 4 | Frontend redirects to the 2FA setup page |
| 5 | Server generates a random TOTP secret key |
| 6 | Server creates a QR code image with the secret (otpauth:// URI) |
| 7 | User opens Google Authenticator, scans the QR code |
| 8 | User enters the 6-digit code displayed in the app |
| 9 | Server verifies the code (60-second tolerance window) |
| 10 | If valid, server generates 10 backup recovery codes |
| 11 | User is told to save the backup codes securely |
| 12 | A 3-login grace period starts (no code required for the first 3 logins) |
| 13 | After the grace period, every login requires a 6-digit TOTP code |

### 5.3.4 Additional Security Measures

| Measure | Implementation |
|:--------|:--------------|
| Password hashing | PBKDF2 with SHA256 (Django default, 320,000 iterations) |
| Login rate limiting | 5 failed attempts per minute, then locked for 5 minutes |
| CORS restrictions | Only the frontend origin (http://localhost:3000 in dev) is allowed |
| CSRF protection | Enabled for session-based views (Django admin) |
| Security headers | X-Frame-Options: DENY, X-Content-Type-Options: nosniff |
| Input validation | All inputs sanitised by DRF serializers before database operations |
| SQL injection prevention | Django ORM parameterises all queries, no raw SQL used |

---
<div style="page-break-after: always;"></div>

## 5.4 Real-Time Features

### 5.4.1 WebSocket Architecture

The ambulance GPS tracking uses Django Channels for WebSocket communication. Here is the data flow:

| # | From | To | Protocol | Data |
|:-:|:-----|:---|:---------|:-----|
| 1 | Driver's browser | Daphne server | WebSocket | GPS coordinates (lat, lng) every 2–3 seconds |
| 2 | Daphne server | Redis channel layer | Internal | Message broadcast to room |
| 3 | Redis channel layer | All connected clients | WebSocket | Same GPS coordinates |
| 4 | Hospital staff browser | Leaflet map | Internal | Updates marker position on the map |

The channel layer uses an in-memory backend for development and Redis for production. Redis acts as a message broker — when the driver sends coordinates, Redis distributes them to all subscribers watching that specific ride.

### 5.4.2 Map Integration

We use Leaflet.js with React-Leaflet for the map component. Leaflet renders the OpenStreetMap tiles and displays:
- A marker for the ambulance's current position (updated in real-time)
- A line showing the route taken
- Popups showing speed and ETA estimates

The map component automatically centres on the ambulance marker when new coordinates arrive, so the staff member watching the map does not have to manually scroll to follow the ambulance.

## 5.5 Progressive Web App (PWA)

The frontend is configured as a PWA so it can be installed on phones and tablets directly from the browser, without going through an app store.

### PWA Components:

| Component | File | Purpose |
|:----------|:-----|:--------|
| Web App Manifest | public/manifest.json | App name ("DialysisTrack"), icons (192px, 512px), theme colour (#2563eb), standalone display mode |
| Service Worker | sw.js | Caches static assets (CSS, JS, images) using a cache-first strategy. Network requests for API calls are always served fresh |
| Install Prompt | src/components/InstallPrompt.jsx | Detects the `beforeinstallprompt` event and shows a custom install banner |
| Offline Indicator | Built into Navbar | When `navigator.onLine` is false, a yellow banner appears telling the user they are offline |

**Cache strategy:**
- Static files (CSS, JS, font files, images): Cache-first — serve from cache, update in background
- API calls (/api/*): Network-first — always try the server, fall back to cached response only if offline
- This means the app loads instantly from cache on repeat visits, while always showing fresh data from the API

