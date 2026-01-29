# 🗄️ DialysisTrack Database Setup Guide
## **From Creation to Testing - Complete Guide**

---

## 📋 **Table of Contents**
1. [Prerequisites](#prerequisites)
2. [Step 1: Install MySQL](#step-1-install-mysql)
3. [Step 2: Create Database](#step-2-create-database)
4. [Step 3: Configure Django](#step-3-configure-django)
5. [Step 4: Run Migrations](#step-4-run-migrations)
6. [Step 5: Create Admin User](#step-5-create-admin-user)
7. [Step 6: Populate Sample Data](#step-6-populate-sample-data)
8. [Step 7: Testing](#step-7-testing)
9. [Troubleshooting](#troubleshooting)

---

## ✅ **Prerequisites**

Before starting, ensure you have:
- ✅ Python 3.8+ installed
- ✅ MySQL Server installed (or ready to install)
- ✅ Access to command line/terminal

---

## 🔧 **Step 1: Install MySQL**

### **Option A: Download MySQL Installer (Recommended for Windows)**

1. **Download MySQL:**
   - Go to: https://dev.mysql.com/downloads/installer/
   - Download "MySQL Installer for Windows"
   - Choose "mysql-installer-community" version

2. **Install MySQL:**
   - Run the installer
   - Choose "Custom" installation type
   - Select:
     - ✅ MySQL Server 8.0 (or latest)
     - ✅ MySQL Workbench (optional but helpful)
   - Click "Next" → "Execute" to install

3. **Configure MySQL Server:**
   - **Authentication Method:** Use Strong Password Encryption
   - **Root Password:** Set a password (e.g., `root123` or your choice)
   - ⚠️ **IMPORTANT: Remember this password!**
   - **Windows Service:** Keep default settings
   - Click "Execute" to apply configuration

4. **Verify Installation:**
   ```bash
   mysql --version
   ```
   Should show: `mysql  Ver 8.0.x for Win64`

### **Option B: Using Chocolatey (Alternative)**
```bash
choco install mysql
```

---

## 🗃️ **Step 2: Create Database**

### **Method 1: Using MySQL Command Line (Recommended)**

1. **Open MySQL Command Line:**
   ```bash
   mysql -u root -p
   ```
   Enter the root password you set during installation

2. **Create Database:**
   ```sql
   CREATE DATABASE dialysistrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Verify Database Created:**
   ```sql
   SHOW DATABASES;
   ```
   You should see `dialysistrack_db` in the list

4. **Exit MySQL:**
   ```sql
   EXIT;
   ```

### **Method 2: Using MySQL Workbench (GUI)**

1. Open MySQL Workbench
2. Connect to your local MySQL instance
3. Click on "Create new schema" icon
4. Name: `dialysistrack_db`
5. Character Set: `utf8mb4`
6. Collation: `utf8mb4_unicode_ci`
7. Click "Apply"

---

## ⚙️ **Step 3: Configure Django**

### **3.1: Navigate to Backend Directory**
```bash
cd "c:\5th sem\100 working project\DialysisTrack\backend"
```

### **3.2: Create .env File**

Create a new file named `.env` in the backend directory:

```bash
# Copy the example file
copy .env.example .env
```

Edit `.env` file with your MySQL credentials:

```env
# Django Settings
SECRET_KEY=django-insecure-your-secret-key-here-change-in-production
DEBUG=True

# MySQL Database Configuration
DB_NAME=dialysistrack_db
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
DB_HOST=localhost
DB_PORT=3306
```

**⚠️ IMPORTANT:** Replace `YOUR_MYSQL_ROOT_PASSWORD` with your actual MySQL root password!

### **3.3: Activate Virtual Environment**

```bash
# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### **3.4: Install Dependencies**

```bash
# Install all required packages
pip install -r requirements.txt

# If you get errors, try the simple requirements
pip install -r requirements-simple.txt

# Install pymysql (MySQL connector)
pip install pymysql
```

---

## 🔄 **Step 4: Run Migrations**

### **4.1: Create Migration Files**
```bash
python manage.py makemigrations
```

Expected output:
```
Migrations for 'users':
  users\migrations\0001_initial.py
    - Create model User
Migrations for 'patients':
  patients\migrations\0001_initial.py
    - Create model Patient
... (and more)
```

### **4.2: Apply Migrations**
```bash
python manage.py migrate
```

Expected output:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions, users, patients, ...
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying users.0001_initial... OK
  ... (and more)
```

✅ **Success Indicator:** You should see multiple "OK" messages with no errors.

### **4.3: Verify Database Tables**

Check if tables were created:
```bash
mysql -u root -p dialysistrack_db -e "SHOW TABLES;"
```

You should see tables like:
- auth_user
- users_user
- patients_patient
- dialysis_queue_queueentry
- machines_machine
- etc.

---

## 👑 **Step 5: Create Admin User**

### **Method 1: Using Django Management Command**

```bash
python manage.py createsuperuser
```

**Enter the following details:**
- **Username:** `admin@dialysistrack.com`
- **Email:** `admin@dialysistrack.com`
- **Password:** `admin@2026`
- **Password (again):** `admin@2026`

If prompted about weak password, type `y` to bypass validation.

### **Method 2: Using Pre-made Script (Recommended)**

```bash
python testing/create_admin_user.py
```

This will automatically create:
- Username: `admin@dialysistrack.com`
- Password: `admin@2026`
- Role: Admin with full permissions

---

## 📊 **Step 6: Populate Sample Data**

Now let's populate the database with test data for all features:

### **6.1: Create User Roles**
```bash
python testing/create_user_roles.py
```

This creates users for all roles:
- 👑 Admin: admin@dialysistrack.com
- 👨‍⚕️ Doctor: doctor@dialysistrack.com
- 👩‍⚕️ Nurse: nurse@dialysistrack.com
- 🔧 Technician: technician@dialysistrack.com
- 📋 Receptionist: receptionist@dialysistrack.com
- 👥 Patient: patient@dialysistrack.com

**All passwords:** Same format as username (e.g., `doctor@2026`, `nurse@2026`, etc.)

### **6.2: Create Sample Data**
```bash
python testing/create_sample_data.py
```

This populates:
- ✅ Patients (multiple patients with different statuses)
- ✅ Dialysis machines
- ✅ Queue entries
- ✅ Appointments
- ✅ Treatment records

### **6.3: Create Billing Data**
```bash
python testing/create_billing_data.py
```

This adds:
- ✅ Billing records
- ✅ Payment transactions
- ✅ Invoice history

### **6.4: Verify Data Created**

Check database has data:
```bash
mysql -u root -p dialysistrack_db -e "SELECT COUNT(*) FROM users_user; SELECT COUNT(*) FROM patients_patient; SELECT COUNT(*) FROM machines_machine;"
```

You should see counts greater than 0 for each table.

---

## 🧪 **Step 7: Testing**

### **7.1: Start Django Development Server**

```bash
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**✅ Backend is running!**

### **7.2: Test Admin Panel**

1. Open browser: http://localhost:8000/admin
2. Login with:
   - **Username:** admin@dialysistrack.com
   - **Password:** admin@2026
3. You should see the Django Admin interface with all your models

### **7.3: Test API Endpoints**

Keep the server running and open a new terminal:

```bash
# Activate virtual environment in new terminal
cd "c:\5th sem\100 working project\DialysisTrack\backend"
venv\Scripts\activate

# Test authentication
python testing/test_auth.py
```

Expected output:
```
✅ Authentication test passed
✅ Token received successfully
```

### **7.4: Test Role Permissions**

```bash
python testing/test_role_permissions.py
```

This will test:
- ✅ Admin can access all modules
- ✅ Doctor can access patient records
- ✅ Nurse can manage queue
- ✅ Technician can manage machines
- ✅ Receptionist can manage appointments
- ✅ Patient can view own records

### **7.5: Test Billing System**

```bash
python testing/test_billing_system.py
```

### **7.6: Check All Data**

```bash
python testing/check_all_data.py
```

This shows a summary of all data in your database.

---

## 🚀 **Quick Start After Setup**

Once everything is set up, use these commands daily:

### **Start Backend:**
```bash
cd "c:\5th sem\100 working project\DialysisTrack\backend"
venv\Scripts\activate
python manage.py runserver
```

### **Start Frontend (New Terminal):**
```bash
cd "c:\5th sem\100 working project\DialysisTrack\frontend"
npm run dev
```

### **Access Application:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:8000/admin

---

## 🐛 **Troubleshooting**

### **Problem 1: "Access denied for user 'root'@'localhost'"**

**Solution:**
1. Check your `.env` file has the correct MySQL password
2. Test MySQL connection:
   ```bash
   mysql -u root -p
   ```
   If this fails, reset MySQL root password.

**Reset MySQL Password:**
```sql
# Login to MySQL as root (if you can)
mysql -u root

# Change password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
EXIT;
```

Then update your `.env` file with the new password.

---

### **Problem 2: "django.db.utils.OperationalError: (2003, "Can't connect to MySQL server")"**

**Solution:**
1. Check if MySQL service is running:
   ```bash
   # Windows
   net start MySQL80
   ```

2. If service not found, check service name:
   ```bash
   services.msc
   ```
   Look for "MySQL" service and start it.

---

### **Problem 3: "No module named 'MySQLdb'"**

**Solution:**
```bash
pip install pymysql
```

Make sure your `backend/__init__.py` has:
```python
import pymysql
pymysql.install_as_MySQLdb()
```

---

### **Problem 4: "Database dialysistrack_db doesn't exist"**

**Solution:**
Create the database again:
```bash
mysql -u root -p -e "CREATE DATABASE dialysistrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

### **Problem 5: Migrations Error - "Table already exists"**

**Solution 1: Delete and recreate database**
```bash
# Backup first if you have important data!
mysql -u root -p -e "DROP DATABASE dialysistrack_db; CREATE DATABASE dialysistrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Then run migrations again
python manage.py migrate
```

**Solution 2: Fake migrations (if tables are correct)**
```bash
python manage.py migrate --fake
```

---

### **Problem 6: "Port 8000 already in use"**

**Solution:**
```bash
# Kill process on port 8000
npx kill-port 8000

# Or find and kill manually
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

---

### **Problem 7: No sample data after running scripts**

**Solution:**
```bash
# Run in order:
python testing/create_admin_user.py
python testing/create_user_roles.py
python testing/create_sample_data.py
python testing/create_billing_data.py

# Verify data
python testing/check_all_data.py
```

---

### **Complete Database Reset**

If you want to start completely fresh:

```bash
# 1. Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS dialysistrack_db; CREATE DATABASE dialysistrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Remove old migration files (optional)
# Delete all files in */migrations/ folders except __init__.py

# 3. Run migrations
python manage.py makemigrations
python manage.py migrate

# 4. Create users and data
python testing/create_admin_user.py
python testing/create_user_roles.py
python testing/create_sample_data.py
python testing/create_billing_data.py

# 5. Test
python testing/check_all_data.py
python manage.py runserver
```

---

## 📝 **Verification Checklist**

After completing all steps, verify:

- [ ] MySQL is installed and running
- [ ] Database `dialysistrack_db` exists
- [ ] `.env` file created with correct credentials
- [ ] Virtual environment activated
- [ ] All dependencies installed
- [ ] Migrations completed without errors
- [ ] Admin user created successfully
- [ ] Sample data populated
- [ ] Django server runs at http://localhost:8000
- [ ] Admin panel accessible at http://localhost:8000/admin
- [ ] Can login with admin@dialysistrack.com / admin@2026
- [ ] API endpoints respond correctly
- [ ] All test scripts pass

---

## 🎉 **Success!**

Your DialysisTrack database is now fully set up with:

✅ MySQL database configured
✅ All tables created via Django migrations
✅ Admin user with full access
✅ 6 role-based users (Admin, Doctor, Nurse, Technician, Receptionist, Patient)
✅ Sample patients, appointments, and queue data
✅ Billing and payment records
✅ Working API endpoints
✅ 2FA authentication system

**Next Steps:**
1. Start the backend server: `python manage.py runserver`
2. Start the frontend: `cd ../frontend && npm run dev`
3. Access the app at http://localhost:5173
4. Login with any user credentials from the table above

---

## 📚 **Additional Resources**

- **Django Documentation:** https://docs.djangoproject.com/
- **MySQL Documentation:** https://dev.mysql.com/doc/
- **Project README:** See `README.md` in project root
- **Quick Start Guide:** See `QUICK_START.md`
- **First Time Setup:** See `firsttimerun.md`

---

## 💡 **Tips**

1. **Always activate virtual environment** before running Django commands
2. **Keep MySQL service running** while developing
3. **Backup database regularly** if you have important data:
   ```bash
   mysqldump -u root -p dialysistrack_db > backup.sql
   ```
4. **Restore from backup:**
   ```bash
   mysql -u root -p dialysistrack_db < backup.sql
   ```
5. **Use Django admin panel** to quickly view and edit data during development

---

**Need Help?** Refer to the troubleshooting section or check existing documentation files in the project.

**Happy Coding! 🚀**
