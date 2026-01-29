# Two-Factor Authentication (2FA) - Quick Reference

## 📍 Documentation Location
All 2FA documentation has been moved to: **`backend/two_factor/`**

---

## 🎯 Quick Links

### For Current Implementation
👉 **[backend/two_factor/SMART_2FA_IMPLEMENTATION.md](./backend/two_factor/SMART_2FA_IMPLEMENTATION.md)** ⭐  
Complete guide to the current 2FA system with mandatory setup and grace period

### For Module Overview
👉 **[backend/two_factor/README.md](./backend/two_factor/README.md)**  
Index of all 2FA documentation and module structure

### For Testing
👉 **[backend/two_factor/2FA_SCRIPTS_GUIDE.md](./backend/two_factor/2FA_SCRIPTS_GUIDE.md)**  
Testing scripts and development guide

---

## ⚡ Current System Summary

### What Staff Users Experience:
1. **First Login**: Forced to set up 2FA (no skip option)
2. **Grace Period**: Next 3 logins OR 24 hours without code needed
3. **Regular Use**: Code required on 4th login or after 24 hours
4. **Cannot Disable**: 2FA is mandatory and cannot be turned off

### Key Features:
- ✅ Mandatory setup for all staff roles
- ✅ Grace period (3 logins or 24 hours)
- ✅ Cannot skip or disable
- ✅ Backup codes for recovery
- ✅ TOTP (Time-based One-Time Password)

### Staff Roles Requiring 2FA:
- Admin, Doctor, Nurse, Receptionist, Technician

### No 2FA Required:
- Patient

---

## 📚 All Documentation Files

Located in `backend/two_factor/`:

| File | Status | Purpose |
|------|--------|---------|
| **SMART_2FA_IMPLEMENTATION.md** | ✅ Current | Complete implementation guide |
| **README.md** | ✅ Active | Module index and overview |
| **2FA_SCRIPTS_GUIDE.md** | ✅ Reference | Testing and development |
| MANDATORY_2FA_IMPLEMENTATION.md | ⚠️ Historical | Early implementation |
| 2FA_REMINDER_COMPLETE.md | ⚠️ Historical | Reminder system docs |
| 2FA_GRACE_PERIOD_COMPLETE.md | ⚠️ Historical | Grace period docs |
| 2FA_FOR_ALL_STAFF.md | ⚠️ Historical | Planning document |
| 2FA_REMINDER_SYSTEM.md | ⚠️ Historical | Design document |

---

## 🔧 Quick Actions

### View Current Implementation
```bash
cd backend/two_factor
cat SMART_2FA_IMPLEMENTATION.md
```

### View Module Index
```bash
cd backend/two_factor  
cat README.md
```

### Test 2FA System
```bash
cd backend/two_factor
cat 2FA_SCRIPTS_GUIDE.md
```

---

## 🎓 For More Information

Navigate to `backend/two_factor/` directory and start with **README.md** for complete navigation.

---

**Version**: 2.0 (Smart 2FA with Grace Period)  
**Last Updated**: January 24, 2026  
**Status**: ✅ Active
