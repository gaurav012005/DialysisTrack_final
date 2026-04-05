# Frontend: Authentication & Login (`Login.jsx`, `AuthContext.jsx`, `TwoFactorSetup.jsx`, `TwoFactorVerify.jsx`)

## 📁 Related Files

```
src/
├── pages/
│   ├── Login.jsx              # Login page (8.6KB)
│   └── TwoFactorSetup.jsx     # 2FA setup page (19.8KB)
├── components/
│   ├── TwoFactorSetup.jsx     # 2FA setup component (10.5KB)
│   ├── TwoFactorVerify.jsx    # 2FA verification component (5.4KB)
│   └── RoleGuard.jsx          # Route protection component (3.3KB)
├── context/
│   └── AuthContext.jsx        # Authentication state management (3.9KB)
├── hooks/
│   └── useAuth.js             # Auth hook (137B)
├── api/
│   └── auth.js                # Auth API calls (584B)
└── utils/
    └── authFix.js             # Auth utility fixes (1.3KB)
```

---

## 🔧 How It Works

### 1. Login Page (`pages/Login.jsx`)

A sleek, styled login form that handles the complete authentication flow.

**What It Does:**
- Accepts email and password
- Sends `POST /api/auth/login/` to the backend
- Handles **three response scenarios:**
  1. **Normal login** → stores JWT tokens, redirects to dashboard
  2. **2FA required** (`requires_2fa: true`) → shows 2FA verification modal
  3. **2FA setup required** (`requires_2fa_setup: true`) → redirects to 2FA setup page

**Code Flow:**
```
User submits email + password
      ↓
POST /api/auth/login/
      ↓
┌─ requires_2fa_setup: true → Navigate to /two-factor-setup
├─ requires_2fa: true → Show TwoFactorVerify component
└─ Success → Store tokens → Navigate to /dashboard
```

### 2. Auth Context (`context/AuthContext.jsx`)

The **brain** of frontend authentication — provides global auth state to the entire app.

**State managed:**
- `user` — current logged-in user object
- `token` — JWT access token
- `loading` — whether auth is being checked

**Features:**
- Stores/retrieves tokens from `localStorage`
- Automatically attaches `Authorization: Bearer <token>` header to all Axios requests via interceptor
- Provides `login()`, `logout()`, `register()` functions
- Auto-logs out on token expiration

**Code Highlight:**
```jsx
// Axios interceptor — auto-attaches JWT to every request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### 3. Role Guard (`components/RoleGuard.jsx`)

A Higher-Order Component (HOC) that protects routes based on user roles.

**How It Works:**
```jsx
<RoleGuard allowedRoles={['admin', 'receptionist']}>
    <BillingPage />
</RoleGuard>
```

- Reads `user.role` from `AuthContext`
- If role is **not** in `allowedRoles` → kicks user to Dashboard or 403 page
- If user is **not logged in** → redirects to `/login`

### 4. Two-Factor Setup (`pages/TwoFactorSetup.jsx` & `components/TwoFactorSetup.jsx`)

**Setup Flow:**
1. Calls `POST /api/two-factor/setup/` → receives QR code image + secret key
2. Displays QR code for scanning with Google Authenticator / Authy
3. Shows manual secret key for manual entry
4. User enters 6-digit code from authenticator app
5. Calls `POST /api/two-factor/verify_setup/` → confirms setup
6. Displays 10 backup codes (user must save them)
7. Redirects to dashboard

### 5. Two-Factor Verify (`components/TwoFactorVerify.jsx`)

**Verification Flow:**
1. Shows modal/form requesting 6-digit TOTP code
2. Also accepts 8-character backup code
3. Calls `POST /api/two-factor/verify_login/`
4. On success → stores new JWT tokens, redirects to dashboard
5. On failure → shows error, allows retry

### 6. Auth API (`api/auth.js`)

API functions for authentication:
```javascript
export const loginUser = (credentials) => axios.post('/api/auth/login/', credentials);
export const registerUser = (data) => axios.post('/api/auth/register/', data);
export const getProfile = () => axios.get('/api/auth/profile/');
export const logoutUser = (refresh) => axios.post('/api/auth/logout/', { refresh });
```

---

## 🔑 Key Features

- **JWT-based authentication** with access + refresh tokens
- **Auto token refresh** on expiration
- **Mandatory 2FA** for staff with QR code setup
- **Grace period**: 3 free logins after 2FA verification
- **Backup codes** for account recovery
- **Role-based route protection** via RoleGuard
- **Axios interceptor** for automatic token attachment
- **LocalStorage** persistence for session continuity
