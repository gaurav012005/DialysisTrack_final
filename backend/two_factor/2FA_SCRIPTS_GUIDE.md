# 🛠️ 2FA Management Scripts

## 📁 Available Scripts

### 1. Check Reminder Status
**File:** `backend/testing/2fa/check_2fa_reminders.py`

Check the current 2FA reminder status for all users.

**Usage:**
```bash
cd backend
python testing/2fa/check_2fa_reminders.py
```

**What it shows:**
- ✅ Which users have 2FA enabled
- ⚠️ Who will see reminders on next login
- 📊 Logout counts and grace period status
- 🔐 Verification requirements
- 📈 Summary statistics

**Example Output:**
```
📧 admin@dialysistrack.com (admin)
----------------------------------------------------------------------
   2FA Enabled: ✅ Yes
   Backup Codes: 10 remaining

   Reminder Tracker:
   ├─ Logout count: 2
   ├─ Skip count: 1
   ├─ Grace logins: 1
   ├─ Last reminder: 12.5 hours ago
   └─ Should show reminder: ✅ No
   └─ Needs 2FA code: ✅ No (grace period)
```

---

### 2. Disable All 2FA
**File:** `backend/testing/2fa/disable_all_2fa.py`

Remove 2FA for ALL users (testing/reset purposes).

**Usage:**

**Interactive mode (with confirmation):**
```bash
cd backend
python testing/2fa/disable_all_2fa.py
```
Then type `YES` to confirm.

**Quick mode (no confirmation):**
```bash
cd backend
python testing/2fa/disable_all_2fa.py --quick
```
or
```bash
python testing/2fa/disable_all_2fa.py -q
```

**What it does:**
- 🗑️ Deletes all TOTP devices
- 🗑️ Deletes all backup codes
- ♻️ Resets all reminder trackers
- ✅ Users can login with password only

**Example Output:**
```
✅ Disabled 2FA for all users
   - Deleted 2 TOTP devices
   - Deleted 20 backup codes
   - Reset all reminder trackers
```

---

## 🎯 Common Use Cases

### Testing the Reminder System
```bash
# 1. Check current status
python check_2fa_reminders.py

# 2. Disable all 2FA
python disable_all_2fa.py --quick

# 3. Now login and test the flow
# Users will be clean slate for testing
```

### Before Demo
```bash
# Make sure no users have reminders triggered
python check_2fa_reminders.py

# If needed, disable all and start fresh
python disable_all_2fa.py --quick
```

### Checking Grace Period Status
```bash
# See who's in grace period (3 free logins)
python check_2fa_reminders.py
# Look for "Grace logins: X" in the output
```

### Clean Reset After Testing
```bash
# Remove all 2FA setup
python disable_all_2fa.py -q

# Verify it's clean
python check_2fa_reminders.py
```

---

## 📊 Script Features

### check_2fa_reminders.py
✅ Shows detailed status for each user  
✅ Identifies who will see reminders  
✅ Displays grace period information  
✅ Summary statistics  
✅ Safe read-only operation  

### disable_all_2fa.py
✅ Interactive confirmation mode  
✅ Quick mode for scripts  
✅ Deletes all 2FA data  
✅ Resets reminder trackers  
✅ Shows what was deleted  

---

## ⚠️ Important Notes

### For disable_all_2fa.py:
- **USE WITH CAUTION** in production
- Removes ALL 2FA security
- Users lose their backup codes
- Cannot be undone
- Users must re-enable 2FA from scratch

### For check_2fa_reminders.py:
- Safe to run anytime
- Read-only operation
- No data changes
- Great for debugging

---

## 🚀 Quick Commands

```bash
# Check status
python check_2fa_reminders.py

# Disable all (with confirmation)
python disable_all_2fa.py

# Disable all (instant, no prompt)
python disable_all_2fa.py --quick

# Run from project root
cd backend && python testing/2fa/check_2fa_reminders.py
cd backend && python testing/2fa/disable_all_2fa.py -q
```

---

## 📝 Example Workflow

### Testing the Complete 2FA Flow:

```bash
# Step 1: Clean slate
cd backend
python disable_all_2fa.py --quick

# Step 2: Trigger reminder for admin
python manage.py shell -c "from two_factor.models import TwoFactorReminder; from django.contrib.auth import get_user_model; User = get_user_model(); user = User.objects.get(email='admin@dialysistrack.com'); r, _ = TwoFactorReminder.objects.get_or_create(user=user); r.logout_count = 5; r.save(); print('✅ Set reminder trigger')"

# Step 3: Check it worked
python check_2fa_reminders.py

# Step 4: Login and test
# Go to http://localhost:3000/login
# admin@dialysistrack.com / admin123
# Should redirect to /2fa-setup
```

---

## ✅ Scripts Ready!

Both scripts are production-ready and tested:
- ✅ `testing/2fa/check_2fa_reminders.py` - Status checker
- ✅ `testing/2fa/disable_all_2fa.py` - 2FA remover

Use them for testing, debugging, and managing your 2FA system!
