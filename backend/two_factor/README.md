# Two-Factor Authentication Module Documentation

## Overview
This directory contains the complete Two-Factor Authentication (2FA) implementation for DialysisTrack, including all backend code, models, and comprehensive documentation.

---

## 📁 Module Structure

### Core Files
- **`models.py`** - Database models for 2FA devices, backup codes, and reminders
- **`views.py`** - API endpoints for 2FA setup, verification, and management
- **`serializers.py`** - Data serializers for 2FA operations
- **`urls.py`** - URL routing for 2FA endpoints
- **`admin.py`** - Django admin interface for 2FA management

### Migrations
- **`migrations/`** - Database migration files for 2FA models

---

## 📚 Documentation Files

### Current Implementation (RECOMMENDED)
📖 **[SMART_2FA_IMPLEMENTATION.md](./SMART_2FA_IMPLEMENTATION.md)** ⭐
- **Status**: ✅ Active (Current System)
- **Description**: Complete guide to the smart 2FA system
- **Features**:
  - Mandatory 2FA setup for all staff
  - Grace period: 3 logins OR 24 hours before verification required
  - No skip option during setup
  - Staff cannot disable 2FA
- **Read this first** for understanding the current implementation

### Previous Implementations (HISTORICAL)

📖 **[MANDATORY_2FA_IMPLEMENTATION.md](./MANDATORY_2FA_IMPLEMENTATION.md)**
- **Status**: ⚠️ Superseded
- **Description**: Early version requiring 2FA verification on EVERY login
- **Why replaced**: Too restrictive - no grace period

📖 **[2FA_REMINDER_COMPLETE.md](./2FA_REMINDER_COMPLETE.md)**
- **Status**: ⚠️ Superseded  
- **Description**: Optional 2FA with reminder system
- **Why replaced**: Not secure enough - allowed skipping

📖 **[2FA_GRACE_PERIOD_COMPLETE.md](./2FA_GRACE_PERIOD_COMPLETE.md)**
- **Status**: ⚠️ Superseded
- **Description**: Intermediate implementation with grace period
- **Why replaced**: Evolved into SMART_2FA_IMPLEMENTATION.md

📖 **[2FA_FOR_ALL_STAFF.md](./2FA_FOR_ALL_STAFF.md)**
- **Status**: ⚠️ Historical
- **Description**: Planning document for mandatory 2FA rollout

📖 **[2FA_REMINDER_SYSTEM.md](./2FA_REMINDER_SYSTEM.md)**
- **Status**: ⚠️ Historical
- **Description**: Design document for reminder-based system

### Testing & Development

📖 **[2FA_SCRIPTS_GUIDE.md](./2FA_SCRIPTS_GUIDE.md)**
- **Status**: ✅ Reference
- **Description**: Testing scripts and development guide
- **Contains**: Test scenarios, curl commands, database queries

---

## 🚀 Quick Start

### For Developers
1. Read **SMART_2FA_IMPLEMENTATION.md** for current system understanding
2. Review `models.py` for database schema
3. Check `views.py` for API endpoints
4. Use **2FA_SCRIPTS_GUIDE.md** for testing

### For System Administrators
1. Read the "User Experience Timeline" in **SMART_2FA_IMPLEMENTATION.md**
2. Understand grace period rules
3. Know how to handle lost authenticator devices (backup codes)
4. Familiarize with troubleshooting section

### For New Staff Members
1. On first login, you'll be redirected to 2FA setup
2. Install Google Authenticator or similar app
3. Scan QR code
4. Save backup codes securely
5. Grace period begins - next 3 logins won't need code

---

## 🔑 Key Features

### Current System (Smart 2FA)
✅ **Mandatory Setup** - All staff must set up 2FA (no skip)  
✅ **Grace Period** - 3 logins OR 24 hours before code required  
✅ **Cannot Disable** - Staff cannot turn off 2FA  
✅ **Backup Codes** - 10 one-time use codes for recovery  
✅ **Time-Based Codes** - Standard TOTP (Time-based One-Time Password)  

### Security Benefits
- 🔒 Protects patient data
- 🔒 Prevents unauthorized access
- 🔒 Meets healthcare compliance standards
- 🔒 Regular verification ensures active security

### Usability Features
- 👍 Not every login requires code
- 👍 Predictable verification schedule
- 👍 Clear communication of grace period status
- 👍 Backup codes for emergency access

---

## 🛠️ API Endpoints

### Setup & Status
- `POST /api/two-factor/setup/` - Generate QR code for 2FA setup
- `POST /api/two-factor/verify_setup/` - Verify and enable 2FA
- `GET /api/two-factor/status/` - Check if 2FA is enabled

### Verification
- `POST /api/two-factor/verify_login/` - Verify 2FA code during login

### Management
- `POST /api/two-factor/disable/` - Disable 2FA (BLOCKED for staff)
- `GET /api/two-factor/backup_codes/` - View masked backup codes
- `POST /api/two-factor/regenerate_backup_codes/` - Generate new codes

### Deprecated
- `POST /api/two-factor/skip_reminder/` - Returns 403 (disabled)

---

## 📊 Database Models

### `TOTPDevice` (from django-otp)
- Stores TOTP secret keys
- Links to User model
- Tracks confirmation status

### `BackupCode`
- One-time use recovery codes
- 10 codes per user
- Tracks used vs. unused

### `TwoFactorReminder`
- Manages grace period
- Tracks login count
- Records last verification time

---

## 🧪 Testing

See **[2FA_SCRIPTS_GUIDE.md](./2FA_SCRIPTS_GUIDE.md)** for:
- Test scenarios
- API testing commands
- Database inspection queries
- Troubleshooting steps

---

## 🔄 Version History

| Version | Date | Description | Status |
|---------|------|-------------|--------|
| 2.0 | Jan 24, 2026 | Smart 2FA with grace period | ✅ Current |
| 1.5 | Jan 24, 2026 | Mandatory verification every login | ⚠️ Superseded |
| 1.0 | Jan 23, 2026 | Optional 2FA with reminders | ⚠️ Superseded |

---

## 📞 Support

### Common Issues
See "Troubleshooting" section in **SMART_2FA_IMPLEMENTATION.md**

### Code Issues
- Check `models.py` for database schema
- Review `views.py` for logic
- Use Django admin for manual intervention

### User Issues
- Lost phone: Use backup codes
- Lost backup codes: Admin must disable 2FA
- Code not working: Check time synchronization

---

## 🎯 Best Practices

### For Developers
- Always test 2FA changes in development first
- Don't bypass 2FA checks in production
- Keep documentation updated with code changes
- Test grace period edge cases

### For Administrators  
- Educate staff about grace period rules
- Keep admin Django credentials secure
- Monitor 2FA adoption rates
- Have backup code recovery process

### For Staff Users
- Save backup codes in secure location
- Keep authenticator app updated
- Understand grace period limits
- Report issues promptly

---

## 📝 Contributing

When making changes to 2FA:
1. Update relevant documentation
2. Test thoroughly (all scenarios in 2FA_SCRIPTS_GUIDE.md)
3. Update this README if adding new files
4. Mark superseded docs appropriately
5. Keep SMART_2FA_IMPLEMENTATION.md as source of truth

---

**Current Implementation**: Smart 2FA (v2.0)  
**Last Updated**: January 24, 2026  
**Maintained By**: DialysisTrack Development Team
