# 🏥 DialysisTrack - Complete Features Working Guide

**Complete guide to all features, pages, and functionality for every user role**

---

## 📑 Table of Contents

1. [System Overview](#system-overview)
2. [User Roles & Access](#user-roles--access)
3. [Admin Features](#admin-features)
4. [Staff Features (Doctors, Nurses, Technicians, Receptionist)](#staff-features)
5. [Patient Features](#patient-features)
6. [Django Admin Panel](#django-admin-panel)
7. [Common Features](#common-features)

---

## 🎯 System Overview

**DialysisTrack** is a complete hospital management system for dialysis centers with:
- 👥 **Patient Management** - Track patient records, medical history
- 📅 **Appointment Scheduling** - Book and manage dialysis sessions
- 🔄 **Queue Management** - Real-time queue tracking
- ⚙️ **Machine Management** - Monitor dialysis machines
- 👨‍⚕️ **Staff Management** - Manage doctors, nurses, technicians
- 💰 **Billing System** - Generate and track bills
- 📊 **Reports & Analytics** - Comprehensive reporting
- 🔐 **Two-Factor Authentication** - Enhanced security for staff

---

## 👥 User Roles & Access

### **6 User Roles:**

| Role | Access Level | 2FA Required | Main Functions |
|------|--------------|--------------|----------------|
| **Admin** | Full System | ✅ Mandatory | Everything + Django Admin |
| **Doctor** | High | ✅ Mandatory | Patients, Queue, Reports |
| **Nurse** | Medium | ✅ Mandatory | Queue, Patients, Sessions |
| **Technician** | Medium | ✅ Mandatory | Machines, Queue |
| **Receptionist** | Medium | ✅ Mandatory | Registration, Billing, Appointments |
| **Patient** | Limited | ❌ Optional | Own appointments, records, billing |

---

## 🔐 Admin Features

### **Admin Role: Full System Access**

**Login Credentials:**
```
Email: admin@dialysis.com
Password: Admin@2026
```

### **1. Dashboard** 📊

**How to Access:**
1. Login as admin
2. Automatically redirected to dashboard
3. Or click "Dashboard" in sidebar

**What You See:**
- **Statistics Cards:**
  - 👥 Total Patients
  - 🔄 In Queue
  - ⚙️ Active Sessions
  - 🏥 Available Machines
- **Recent Activities** - Last 4 queue actions
- **Quick Actions** - Links to main features

**How It Works:**
- Numbers update in real-time from database
- Click "Refresh" button to reload data
- Recent activities show latest queue changes
- Quick action cards link to main pages

**Example:**
```
Dashboard shows:
- Total Patients: 9
- In Queue: 3
- Active Sessions: 2
- Available Machines: 4

Recent Activities:
- James Miller - Session started - 5 min ago
- Patricia Martinez - Added to queue - 10 min ago
```

---

### **2. Patient Management** 👥

**How to Access:**
1. Click "Patients" in sidebar
2. Or use Quick Action on dashboard

**Features:**

#### **A. View All Patients**
**Steps:**
1. Go to Patients page
2. See list of all patients with:
   - Patient ID (e.g., P001)
   - Name
   - Blood Group
   - Status (Active/Inactive)
   - Last Visit
   - Actions (View, Edit, Delete)

#### **B. Add New Patient**
**Steps:**
1. Click "Add Patient" button (top right)
2. Fill in the form:
   ```
   Personal Information:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@email.com
   - Phone: +1-555-0123
   - Date of Birth: 1980-01-15
   - Gender: Male
   
   Medical Information:
   - Blood Group: A+
   - Medical History: Chronic kidney disease
   - Allergies: None
   - Emergency Contact: Jane Doe (+1-555-0124)
   
   Address:
   - Street: 123 Main St
   - City: New York
   - State: NY
   - Zip: 10001
   ```
3. Click "Save"
4. Patient gets auto-assigned ID (e.g., P010)

#### **C. Edit Patient**
**Steps:**
1. Find patient in list
2. Click "Edit" button
3. Modify any field
4. Click "Save"

#### **D. Delete Patient**
**Steps:**
1. Find patient in list
2. Click "Delete" button
3. Confirm deletion
4. Patient removed from system

#### **E. Search Patients**
**Steps:**
1. Use search box at top
2. Type patient name or ID
3. Results filter automatically

**Example Workflow:**
```
1. New patient walks in
2. Receptionist clicks "Add Patient"
3. Fills form with patient details
4. Saves → Patient ID P010 created
5. Patient can now book appointments
```

---

### **3. Queue Management** 🔄

**How to Access:**
1. Click "Queue" in sidebar

**Features:**

#### **A. View Current Queue**
**What You See:**
- **Queue Cards** showing:
  - Patient name
  - Patient ID
  - Priority (Normal/Urgent/Emergency)
  - Status (Waiting/In Progress/Completed)
  - Wait time
  - Assigned machine
  - Actions

#### **B. Add Patient to Queue**
**Steps:**
1. Click "Add to Queue" button
2. Fill form:
   ```
   Patient: Select from dropdown (e.g., James Miller)
   Priority: Normal / Urgent / Emergency
   Notes: Regular dialysis session
   ```
3. Click "Add"
4. Patient appears in queue

#### **C. Start Session**
**Steps:**
1. Find patient in queue (Status: Waiting)
2. Click "Start Session" button
3. Assign machine from dropdown
4. Session starts → Status changes to "In Progress"
5. Timer starts counting

#### **D. Complete Session**
**Steps:**
1. Find patient with "In Progress" status
2. Click "Complete" button
3. Status changes to "Completed"
4. Machine becomes available
5. Patient removed from active queue

#### **E. Priority Levels**
- **🟢 Normal** - Regular scheduled sessions
- **🟡 Urgent** - Needs attention soon
- **🔴 Emergency** - Immediate attention required

**Example Workflow:**
```
1. Patient arrives for dialysis
2. Nurse adds to queue (Priority: Normal)
3. Queue shows: "Waiting - 0 min"
4. Machine M-001 becomes available
5. Nurse clicks "Start Session"
6. Assigns Machine M-001
7. Status: "In Progress" - Timer: 15 min
8. After 3 hours, nurse clicks "Complete"
9. Patient removed, Machine M-001 available
```

---

### **4. Machine Management** ⚙️

**How to Access:**
1. Click "Machines" in sidebar

**Features:**

#### **A. View All Machines**
**What You See:**
- **Machine Cards** with:
  - Machine Number (M-001, M-002, etc.)
  - Status (Available/In Use/Maintenance)
  - Model
  - Last Maintenance Date
  - Current Patient (if in use)
  - Actions

#### **B. Add New Machine**
**Steps:**
1. Click "Add Machine" button
2. Fill form:
   ```
   Machine Number: M-007
   Model: Fresenius 5008
   Status: Available
   Last Maintenance: 2026-01-20
   Notes: New machine installed
   ```
3. Click "Save"

#### **C. Update Machine Status**
**Steps:**
1. Find machine
2. Click "Edit" button
3. Change status:
   - **Available** - Ready for use
   - **In Use** - Currently being used
   - **Maintenance** - Under repair
4. Click "Save"

#### **D. Schedule Maintenance**
**Steps:**
1. Click on machine
2. Set "Last Maintenance" date
3. Add maintenance notes
4. Change status to "Maintenance"
5. Save

**Example Workflow:**
```
1. Machine M-003 needs maintenance
2. Technician clicks "Edit" on M-003
3. Changes status to "Maintenance"
4. Adds note: "Replacing filter"
5. Saves → Machine unavailable for queue
6. After repair, changes to "Available"
```

---

### **5. Staff Management** 👨‍⚕️

**How to Access:**
1. Click "Staff" in sidebar

**Features:**

#### **A. View All Staff**
**What You See:**
- List of all staff members:
  - Name
  - Email
  - Role (Doctor/Nurse/Technician/Receptionist)
  - Department
  - Status (Active/Inactive)
  - 2FA Status (Enabled/Not Enabled)

#### **B. Add New Staff**
**Steps:**
1. Click "Add Staff" button
2. Fill form:
   ```
   Personal Info:
   - First Name: Dr. Sarah
   - Last Name: Johnson
   - Email: dr.johnson@dialysis.com
   - Phone: +1-555-0125
   
   Professional Info:
   - Role: Doctor
   - Department: Nephrology
   - Hire Date: 2026-01-15
   - Username: dr.johnson
   - Password: staff123
   ```
3. Click "Save"
4. Staff member created
5. **Important:** They MUST set up 2FA on first login!

#### **C. Edit Staff**
**Steps:**
1. Find staff member
2. Click "Edit"
3. Modify details
4. Click "Save"

#### **D. Deactivate Staff**
**Steps:**
1. Find staff member
2. Click "Edit"
3. Uncheck "Is Active"
4. Save → Staff cannot login

**Example Workflow:**
```
1. New nurse hired: Emily Wilson
2. Admin creates account:
   - Email: nurse.wilson@dialysis.com
   - Password: staff123
   - Role: Nurse
3. Emily logs in first time
4. Redirected to 2FA setup (MANDATORY)
5. Scans QR code with Google Authenticator
6. Enters 6-digit code
7. 2FA enabled → Can access system
```

---

### **6. Appointments** 📅

**How to Access:**
1. Click "Appointments" in sidebar (if available)
2. Or use Django Admin Panel

**Features:**

#### **A. View All Appointments**
**What You See:**
- Calendar/List view of appointments
- Patient name
- Date & Time
- Shift (Morning/Evening/Night)
- Status
- Machine assigned

#### **B. Create Appointment**
**Steps:**
1. Click "Add Appointment"
2. Fill form:
   ```
   Patient: James Miller
   Date: 2026-01-30
   Shift: Morning
   Time: 08:00:00
   Status: Scheduled
   Machine: M-001 (optional)
   Notes: Regular session
   ```
3. Click "Save"
4. Appointment created

#### **C. Update Appointment**
**Steps:**
1. Find appointment
2. Click "Edit"
3. Change status:
   - Scheduled → Checked In
   - Checked In → In Progress
   - In Progress → Completed
4. Add actual start/end times
5. Save

**Example Workflow:**
```
1. Patient calls to book appointment
2. Receptionist creates appointment:
   - Date: Jan 30, 2026
   - Time: 8:00 AM
   - Shift: Morning
   - Status: Scheduled
3. On appointment day:
   - Patient arrives → Status: Checked In
   - Session starts → Status: In Progress
   - Session ends → Status: Completed
```

---

### **7. Billing** 💰

**How to Access:**
1. Click "Billing" in sidebar

**Features:**

#### **A. View All Bills**
**What You See:**
- List of bills with:
  - Bill ID
  - Patient name
  - Amount
  - Status (Pending/Paid/Overdue)
  - Date
  - Actions

#### **B. Create New Bill**
**Steps:**
1. Click "Create Bill" button
2. Fill form:
   ```
   Patient: James Miller
   Services:
   - Dialysis Session: $500
   - Medication: $50
   - Consultation: $100
   
   Total: $650
   Status: Pending
   Due Date: 2026-02-15
   ```
3. Click "Save"
4. Bill generated

#### **C. Mark as Paid**
**Steps:**
1. Find bill
2. Click "Mark as Paid" button
3. Enter payment details
4. Status changes to "Paid"

#### **D. Generate Invoice**
**Steps:**
1. Find bill
2. Click "Generate Invoice" button
3. PDF downloads
4. Can be printed/emailed

**Example Workflow:**
```
1. Patient completes dialysis session
2. Receptionist creates bill:
   - Dialysis: $500
   - Total: $500
   - Status: Pending
3. Patient pays at counter
4. Receptionist marks as "Paid"
5. Generates invoice for patient
```

---

### **8. Reports** 📊

**How to Access:**
1. Click "Reports" in sidebar

**Features:**

#### **A. Dashboard Statistics**
- Total patients
- Sessions this month
- Revenue
- Machine utilization

#### **B. Patient Reports**
**Steps:**
1. Select "Patient Report"
2. Choose date range
3. Select patient (optional)
4. Click "Generate"
5. View/Download report

**Report Includes:**
- Patient demographics
- Session history
- Billing summary
- Medical notes

#### **C. Financial Reports**
**Steps:**
1. Select "Financial Report"
2. Choose date range
3. Click "Generate"
4. View revenue, expenses, pending bills

#### **D. Machine Usage Reports**
**Steps:**
1. Select "Machine Report"
2. Choose date range
3. View machine utilization
4. Maintenance history

**Example:**
```
Generate Monthly Report:
1. Click "Reports"
2. Select "Monthly Summary"
3. Choose: January 2026
4. Report shows:
   - Total Sessions: 120
   - Revenue: $60,000
   - Patients Served: 45
   - Machine Uptime: 95%
```

---

### **9. Sessions** 🕐

**How to Access:**
1. Click "Sessions" in sidebar

**Features:**

#### **A. View Active Sessions**
**What You See:**
- Currently running dialysis sessions
- Patient name
- Machine number
- Start time
- Duration
- Status

#### **B. Session History**
**Steps:**
1. Click "History" tab
2. See past sessions
3. Filter by:
   - Date range
   - Patient
   - Machine
   - Status

#### **C. Session Details**
**Click on session to see:**
- Patient information
- Machine used
- Start/End times
- Duration
- Notes
- Complications (if any)

**Example:**
```
Active Sessions View:
┌─────────────────────────────────┐
│ James Miller - M-001            │
│ Started: 8:05 AM                │
│ Duration: 2h 15m                │
│ Status: In Progress             │
└─────────────────────────────────┘
```

---

## 👨‍⚕️ Staff Features

### **Staff Roles: Doctor, Nurse, Technician, Receptionist**

**All staff MUST complete 2FA setup on first login!**

### **Common Staff Login Flow:**

**Step 1: First Login**
```
1. Go to http://localhost:5173/login
2. Enter credentials (e.g., nurse.wilson@dialysis.com / staff123)
3. Redirected to 2FA Setup page (MANDATORY)
4. Cannot skip - must complete setup
```

**Step 2: 2FA Setup**
```
1. Click "Start Setup"
2. QR code appears
3. Open Google Authenticator app on phone
4. Scan QR code
5. App shows 6-digit code
6. Enter code in website
7. Click "Verify & Enable 2FA"
8. 2FA enabled! ✅
9. Redirected to dashboard
```

**Step 3: Subsequent Logins**
```
1. Enter email & password
2. Enter 6-digit code from authenticator app
3. Click "Verify & Login"
4. Access granted
```

**Grace Period:**
- First 3 logins OR 24 hours: No 2FA code required
- After grace period: 2FA code required every login

---

### **Doctor Features** 👨‍⚕️

**Login:**
```
Email: dr.smith@dialysis.com
Password: staff123
```

**Access:**
- ✅ Dashboard
- ✅ Patients (View, Add, Edit)
- ✅ Queue (View, Manage)
- ✅ Reports (Generate, View)
- ✅ Sessions (View history)
- ❌ Machines (View only)
- ❌ Staff (No access)
- ❌ Billing (Limited)

**Typical Workflow:**
```
1. Login with 2FA
2. View dashboard statistics
3. Check queue for waiting patients
4. Review patient medical records
5. Start dialysis session
6. Monitor active sessions
7. Complete session
8. Add medical notes
9. Generate patient report
```

---

### **Nurse Features** 👩‍⚕️

**Login:**
```
Email: nurse.wilson@dialysis.com
Password: staff123
```

**Access:**
- ✅ Dashboard
- ✅ Queue (Full access)
- ✅ Patients (View, Update)
- ✅ Sessions (Start, Monitor, Complete)
- ✅ Machines (View status)
- ❌ Staff (No access)
- ❌ Billing (No access)
- ❌ Reports (Limited)

**Typical Workflow:**
```
1. Login with 2FA
2. Check queue
3. Add patient to queue
4. Assign machine
5. Start session
6. Monitor vitals
7. Update patient status
8. Complete session
9. Clean machine
```

---

### **Technician Features** 🔧

**Login:**
```
Email: tech.davis@dialysis.com
Password: staff123
```

**Access:**
- ✅ Dashboard
- ✅ Machines (Full access)
- ✅ Queue (View only)
- ✅ Maintenance logs
- ❌ Patients (Limited)
- ❌ Staff (No access)
- ❌ Billing (No access)

**Typical Workflow:**
```
1. Login with 2FA
2. Check machine status
3. Perform maintenance
4. Update machine status
5. Log maintenance activities
6. Report issues
7. Update machine availability
```

---

### **Receptionist Features** 📋

**Login:**
```
Email: reception@dialysis.com
Password: staff123
```

**Access:**
- ✅ Dashboard
- ✅ Patients (Full access)
- ✅ Appointments (Full access)
- ✅ Billing (Full access)
- ✅ Registration
- ❌ Queue (Limited)
- ❌ Machines (View only)
- ❌ Staff (No access)

**Typical Workflow:**
```
1. Login with 2FA
2. Register new patient
3. Schedule appointments
4. Check in patients
5. Create bills
6. Process payments
7. Generate invoices
8. Answer phone calls
```

---

## 🏥 Patient Features

### **Patient Role: Limited Access**

**Login:**
```
Email: akshata@gmail.com
Password: staff123
(or any patient from PASSWORDS.md)
```

**Access:**
- ✅ My Appointments
- ✅ Patient Portal/Dashboard
- ✅ Medical Records (Own only)
- ✅ Billing (Own only)
- ❌ Queue (No access)
- ❌ Staff (No access)
- ❌ Other patients

**2FA:** Optional (not mandatory for patients)

---

### **1. My Appointments** 📅

**How to Access:**
1. Login as patient
2. Click "My Appointments" in sidebar
3. Or navigate to `/appointments`

**Features:**

#### **A. View Appointments**
**What You See:**
```
┌─────────────────────────────────────┐
│ My Appointments         🔄 Refresh  │
│ View and manage your dialysis...    │
├─────────────────────────────────────┤
│ 📊 Total: 5  📅 Upcoming: 3  ✅ 2  │
├─────────────────────────────────────┤
│ [All] [Upcoming (3)] [Past]         │
├─────────────────────────────────────┤
│ 🌅 Mon, Jan 27, 2026                │
│ Morning Shift                        │
│ ⏰ 8:00 AM  🏥 M-001                │
│ Status: [SCHEDULED] 🔵              │
│ Notes: Regular session               │
├─────────────────────────────────────┤
│ 🌆 Wed, Jan 29, 2026                │
│ Evening Shift                        │
│ ⏰ 2:00 PM  🏥 M-002                │
│ Status: [SCHEDULED] 🔵              │
└─────────────────────────────────────┘
```

#### **B. Filter Appointments**
**Steps:**
1. Click "Upcoming" tab
   - Shows only future appointments
   - Status: Scheduled/Checked In
2. Click "Past" tab
   - Shows completed/cancelled
   - Past dates
3. Click "All Appointments"
   - Shows everything

#### **C. View Appointment Details**
**Each card shows:**
- 📅 Date (e.g., Mon, Jan 27, 2026)
- 🌅 Shift icon (Morning/Evening/Night)
- ⏰ Scheduled time (8:00 AM)
- 🏥 Machine number (M-001)
- 🏷️ Status badge (color-coded)
- 📝 Notes (if any)
- ▶️ Actual start time (if started)
- ⏹️ Actual end time (if completed)

#### **D. Refresh Data**
**Steps:**
1. Click "Refresh" button (🔄)
2. Data reloads from server
3. Numbers update

**Status Colors:**
- 🔵 **Blue** - Scheduled
- 🟡 **Yellow** - In Progress
- 🟢 **Green** - Completed
- 🔴 **Red** - Cancelled

**Example Patient Workflow:**
```
1. Patient logs in: akshata@gmail.com
2. Sees dashboard with 5 appointments
3. Clicks "Upcoming" tab
4. Sees 3 future appointments:
   - Jan 27 - Morning - M-001
   - Jan 29 - Evening - M-002
   - Jan 31 - Morning - M-003
5. Clicks "Past" tab
6. Sees 2 completed sessions
7. Can view all details
```

---

### **2. Patient Dashboard** 🏠

**How to Access:**
1. Login as patient
2. Automatically on dashboard
3. Or click "Dashboard" in sidebar

**What You See:**
- Welcome message
- Upcoming appointment (next one)
- Recent medical records
- Billing summary
- Quick links

**Example:**
```
Welcome, Akshata!

Next Appointment:
📅 Monday, Jan 27, 2026
⏰ 8:00 AM - Morning Shift
🏥 Machine: M-001

Recent Activity:
✅ Session completed - Jan 24
💰 Bill paid - $500
```

---

### **3. Medical Records** 📋

**How to Access:**
1. Click "Medical Records" (if available)
2. Or through Patient Portal

**What You See:**
- Personal information
- Blood group
- Medical history
- Allergies
- Emergency contact
- Session history
- Test results

**Privacy:** Can only see OWN records

---

### **4. Billing** 💳

**How to Access:**
1. Click "Billing" in sidebar

**What You See:**
- List of bills
- Amount due
- Payment status
- Due dates
- Payment history

**Features:**
- View bills
- Download invoices
- See payment history
- Check pending amounts

**Example:**
```
My Bills:
┌─────────────────────────────────┐
│ Bill #001 - Jan 24, 2026        │
│ Dialysis Session: $500          │
│ Status: PAID ✅                 │
│ Paid on: Jan 24, 2026           │
├─────────────────────────────────┤
│ Bill #002 - Jan 27, 2026        │
│ Dialysis Session: $500          │
│ Status: PENDING 🟡              │
│ Due: Feb 10, 2026               │
└─────────────────────────────────┘
```

---

## 🔧 Django Admin Panel

### **The Power Tool for Admins**

**Access:**
```
URL: http://localhost:8000/admin
Email: admin@dialysis.com
Password: Admin@2026
```

**What is Django Admin?**
- Backend administration interface
- Direct database access
- Full CRUD operations
- User management
- Data import/export

---

### **1. Users Management** 👥

**How to Access:**
1. Login to Django Admin
2. Click "Users" under "AUTHENTICATION AND AUTHORIZATION"

**Features:**

#### **A. View All Users**
**What You See:**
- List of all users
- Username
- Email
- Role
- Active status
- Staff status
- Superuser status

#### **B. Add New User**
**Steps:**
1. Click "Add User" (top right)
2. **Step 1: Create Account**
   ```
   Username: john.doe
   Password: staff123
   Password confirmation: staff123
   ```
3. Click "Save and continue editing"
4. **Step 2: Add Details**
   ```
   Personal info:
   - First name: John
   - Last name: Doe
   - Email: john.doe@dialysis.com
   
   Permissions:
   - Active: ✓
   - Staff status: ✓ (if staff member)
   - Superuser: ✓ (if admin)
   
   Important dates:
   - Date joined: (auto-filled)
   
   Additional info:
   - Role: Select from dropdown
   - Department: Nephrology
   - Phone: +1-555-0126
   ```
5. Click "Save"

**IMPORTANT:** Password is automatically hashed!

#### **C. Edit User**
**Steps:**
1. Find user in list
2. Click on username
3. Modify any field
4. Click "Save"

#### **D. Change Password**
**Steps:**
1. Open user
2. Click "this form" link next to password field
3. Enter new password twice
4. Click "Change password"

#### **E. Deactivate User**
**Steps:**
1. Open user
2. Uncheck "Active" checkbox
3. Save → User cannot login

**Example:**
```
Creating new nurse:
1. Click "Add User"
2. Username: nurse.emily
3. Password: staff123
4. Save
5. Add details:
   - Email: nurse.emily@dialysis.com
   - Role: Nurse
   - Active: ✓
   - Staff: ✓
6. Save
7. Nurse can now login!
```

---

### **2. Patients Management** 🏥

**How to Access:**
1. Django Admin → "Patients"

**Features:**

#### **A. Add Patient**
**Steps:**
1. Click "Add Patient"
2. Fill ALL fields:
   ```
   User: Select existing user OR create new
   Patient ID: P010 (auto-generated if blank)
   First Name: John
   Last Name: Doe
   Email: john.doe@email.com
   Phone: +1-555-0127
   Date of Birth: 1980-01-15
   Gender: Male
   Blood Group: A+
   Address: 123 Main St, NY
   Medical History: CKD Stage 5
   Allergies: None
   Emergency Contact: Jane Doe
   Emergency Phone: +1-555-0128
   ```
3. Click "Save"

#### **B. Bulk Actions**
**Steps:**
1. Select multiple patients (checkboxes)
2. Choose action from dropdown:
   - Delete selected patients
   - Export as CSV
3. Click "Go"

---

### **3. Appointments Management** 📅

**How to Access:**
1. Django Admin → "Appointments"

**This is the EASIEST way to manage appointments!**

#### **A. View All Appointments**
**What You See:**
- List with columns:
  - Patient name
  - Date
  - Shift
  - Time
  - Status
  - Machine

#### **B. Add Appointment** ⭐

**Step-by-Step:**
```
1. Click "Add Appointment" (top right)

2. Fill the form:
   ┌─────────────────────────────────────┐
   │ Patient: [Dropdown]                 │
   │ Select: James Miller                │
   ├─────────────────────────────────────┤
   │ Appointment date: [Calendar]        │
   │ Pick: 2026-01-28                    │
   ├─────────────────────────────────────┤
   │ Shift: [Dropdown]                   │
   │ Choose: Morning                     │
   ├─────────────────────────────────────┤
   │ Scheduled time: [Time picker]       │
   │ Set: 08:00:00                       │
   ├─────────────────────────────────────┤
   │ Status: [Dropdown]                  │
   │ Select: Scheduled                   │
   ├─────────────────────────────────────┤
   │ Machine number: [Text]              │
   │ Optional: M-001                     │
   ├─────────────────────────────────────┤
   │ Notes: [Textarea]                   │
   │ Optional: Regular session           │
   └─────────────────────────────────────┘

3. Click "Save" button

4. Appointment created! ✅

5. Patient can now see it in "My Appointments"
```

**Field Explanations:**
- **Patient**: Who is the appointment for
- **Date**: When (use calendar picker)
- **Shift**: Morning (6AM-12PM), Evening (12PM-6PM), Night (6PM-12AM)
- **Time**: Exact time (HH:MM:SS format)
- **Status**: Current state
  - Scheduled - Booked
  - Checked In - Patient arrived
  - In Progress - Session ongoing
  - Completed - Finished
  - Cancelled - Cancelled
  - No Show - Patient didn't come
- **Machine**: Which machine (optional initially)
- **Notes**: Any additional information

#### **C. Edit Appointment**
**Steps:**
1. Click on appointment in list
2. Modify any field
3. Common changes:
   - Status: Scheduled → Checked In → In Progress → Completed
   - Add machine number
   - Add actual start/end times
   - Update notes
4. Click "Save"

#### **D. Filter Appointments**
**Use right sidebar:**
- By Status
- By Shift
- By Date
- By Patient

#### **E. Search Appointments**
**Use search box:**
- Search by patient name
- Search by patient ID
- Search by date

**Example Workflow:**
```
Scenario: Patient calls to book appointment

1. Receptionist opens Django Admin
2. Goes to Appointments
3. Clicks "Add Appointment"
4. Fills form:
   - Patient: Patricia Martinez
   - Date: Jan 30, 2026
   - Shift: Evening
   - Time: 14:00:00
   - Status: Scheduled
5. Saves
6. Tells patient: "Booked for Jan 30, 2PM"
7. Patient logs in later
8. Sees appointment in "My Appointments"
9. Numbers update automatically:
   - Total: 6 (was 5)
   - Upcoming: 4 (was 3)
```

---

### **4. Queue Management** 🔄

**How to Access:**
1. Django Admin → "Dialysis queue"

**Features:**

#### **A. Add to Queue**
**Steps:**
1. Click "Add Dialysis queue entry"
2. Fill form:
   ```
   Patient: Select patient
   Priority: Normal/Urgent/Emergency
   Status: Waiting
   Notes: Regular session
   ```
3. Save

#### **B. Update Queue Status**
**Steps:**
1. Find queue entry
2. Click to edit
3. Change status:
   - Waiting → In Progress
   - In Progress → Completed
4. Add machine number
5. Save

---

### **5. Machines Management** ⚙️

**How to Access:**
1. Django Admin → "Machines"

**Features:**

#### **A. Add Machine**
**Steps:**
1. Click "Add Machine"
2. Fill form:
   ```
   Machine Number: M-007
   Model: Fresenius 5008
   Status: Available
   Last Maintenance: 2026-01-20
   Location: Room 3
   ```
3. Save

#### **B. Update Status**
**Steps:**
1. Find machine
2. Edit
3. Change status:
   - Available
   - In Use
   - Maintenance
4. Save

---

### **6. Billing Management** 💰

**How to Access:**
1. Django Admin → "Billing"

**Features:**

#### **A. Create Bill**
**Steps:**
1. Click "Add Billing"
2. Fill form:
   ```
   Patient: Select patient
   Amount: 500.00
   Status: Pending
   Due Date: 2026-02-15
   Description: Dialysis session
   ```
3. Save

#### **B. Mark as Paid**
**Steps:**
1. Find bill
2. Edit
3. Change status to "Paid"
4. Add payment date
5. Save

---

### **7. Two-Factor Authentication** 🔐

**How to Access:**
1. Django Admin → "TOTP devices"

**Features:**

#### **A. View 2FA Status**
**See all users with 2FA:**
- User name
- Device name
- Confirmed (Yes/No)
- Created date

#### **B. Disable 2FA for User**
**Steps:**
1. Find user's TOTP device
2. Delete it
3. User must set up 2FA again on next login

**Example:**
```
If nurse forgot phone:
1. Admin goes to TOTP devices
2. Finds "nurse.wilson@dialysis.com"
3. Deletes device
4. Nurse logs in
5. Must set up 2FA again with new phone
```

---

## 🔄 Common Features

### **1. Two-Factor Authentication (2FA)** 🔐

**For ALL Staff Members (Mandatory)**

#### **Setup Process:**

**Step 1: First Login**
```
1. Go to login page
2. Enter email & password
3. Click "Sign In"
4. Redirected to 2FA Setup (cannot skip!)
```

**Step 2: Setup 2FA**
```
1. Page shows: "Secure Your Account"
2. Click "Start Setup" button
3. QR code appears
4. Open authenticator app:
   - Google Authenticator
   - Microsoft Authenticator
   - Authy
5. Scan QR code with app
6. App generates 6-digit code
7. Enter code in website
8. Click "Verify & Enable 2FA"
9. Success! Backup codes shown
10. Save backup codes safely
11. Click "Go to Dashboard"
```

**Step 3: Daily Login**
```
1. Enter email & password
2. Enter 6-digit code from app
3. Click "Verify & Login"
4. Access granted!
```

**Grace Period:**
- First 3 logins: No 2FA code needed
- OR first 24 hours: No 2FA code needed
- After that: 2FA required every login

**If Already Enabled:**
```
1. Navigate to /2fa-setup
2. See: "2FA is Already Enabled"
3. Message: "Your account is protected"
4. Auto-redirect to dashboard in 3 seconds
5. Or click "Go to Dashboard" immediately
```

**Backup Codes:**
- Save 10 backup codes
- Use if phone lost
- Each code works once
- Generate new codes in settings

---

### **2. Dashboard** 📊

**Available for: All Roles**

**Features:**
- Real-time statistics
- Recent activities
- Quick actions
- Role-specific widgets

**Updates:**
- Click refresh button
- Auto-updates on page load
- Real-time data from database

---

### **3. Search & Filter** 🔍

**Available on:**
- Patients page
- Appointments page
- Queue page
- Billing page
- Django Admin

**How to Use:**
```
1. Find search box at top
2. Type search term
3. Results filter automatically
4. Use filters on right sidebar
5. Combine search + filters
```

---

### **4. Responsive Design** 📱

**Works on:**
- 💻 Desktop (1920x1080)
- 💻 Laptop (1366x768)
- 📱 Tablet (768x1024)
- 📱 Mobile (375x667)

**Features:**
- Auto-adjusts layout
- Touch-friendly buttons
- Readable text sizes
- Optimized navigation

---

### **5. Error Handling** ⚠️

**Common Errors:**

**401 Unauthorized:**
```
Cause: Token expired
Solution: Auto-refresh token OR logout/login
```

**403 Forbidden:**
```
Cause: No permission
Solution: Check user role and permissions
```

**404 Not Found:**
```
Cause: Page doesn't exist
Solution: Check URL, navigate from menu
```

**500 Server Error:**
```
Cause: Backend issue
Solution: Check backend logs, restart server
```

---

## 📚 Quick Reference

### **All Login Credentials**

```
ADMIN:
Email: admin@dialysis.com
Password: Admin@2026
Access: Everything

DOCTOR:
Email: dr.smith@dialysis.com
Password: staff123
Access: Patients, Queue, Reports

NURSE:
Email: nurse.wilson@dialysis.com
Password: staff123
Access: Queue, Patients, Sessions

TECHNICIAN:
Email: tech.davis@dialysis.com
Password: staff123
Access: Machines, Maintenance

RECEPTIONIST:
Email: reception@dialysis.com
Password: staff123
Access: Registration, Billing, Appointments

PATIENT:
Email: akshata@gmail.com
Password: staff123
Access: Own appointments, records, billing
```

### **All URLs**

```
Frontend: http://localhost:5173
Backend API: http://localhost:8000
Django Admin: http://localhost:8000/admin

Pages:
/login - Login page
/dashboard - Main dashboard
/patients - Patient management
/queue - Queue management
/machines - Machine management
/staff - Staff management
/appointments - Appointments
/billing - Billing
/reports - Reports
/sessions - Session history
/2fa-setup - 2FA setup page
```

### **Common Tasks**

```
Add Patient:
1. Login as admin/receptionist
2. Patients → Add Patient
3. Fill form → Save

Create Appointment:
1. Django Admin → Appointments
2. Add Appointment
3. Fill form → Save

Add to Queue:
1. Queue page
2. Add to Queue button
3. Select patient → Add

Start Session:
1. Find patient in queue
2. Click "Start Session"
3. Assign machine → Start

Complete Session:
1. Find active session
2. Click "Complete"
3. Confirm

Create Bill:
1. Billing page
2. Create Bill button
3. Fill details → Save

Generate Report:
1. Reports page
2. Select report type
3. Choose date range
4. Generate
```

---

## 🎯 Summary

**DialysisTrack** provides complete hospital management with:

✅ **6 User Roles** - Each with specific permissions
✅ **2FA Security** - Mandatory for all staff
✅ **Patient Management** - Complete records system
✅ **Queue System** - Real-time tracking
✅ **Machine Management** - Status monitoring
✅ **Appointment Scheduling** - Easy booking
✅ **Billing System** - Invoice generation
✅ **Reports** - Comprehensive analytics
✅ **Django Admin** - Powerful backend tool
✅ **Responsive Design** - Works everywhere
✅ **🚑 Fleet / Ambulance Tracking** - Live GPS, dispatch, driver dashboard

### 🆕 Version 2.0 Features

✅ **📧 Notifications** - Bell icon in navbar, unread badges, mark-all-read, email alerts
✅ **🔑 Forgot Password / Reset** - Token-based password recovery from login page
✅ **📝 Patient Self-Registration** - Public `/register` page, creates patient accounts
✅ **📈 Real Chart Data** - Reports charts pull live weekly trends & machine utilization from DB
✅ **🛡️ Audit Log** - Admin page at `/audit-logs` tracks all user actions with search & filters
✅ **🔍 Search & Filter on All Pages** - Added to Queue, Machines, Staff, Sessions, Billing

### New Pages Added (v2.0)

| Page | URL | Access |
|------|-----|--------|
| **Forgot Password** | `/forgot-password` | Public |
| **Reset Password** | `/reset-password` | Public |
| **Patient Registration** | `/register` | Public |
| **Audit Logs** | `/audit-logs` | Admin / Staff with Reports access |

### New API Endpoints (v2.0)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications/` | GET | List user notifications |
| `/api/notifications/mark-all-read/` | POST | Mark all notifications as read |
| `/api/notifications/audit-logs/` | GET | View audit logs (admin only) |
| `/api/notifications/forgot-password/` | POST | Request password reset token |
| `/api/notifications/reset-password/` | POST | Reset password with token |
| `/api/reports/chart-data/` | GET | Weekly trends & machine utilization |
| `/api/auth/register/` | POST | Patient self-registration |

**Every feature is working and ready to use!** 🚀

---

**Last Updated:** March 21, 2026
**Version:** 2.0
**Status:** ✅ All Features Working

