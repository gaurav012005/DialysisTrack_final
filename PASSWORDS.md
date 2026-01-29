# 🔑 DIALYSISTRACK - ALL LOGIN CREDENTIALS

## 🗄️ DATABASE CONFIGURATION

**File:** `backend/.env`
```
DB_NAME=dialysistrack_db
DB_USER=root
DB_PASSWORD=gaurav2005
DB_HOST=localhost
DB_PORT=3306
```

---

## 👑 ADMIN / SUPERUSER

**Django Admin Panel:** http://localhost:8000/admin

| Field | Value |
|-------|-------|
| Email | admin@dialysis.com |
| Password | Admin@2026 |
| Role | Admin |
| Access | Full system access + Django Admin Panel |

**Note:** This is the Django superuser account with full administrative privileges.
You can manage all data through the Django admin panel at http://localhost:8000/admin

---

## 👨‍⚕️ DOCTORS

| Name | Email | Password | Role |
|------|-------|----------|------|
| Dr. John Smith | dr.smith@dialysis.com | staff123 | Doctor |
| Dr. Sarah Johnson | dr.johnson@dialysis.com | staff123 | Doctor |

**Access:** Patient records, queue management, reports

---

## 👩‍⚕️ NURSES

| Name | Email | Password | Role |
|------|-------|----------|------|
| Emily Wilson | nurse.wilson@dialysis.com | staff123 | Nurse |
| Michael Brown | nurse.brown@dialysis.com | staff123 | Nurse |

**Access:** Queue management, patient updates, treatments

---

## 🔧 TECHNICIANS

| Name | Email | Password | Role |
|------|-------|----------|------|
| Robert Davis | tech.davis@dialysis.com | staff123 | Technician |
| Maria Garcia | tech.garcia@dialysis.com | staff123 | Technician |

**Access:** Machine management, maintenance, queue monitoring

---

## 📋 RECEPTIONIST

| Name | Email | Password | Role |
|------|-------|----------|------|
| Lisa Anderson | reception@dialysis.com | staff123 | Receptionist |

**Access:** Registration, appointments, billing

---

## 👥 PATIENTS

| Patient ID | Name | Email | Password |
|------------|------|-------|----------|
| P001 | James Miller | james.miller@email.com | patient123 |
| P002 | Patricia Martinez | patricia.martinez@email.com | patient123 |
| P003 | Robert Taylor | robert.taylor@email.com | patient123 |
| P004 | Linda Thomas | linda.thomas@email.com | patient123 |
| P005 | William Moore | william.moore@email.com | patient123 |
| P006 | Jennifer White | jennifer.white@email.com | patient123 |

**Access:** Own appointments, medical records, billing

---

## 📝 QUICK REFERENCE

### Default Passwords:
- **Admin:** `Admin@2026` (Django superuser - full admin panel access)
- **All Staff (Doctors, Nurses, Technicians, Receptionist):** `staff123`
- **All Patients:** `patient123`

### Common Logins for Testing:
```
🔐 Admin Login (Django Admin Panel):
   URL: http://localhost:8000/admin
   Email: admin@dialysis.com
   Password: Admin@2026

🔐 Admin Login (Website):
   URL: http://localhost:3000
   Email: admin@dialysis.com
   Password: Admin@2026

🔐 Doctor Login:
   Email: dr.smith@dialysis.com
   Password: staff123

🔐 Nurse Login:
   Email: nurse.wilson@dialysis.com
   Password: staff123

🔐 Patient Login:
   Email: james.miller@email.com
   Password: patient123
```

---

## 🛠️ DATABASE SETUP COMMANDS

### Initial Setup (First Time):
```bash
cd backend
python setup_database.py
```

### Verify Database:
```bash
cd backend
python verify_database.py
```

### Reset Database (CAUTION - Deletes all data):
```bash
cd backend
python manage.py flush --noinput
python manage.py migrate
python setup_database.py
```

### Create Custom Superuser:
```bash
cd backend
python manage.py createsuperuser
# Follow prompts to enter email, username, and password
```

---

## 🌐 ACCESS URLS

- **Frontend Application:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:8000/admin
- **API Documentation:** http://localhost:8000/api/

---

## 📊 DATABASE STATISTICS

After running `setup_database.py`, your database contains:

- **Users:** 14 total
  - 1 Admin
  - 2 Doctors
  - 2 Nurses
  - 2 Technicians
  - 1 Receptionist
  - 6 Patients

- **Machines:** 6 dialysis machines
  - 4 Available
  - 1 In Use
  - 1 Under Maintenance

- **Appointments:** Sample appointments scheduled
- **Queue Entries:** Active queue with patients
- **Billing Records:** Sample bills (pending and paid)

---

## 🔒 SECURITY NOTES

⚠️ **IMPORTANT:** These are development credentials only!

For production deployment:
1. Change all default passwords
2. Use strong, unique passwords
3. Update the `SECRET_KEY` in backend/.env
4. Set `DEBUG=False` in production
5. Configure proper CORS settings
6. Use environment-specific .env files

---

**Last Updated:** January 24, 2026
**Database:** MySQL (dialysistrack_db)
**Setup Script:** backend/setup_database.py
