# 🏥 Dialysis Queue Management System - First Time Setup

## 🚀 **COMPLETE FIRST-TIME SETUP COMMANDS**

### **Prerequisites Check:**
```bash
# Verify required software is installed
python --version    # Should show Python 3.8+
node --version      # Should show Node.js 16+
npm --version       # Should show npm 8.0+
```

---

## 📋 **STEP-BY-STEP SETUP (Copy & Paste Each Command)**

### **Step 1: Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install all dependencies (use simplified requirements)
pip install -r requirements-simple.txt

# Install setuptools if needed
pip install setuptools

# Make migrations
python manage.py makemigrations

# Run database migrations
python manage.py migrate

# Start backend server (KEEP THIS RUNNING)
python manage.py runserver
```
**✅ Backend will run at:** http://localhost:8000

if mysql not  run so add comment in requirement.txt # in mysql remove # in pymyql .
add __init__.py file 
"""Backend package initialization.

Use PyMySQL as a drop-in replacement for MySQLdb so Django can connect
to MySQL using the `pymysql` driver without changing settings.
"""
try:
    import pymysql
    pymysql.install_as_MySQLdb()
except Exception:
    # Import errors will surface when running the app; keep top-level import
    # lightweight to avoid hiding unexpected issues during import time.
    pass

### **Step 2: Frontend Setup (NEW TERMINAL)**
```bash
# Open NEW terminal window and navigate to frontend
cd frontend

# Install all dependencies
npm install

# Start frontend server (KEEP THIS RUNNING)
npm run dev
```
**✅ Frontend will run at:** http://localhost:5173

---

## 🔐 **DJANGO ADMIN PANEL ACCESS**

**Admin Panel URL:** http://localhost:8000/admin

| Field | Value |
|-------|-------|
| **Username** | admin@dialysis.com |
| **Email** | admin@dialysis.com |
| **Password** | Admin@2026 |

**What can you do in Django Admin?**
- ✅ Add, Edit, Delete Patients
- ✅ Manage Dialysis Machines (change status, maintenance)
- ✅ Control Queue (change priority, status)
- ✅ Manage Users and Staff
- ✅ View and Edit Appointments
- ✅ Manage Billing and Payments
- ✅ All changes in Django Admin will reflect on the website immediately!

---

## 🔑 **LOGIN CREDENTIALS (After Running setup_database.py)**

### 🏥 **HOSPITAL STAFF ACCESS**

| Role | Name | Email | Password | Access Level |
|------|------|-------|----------|--------------|
| **👑 Admin** | System Administrator | admin@dialysis.com | admin123 | Full system access + Django Admin |
| **👨‍⚕️ Doctor 1** | Dr. John Smith | dr.smith@dialysis.com | staff123 | Patient records, queue, reports |
| **👨‍⚕️ Doctor 2** | Dr. Sarah Johnson | dr.johnson@dialysis.com | staff123 | Patient records, queue, reports |
| **👩‍⚕️ Nurse 1** | Emily Wilson | nurse.wilson@dialysis.com | staff123 | Queue management, patient updates |
| **👩‍⚕️ Nurse 2** | Michael Brown | nurse.brown@dialysis.com | staff123 | Queue management, patient updates |
| **🔧 Technician 1** | Robert Davis | tech.davis@dialysis.com | staff123 | Machine management, queue monitoring |
| **� Technician 2** | Maria Garcia | tech.garcia@dialysis.com | staff123 | Machine maintenance, equipment |
| **�📋 Receptionist** | Lisa Anderson | reception@dialysis.com | staff123 | Registration, appointments, billing |

### 👥 **PATIENT ACCESS**

| Patient ID | Name | Email | Password | Access |
|------------|------|-------|----------|--------|
| **P001** | James Miller | james.miller@email.com | patient123 | Own appointments & medical records |
| **P002** | Patricia Martinez | patricia.martinez@email.com | patient123 | Own appointments & medical records |
| **P003** | Robert Taylor | robert.taylor@email.com | patient123 | Own appointments & medical records |
| **P004** | Linda Thomas | linda.thomas@email.com | patient123 | Own appointments & medical records |
| **P005** | William Moore | william.moore@email.com | patient123 | Own appointments & medical records |
| **P006** | Jennifer White | jennifer.white@email.com | patient123 | Own appointments & medical records |


---

### 📋 **ROLE PERMISSIONS**

**👑 Admin:**
- Full system access
- User management
- System settings
- All reports

**👨⚕️ Doctor:**
- View/add/edit patients
- Manage appointments
- View/update dialysis queue
- Access all reports
- View machine status

**👩⚕️ Nurse:**
- View/update patients
- Full queue management
- Machine monitoring
- Start/complete treatments

**🔧 Technician:**
- Machine management
- Queue monitoring
- Equipment maintenance

**📋 Receptionist:**
- Patient registration
- Appointment scheduling
- Billing management
- Front desk operations

**🏥 Patient:**
- View own appointments
- View own billing
- View own treatment reports
- Update personal info 

---

## ⚡ **QUICK START (Alternative Method)**

### **Windows Users - Use Batch File:**
```bash
# Double-click or run from command prompt
run-local.bat
```

### **Manual Start (If batch file doesn't work):**
```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
python manage.py runserver

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

---

## 🌐 **ACCESS URLS AFTER SETUP**

### **Application URLs:**
- **🌐 Frontend:** http://localhost:5173
- **🔧 Backend API:** http://localhost:8000
- **👑 Admin Panel:** http://localhost:8000/admin

### **Test Login:**
1. Go to: http://localhost:5173
2. Use: **admin@dialysis.com** / **admin123**
3. Should see dashboard with data

### **Alternative Test Logins:**
- **Doctor:** dr.smith@dialysis.com / staff123
- **Nurse:** nurse.wilson@dialysis.com / staff123
- **Patient:** james.miller@email.com / patient123

---

## 🎯 **DJANGO ADMIN PANEL - FULL CONTROL**

### **What is Django Admin?**
Django Admin is a powerful web-based interface where you can:
- ✅ **Add, Edit, Delete** all data (patients, machines, queue, appointments, billing)
- ✅ **Bulk Operations** - Update multiple records at once
- ✅ **Real-Time Sync** - Changes reflect on website immediately
- ✅ **Advanced Filters** - Find data quickly
- ✅ **Custom Actions** - One-click operations with emojis

### **Access Django Admin:**
**URL:** http://localhost:8000/admin
**Email:** admin@dialysis.com
**Password:** Admin@2026

### **What You Can Do:**

#### 👥 **Users Management**
- Add new staff (doctors, nurses, technicians, receptionists)
- Activate/Deactivate users
- Grant or remove permissions
- **Actions:** Activate users, Deactivate users, Grant staff access

#### 🏥 **Patients Management**
- Add new patients
- Edit patient information
- Mark as emergency
- **Actions:** Mark as Emergency, Activate/Deactivate patients

#### 🏥 **Dialysis Machines**
- Add new machines
- Change machine status (Available, In Use, Maintenance, Out of Service)
- Schedule maintenance
- **Actions:** 🟢 Available, 🔵 In Use, 🟡 Maintenance, 🔴 Out of Service

#### 🎫 **Queue Management**
- Add patients to queue
- Change queue status (Waiting, In Progress, Completed, Cancelled)
- Set priority (Emergency, High, Normal, Low)
- Assign machines
- **Actions:** Change status, Set priority, Bulk operations

#### 💰 **Billing & Payments**
- Create bills
- Record payments
- Track payment status
- Manage insurance

### **🔄 Django Admin ↔ Website Sync:**
```
Add Patient in Django Admin → Appears on Website Immediately
Change Machine Status → Website Dashboard Updates
Update Queue → Frontend Reflects Changes
```

**📖 Full Guide:** See `DJANGO_ADMIN_GUIDE.md` for detailed instructions

---

## 🐛 **TROUBLESHOOTING**

### **"Failed to fetch" Error:**
```bash
# Make sure backend is running on port 8000
cd backend
venv\Scripts\activate
python manage.py runserver

# Check if backend is accessible
# Open browser: http://localhost:8000/api/
```

### **Port Issues:**
```bash
# Kill processes on ports
npx kill-port 5173  # Frontend
npx kill-port 8000  # Backend
```

### **Database Issues:**
```bash
# Reset database and recreate all data (CAREFUL: This deletes all data!)
cd backend
python manage.py flush --noinput
python manage.py migrate
python setup_database.py

# Or verify current database setup
python verify_database.py
```

### **Package Issues:**
```bash
# Backend - reinstall packages
cd backend
pip install --force-reinstall -r requirements.txt

# Frontend - reinstall packages
cd frontend
rmdir /s node_modules
del package-lock.json
npm install
```

---

## 🎯 **DAILY DEVELOPMENT COMMANDS**

### **Start Both Servers:**
```bash
# Method 1: Use batch file
run-local.bat

# Method 2: Manual (2 terminals)
# Terminal 1:
cd backend && venv\Scripts\activate && python manage.py runserver

# Terminal 2:
cd frontend && npm run dev
```

### **Essential Commands:**
```bash
# Backend commands
python manage.py runserver               # Start server
python manage.py migrate                 # Apply migrations
python manage.py createsuperuser         # Create custom admin user
python setup_database.py                 # Setup all database data
python verify_database.py                # Verify database setup

# Frontend commands
npm run dev                              # Start dev server
npm run build                            # Build for production
npm install package-name                 # Install new package
```

---

## ✅ **VERIFICATION CHECKLIST**

### **After Running Setup Commands:**
- [ ] Backend running at http://localhost:8000
- [ ] Frontend running at http://localhost:5173  
- [ ] Can login with **admin@dialysis.com** / **admin123**
- [ ] Dashboard shows sample data (6 patients, 6 machines, etc.)
- [ ] No "Failed to fetch" errors
- [ ] MySQL database connected (check .env file)

### **If Something Doesn't Work:**
1. **Check both terminals are running**
2. **Verify URLs are correct**
3. **Clear browser cache**
4. **Run troubleshooting commands above**

---

## 🎉 **SUCCESS!**

Your Dialysis Queue Management System is ready with:

✅ **MySQL Database** - Connected with sample data  
✅ **User Authentication** - JWT-based login  
✅ **Role-Based Access** - 6 roles (Admin, Doctor, Nurse, Technician, Receptionist, Patient)  
✅ **Full CRUD Operations** - Add/Edit/Delete patients, queue, machines  
✅ **Real-Time Updates** - Live status changes  
✅ **Professional UI** - Loading states, notifications, error handling  
✅ **Sample Data Ready** - 6 patients, 6 machines, appointments, queue, billing

**🌐 Access:** http://localhost:5173  
**🔑 Login:** admin@dialysis.com / admin123

**📊 Database Contents:**
- 1 Admin user + 7 Staff members + 6 Patients
- 6 Dialysis Machines (various manufacturers)
- Sample Appointments scheduled
- Active Queue entries
- Sample Billing records

**Start managing your dialysis center efficiently!** 🏥