# Backend: Testing Module (`testing/`)

## 📁 Folder Structure

```
testing/
├── __init__.py
├── 2fa/                              # 2FA-specific test files and docs
├── ACCESS_CONTROL_MATRIX.md          # Role-permission matrix documentation
├── README.md                         # Testing overview
│
├── ── Setup & Data Scripts ──
├── create_admin_user.py              # Create admin accounts
├── create_hospital_users.py          # Create all hospital staff users
├── create_sample_data.py             # Populate sample patient/queue data
├── create_billing_data.py            # Create sample billing records
├── create_patient_logins.py          # Create patient login accounts
├── create_test_users.py              # Create test users for all roles
├── create_user_roles.py              # Set up user roles
├── cleanup_create_single_users.py    # Clean up duplicates and create single users
├── cleanup_duplicates.py             # Remove duplicate user records
├── reset_users.py                    # Reset all user accounts
│
├── ── Fix Scripts ──
├── fix_admin_role.py                 # Fix admin role assignments
├── fix_doctor_nurse.py               # Fix doctor/nurse user issues
├── fix_machine_serializer.py         # Fix machine serializer bugs
├── fix_user_active.py                # Fix user `is_active` flag issues
│
├── ── Test Scripts ──
├── test_auth.py                      # Authentication endpoint tests
├── test_auth_billing.py              # Auth + billing integration tests
├── test_billing.py                   # Billing module tests
├── test_billing_system.py            # Comprehensive billing system tests (11KB)
├── test_dialysis_sessions.py         # Dialysis session tests
├── test_export.py                    # Export functionality tests
├── test_export_legacy.py             # Legacy export tests
├── test_patient_login.py             # Patient login tests
├── test_patient_login_full.py        # Full patient login flow tests (9.5KB)
├── test_pdf_direct.py                # Direct PDF generation tests
├── test_role_permissions.py          # Role-based permission tests (11KB)
├── test_urls.py                      # URL routing tests
├── test_2fa_reminder.py              # 2FA reminder system tests
│
├── ── Utility Scripts ──
├── check_all_data.py                 # Check database data integrity
├── debug_auth.py                     # Debug authentication issues
├── setup_mysql.py                    # MySQL database setup
├── simple_billing_test.py            # Simple billing endpoint test
├── simple_test_export.py             # Simple export test
├── tes-config-endpoint.py            # Config endpoint test
└── update_machine_data.py            # Update machine data in DB
```

---

## 🔧 How It Works

### 1. Key Test Files

#### `test_role_permissions.py` (11KB)
Comprehensively tests the RBAC system:
- Tests all 7 roles (admin, doctor, nurse, technician, receptionist, patient, driver)
- Verifies each role can only access allowed endpoints
- Tests object-level permissions (patients seeing only their own data)
- Tests forbidden access returns 403

#### `test_billing_system.py` (11KB)
Full billing lifecycle tests:
- Bill creation with auto-calculation
- Payment processing (cash, UPI, card, net banking)
- Bill status updates (pending → partial → paid)
- Receipt generation
- Dashboard statistics

#### `test_patient_login_full.py` (9.5KB)
End-to-end patient auth testing:
- Patient account creation
- Login with email/password
- JWT token validation
- Patient-specific data access
- Cross-account access prevention

### 2. Setup Scripts

These scripts populate the database with test data:

| Script | What it creates |
|--------|----------------|
| `create_hospital_users.py` | Admin, 3 doctors, 3 nurses, 2 technicians, 2 receptionists |
| `create_sample_data.py` | 10 patients, queue entries, appointments |
| `create_billing_data.py` | Bills, payments, insurance records |
| `create_patient_logins.py` | Patient login accounts |

### 3. Running Tests

```bash
# Run all tests
python manage.py test testing

# Run specific test file
python manage.py test testing.test_role_permissions

# Run setup scripts
python testing/create_hospital_users.py
python testing/create_sample_data.py
```

---

### 4. Key Features

- **38 test/utility files** covering all modules
- **Role permission matrix** documented in `ACCESS_CONTROL_MATRIX.md`
- **Database setup scripts** for quick environment provisioning
- **Fix scripts** for common data issues
- **Integration tests** spanning auth + billing, auth + patients
