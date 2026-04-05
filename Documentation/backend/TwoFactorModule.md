# Backend: Two-Factor Authentication Module (`two_factor/`)

## 📁 Folder Structure

```
two_factor/
├── __init__.py
├── models.py          # BackupCode, TwoFactorReminder models
├── views.py           # 2FA setup, verification, management (420 lines)
├── serializers.py     # 2FA data serialization
├── urls.py            # URL routing
├── apps.py            # Django app configuration
├── admin.py           # Django admin registration
├── migrations/        # Database migrations
└── *.md               # 10 documentation files covering implementation details
```

---

## 🔧 How It Works

### 1. Data Models (`models.py`)

#### a) BackupCode Model

Recovery codes for when authenticator app is unavailable.

| Field | Type | Description |
|-------|------|-------------|
| `user` | ForeignKey → User | User these codes belong to |
| `code` | CharField (8 chars, unique) | Hex-based backup code |
| `is_used` | BooleanField | Whether the code has been used |
| `used_at` | DateTimeField | When the code was used |

10 backup codes are generated per user. Each can only be used once.

#### b) TwoFactorReminder Model

Smart reminder system with grace period tracking.

| Field | Type | Description |
|-------|------|-------------|
| `user` | OneToOneField → User | One reminder per user |
| `last_reminder_shown` | DateTimeField | When last reminder was displayed |
| `reminder_skip_count` | IntegerField | How many times user skipped setup |
| `login_count` | IntegerField | Logins since last reminder |
| `grace_logins_remaining` | IntegerField (default 0) | Free logins after 2FA setup |
| `hours_between_reminders` | IntegerField (default 24) | Hours between reminders |
| `logins_before_reminder` | IntegerField (default 3) | Logins before showing reminder |
| `grace_logins_allowed` | IntegerField (default 3) | Total grace logins after setup |

**Key Methods:**

```python
def should_show_reminder(self):
    # Returns True if: 3+ logins OR 24+ hours since last reminder
    # Returns False if: user already has 2FA enabled

def needs_2fa_verification(self):
    # Returns True if grace period expired (0 remaining)
    # Returns False if no 2FA device OR grace logins remaining

def use_grace_login(self):
    # Decrements grace_logins_remaining by 1
    # Returns True if grace login was available

def reset_counters(self):
    # Called when 2FA is verified — resets to 3 grace logins
```

---

### 2. 2FA Views (`views.py`)

**`TwoFactorViewSet`** — 420-line ViewSet managing the complete 2FA lifecycle.

#### a) Setup (`POST /api/two-factor/setup/`)

1. Only available for **staff members** (admin, doctor, nurse, receptionist, technician)
2. Checks if 2FA is already enabled → returns error
3. Deletes any unconfirmed TOTP devices (previous incomplete setups)
4. Creates a new `TOTPDevice` (unconfirmed)
5. Converts hex secret to **Base32 format** (required by authenticator apps)
6. Generates QR code using `qrcode` library
7. Returns QR code as **base64-encoded PNG** + manual secret key

**Response:**
```json
{
    "qr_code": "data:image/png;base64,iVBOR...",
    "secret": "JBSWY3DPEHPK3PXP",
    "user": "admin@hospital.com",
    "message": "Scan QR code with your authenticator app"
}
```

#### b) Verify Setup (`POST /api/two-factor/verify_setup/`)

1. Accepts 6-digit TOTP token from authenticator app
2. Validates token format (exactly 6 digits)
3. Verifies against the unconfirmed device with **±2 time window tolerance** (±60 seconds)
4. On success:
   - Marks device as confirmed (`confirmed = True`)
   - Deletes old backup codes
   - Generates **10 new backup codes**
   - Resets reminder counters + sets 3 grace logins
5. Returns backup codes (save once, cannot be retrieved again)

#### c) Verify Login (`POST /api/two-factor/verify_login/`)

Called during login when 2FA verification is required.

1. Accepts either:
   - **6-digit TOTP code** from authenticator app
   - **8-character backup code** for recovery
2. TOTP verification with ±2 time window tolerance
3. Backup code: marks as used, returns remaining count
4. On success:
   - Resets grace period to 3 free logins
   - Returns new JWT tokens (`access` + `refresh`)
   - Returns user data

#### d) Status (`GET /api/two-factor/status/`)

Returns 2FA configuration status for the current user:
```json
{
    "enabled": true,
    "available": true,
    "backup_codes_remaining": 8
}
```

#### e) Skip Reminder (`POST /api/two-factor/skip_reminder/`)

**Disabled.** Returns error: "2FA setup is mandatory for all staff members."
Kept for backward compatibility.

#### f) Disable (`POST /api/two-factor/disable/`)

- **Staff cannot disable 2FA** (returns 403)
- Non-staff (patients) can disable with password confirmation
- Deletes all TOTP devices and backup codes

#### g) Backup Codes (`GET /api/two-factor/backup_codes/`)

Returns masked backup codes (shows first 2 chars only for security):
```json
{
    "codes": [
        {"code": "AB******", "is_used": false},
        {"code": "CD****** (Used)", "is_used": true}
    ],
    "total": 10,
    "remaining": 8
}
```

#### h) Regenerate Backup Codes (`POST /api/two-factor/regenerate_backup_codes/`)

- Requires password confirmation
- Requires 2FA to be already enabled
- Deletes all old codes, generates 10 new ones

---

### 3. Login Integration Flow

```
User enters email/password
        ↓
Is staff member?
    ↓ YES                      ↓ NO
Has 2FA enabled?           Login normally
    ↓ YES          ↓ NO       (no 2FA required)
Grace period?   Return requires_2fa_setup: true
    ↓ YES         (mandatory — no skip)
Allow login
(decrement grace)
    ↓ NO
Return requires_2fa: true
(must enter 6-digit code)
         ↓
Verify TOTP/Backup code
         ↓
Reset grace to 3 logins
Return JWT tokens
```

---

### 4. URL Routing (`urls.py`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/two-factor/setup/` | POST | Generate QR code for setup |
| `/api/two-factor/verify_setup/` | POST | Verify setup with TOTP code |
| `/api/two-factor/verify_login/` | POST | Verify 2FA during login |
| `/api/two-factor/status/` | GET | Check 2FA status |
| `/api/two-factor/skip_reminder/` | POST | (Disabled) Skip reminder |
| `/api/two-factor/disable/` | POST | Disable 2FA (non-staff only) |
| `/api/two-factor/backup_codes/` | GET | View masked backup codes |
| `/api/two-factor/regenerate_backup_codes/` | POST | Regenerate backup codes |

---

### 5. Key Features

- **Mandatory 2FA for all staff** (cannot be skipped or disabled)
- **TOTP-based** (Time-based One-Time Password) — compatible with Google Authenticator, Authy, Microsoft Authenticator
- **QR code generation** with base64 encoding for frontend display
- **10 backup codes** for account recovery
- **Grace period system** — 3 free logins after 2FA verification before requiring code again
- **Time drift tolerance** — ±2 windows (±60 seconds) for clock sync issues
- **Password confirmation** required for destructive operations (disable, regenerate)
- **Smart reminder system** with login count and time-based triggers
