# Backend Testing Scripts

This folder contains all testing and utility scripts for the DialysisTrack backend.

## Test Scripts

### Role-Based Access Control
- **`test_role_permissions.py`** - **[NEW]** Comprehensive test of all module permissions for every role
  - Tests all API endpoints for each role
  - Generates detailed access control matrix  
  - Creates markdown and text reports
  - Shows ✅/❌ access status for each module

### User Management
- **`create_test_users.py`** - Creates test users for all roles (admin, doctor, nurse, technician, receptionist, patient)
- **`cleanup_duplicates.py`** - Cleans up duplicate user accounts
- **`fix_doctor_nurse.py`** - Fixes doctor and nurse account passwords

### Authentication Tests
- **`test_auth.py`** - Tests authentication endpoints
- **`test_auth_billing.py`** - Tests billing authentication
- **`test_patient_login.py`** - Tests patient login functionality
- **`test_patient_login_full.py`** - Full patient login flow test

### Billing Tests
- **`test_billing.py`** - Basic billing tests
- **`test_billing_system.py`** - Complete billing system tests
- **`simple_billing_test.py`** - Simple billing workflow test

### Export & PDF Tests  
- **`test_export.py`** - Tests data export functionality
- **`test_export_legacy.py`** - Legacy export tests
- **`simple_test_export.py`** - Simple export tests
- **`test_pdf_direct.py`** - Direct PDF generation tests

### Dialysis Session Tests
- **`test_dialysis_sessions.py`** - Tests dialysis session management

### URL Tests
- **`test_urls.py`** - Tests URL routing

## Running Tests

### Create Test Users
```bash
cd backend
python testing/create_test_users.py
```

### Clean Up Duplicate Users
```bash
cd backend
python testing/cleanup_duplicates.py
```

### Run Specific Test
```bash
cd backend
python testing/test_auth.py
```

## Test Credentials

After running `create_test_users.py`, you'll have these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | admin123 |
| Doctor | doctor@test.com | doctor123 |
| Nurse | nurse@test.com | nurse123 |
| Technician | technician@test.com | tech123 |
| Receptionist | receptionist@test.com | reception123 |
| Patient | patient@test.com | patient123 |

## Notes

- All test scripts are standalone and can be run independently
- Make sure Django environment is properly set up before running tests
- Database changes made by test scripts are **permanent** - use with caution