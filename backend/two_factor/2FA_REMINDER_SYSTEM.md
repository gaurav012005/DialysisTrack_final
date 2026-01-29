# 2FA Reminder System - How It Works

## Overview
The 2FA (Two-Factor Authentication) reminder system encourages staff members to set up two-factor authentication for enhanced security. The system tracks login attempts and reminds users after 3 logins to enable 2FA.

## Key Features

### 1. Login Tracking
- **Every staff login is counted** (admin, doctor, nurse, receptionist, technician)
- **Login counter increments automatically** when users log in without 2FA enabled
- **Patient accounts are excluded** from 2FA reminders

### 2. Reminder Trigger Conditions
The 2FA setup reminder shows when **ANY** of these conditions are met:

#### Option A: Login Count Threshold
- ✅ **After 3 logins** without 2FA enabled
- The system increments `login_count` on each login
- When `login_count >= 3`, the reminder shows

#### Option B: Time-Based Reminder
- ✅ **24 hours after last reminder** was shown or skipped
- Even if login count is below 3, reminder shows after 24 hours

### 3. User Flow

#### First Login (login_count = 1)
```
User logs in → login_count = 1 → No reminder → Go to dashboard
```

#### Second Login (login_count = 2)
```
User logs in → login_count = 2 → No reminder → Go to dashboard
```

#### Third Login (login_count = 3) **⚠️ REMINDER TRIGGERED**
```
User logs in → login_count = 3 → Reminder shows → Redirect to /2fa-setup
```

At this point, the user sees the 2FA setup page with two options:
1. **"Start Setup"** - Begin 2FA configuration
2. **"Skip for Now"** - Postpone 2FA setup

### 4. Skip Behavior

When user clicks **"Skip for Now"**:
```javascript
// Frontend calls this endpoint
POST /api/two-factor/skip_reminder/

// Backend response
{
    "success": true,
    "message": "Reminder skipped. You will be reminded again in 24 hours or after 3 logins."
}

// What happens:
- login_count is reset to 0
- last_reminder_shown is set to current time
- User redirects to dashboard
```

After skipping:
- Counter resets to 0
- User gets 3 more "free" logins before seeing reminder again
- OR reminder shows again after 24 hours

### 5. Enabling 2FA

When user completes 2FA setup:
```javascript
// After successfully verifying setup
{
    "success": true,
    "message": "2FA enabled successfully!",
    "backup_codes": ["code1", "code2", ...],
    
    // Backend automatically calls:
    reminder.reset_counters()
    - login_count = 0
    - grace_logins_remaining = 3
}
```

### 6. Grace Period After 2FA Setup

After enabling 2FA, users get **3 grace logins** before being required to enter codes:

```
1st login after setup → No code required (grace_logins_remaining: 2)
2nd login after setup → No code required (grace_logins_remaining: 1)
3rd login after setup → No code required (grace_logins_remaining: 0)
4th login after setup → 2FA CODE REQUIRED ✓
```

This gives users time to set up their authenticator app properly before enforcement.

## Database Fields

### TwoFactorReminder Model
```python
class TwoFactorReminder(models.Model):
    user = models.OneToOneField(User)
    
    # Tracking
    login_count = models.IntegerField(default=0)
    last_reminder_shown = models.DateTimeField(null=True, blank=True)
    reminder_skip_count = models.IntegerField(default=0)
    grace_logins_remaining = models.IntegerField(default=0)
    
    # Configuration
    logins_before_reminder = models.IntegerField(default=3)
    hours_between_reminders = models.IntegerField(default=24)
    grace_logins_allowed = models.IntegerField(default=3)
```

## API Response Fields

### Login Response (without 2FA)
```json
{
    "refresh": "...",
    "access": "...",
    "user": {...},
    "requires_2fa": false,
    "show_2fa_reminder": true  // ← This triggers the redirect
}
```

### Login Response (with 2FA enabled, during grace period)
```json
{
    "refresh": "...",
    "access": "...",
    "user": {...},
    "requires_2fa": false,
    "grace_logins_remaining": 2,
    "message": "Login successful. 2 grace logins remaining before 2FA code required."
}
```

### Login Response (with 2FA enabled, grace period expired)
```json
{
    "requires_2fa": true,
    "temp_token": "...",
    "message": "Please enter your 2FA code"
}
```

## Testing the System

### Test Script Location
```
backend/testing/test_2fa_reminder.py
```

### How to Test
1. Start the backend server: `python manage.py runserver`
2. Update test credentials in `test_2fa_reminder.py`
3. Run the test script:
```bash
cd backend/testing
python test_2fa_reminder.py
```

### Manual Testing
1. Create a staff user without 2FA
2. Log in 3 times
3. On the 3rd login, you should be redirected to `/2fa-setup`
4. Click "Skip for Now"
5. Counter resets, you get 3 more logins

## Configuration Changes

To modify the reminder behavior:

### Change Login Threshold
```python
# In two_factor/models.py
logins_before_reminder = models.IntegerField(default=3)  # Change this number
```

### Change Time Between Reminders
```python
# In two_factor/models.py
hours_between_reminders = models.IntegerField(default=24)  # Change this number
```

### Change Grace Period After Setup
```python
# In two_factor/models.py
grace_logins_allowed = models.IntegerField(default=3)  # Change this number
```

After changing these values, you need to:
1. Create and run a migration: `python manage.py makemigrations two_factor`
2. Apply migration: `python manage.py migrate two_factor`

## Troubleshooting

### Reminder Not Showing After 3 Logins?

**Check:**
1. Is the user a staff member? (admin/doctor/nurse/receptionist/technician)
2. Does the user already have 2FA enabled?
3. Check the database:
```sql
SELECT * FROM two_factor_twofactorreminder WHERE user_id = [USER_ID];
```
4. Check the login_count field

### Counter Not Incrementing?

**Check the backend logs:**
```python
# In users/views.py, the login_count should increment here:
if is_staff and not has_2fa and reminder:
    reminder.increment_login()  # This should run
```

### Reminder Showing Too Often?

**Check if both conditions are triggering:**
- Login count might be ≥ 3
- OR 24 hours might have passed since last reminder

**To reset:**
```python
# In Django shell
from two_factor.models import TwoFactorReminder
reminder = TwoFactorReminder.objects.get(user__email='user@example.com')
reminder.login_count = 0
reminder.last_reminder_shown = None
reminder.save()
```

## Security Notes

1. **2FA is optional** - Users can skip indefinitely, but are reminded regularly
2. **Staff only** - Only staff roles get 2FA reminders
3. **Grace period** - 3 logins without codes after enabling 2FA
4. **Backup codes** - 10 backup codes generated when 2FA is enabled
5. **Time tolerance** - TOTP verification allows ±60 seconds for time drift

## File Locations

### Backend
- Model: `backend/two_factor/models.py`
- Views: `backend/two_factor/views.py`
- Login logic: `backend/users/views.py`
- Migrations: `backend/two_factor/migrations/`

### Frontend
- Login page: `frontend/src/pages/Login.jsx`
- 2FA Setup: `frontend/src/pages/TwoFactorSetup.jsx`
- 2FA Verify: `frontend/src/components/TwoFactorVerify.jsx`

### Testing
- Test script: `backend/testing/test_2fa_reminder.py`
- RBAC tests: `backend/testing/2fa/test_2fa_reminder.py`

---

**Last Updated:** January 24, 2026
**System Version:** DialysisTrack v2.0
