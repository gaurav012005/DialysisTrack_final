# How to Add and Manage Appointments

## ✅ **Appointments Created Successfully!**

I just created **15 sample appointments** for you! The numbers should now update when you refresh the page.

---

## 📊 **Current Database Status**

- **Total Appointments**: 24
- **Scheduled**: 18 (upcoming)
- **Completed**: 6 (past)

These appointments are for patients:
- akshata mahadik (`akshata@gmail.com`)
- jm m
- gaurav mahadik

---

## 🔄 **How Numbers Update Automatically**

The appointment numbers update **automatically** when:

1. **You add a new appointment** (via Django Admin or script)
2. **You click the Refresh button** on the page
3. **You reload the page** (F5 or navigate away and back)

The page fetches data from: `/api/appointments/my_appointments/`

---

## 📝 **3 Ways to Add Appointments**

### **Method 1: Django Admin Panel** ⭐ (Recommended)

**Step-by-Step:**

1. Open Django Admin: http://localhost:8000/admin
2. Login:
   - Email: `admin@dialysis.com`
   - Password: `Admin@2026`
3. Click **"Appointments"** in sidebar
4. Click **"Add Appointment"** button (top right)
5. Fill in the form:
   ```
   Patient: [Select from dropdown]
   Appointment date: 2026-01-30
   Shift: morning / evening / night
   Scheduled time: 08:00:00
   Status: scheduled
   Machine number: M-001 (optional)
   Notes: Regular session (optional)
   ```
6. Click **"Save"**
7. Done! ✅

**To Edit an Appointment:**
1. Go to Appointments list
2. Click on the appointment you want to edit
3. Change any field
4. Click "Save"

**To Delete an Appointment:**
1. Go to Appointments list
2. Check the checkbox next to appointment(s)
3. Select "Delete selected appointments" from dropdown
4. Click "Go"
5. Confirm deletion

---

### **Method 2: Python Script** ⚡ (Quick for Multiple)

**I already created this script for you!**

**Run it:**
```bash
cd backend
python create_sample_appointments.py
```

**What it does:**
- Creates 5 appointments per patient
- 3 upcoming (scheduled)
- 2 past (completed)
- Includes machine numbers, notes, times
- Skips duplicates automatically

**Customize it:**
Edit `create_sample_appointments.py` to change:
- Number of appointments
- Dates
- Shifts (morning/evening/night)
- Status (scheduled/completed/cancelled)
- Machine numbers
- Notes

---

### **Method 3: Django Shell** 🔧 (For Developers)

**Open Django shell:**
```bash
cd backend
python manage.py shell
```

**Create an appointment:**
```python
from appointments.models import Appointment
from patients.models import Patient
from datetime import date, time

# Get a patient
patient = Patient.objects.first()

# Create appointment
appointment = Appointment.objects.create(
    patient=patient,
    appointment_date=date(2026, 1, 30),
    shift='morning',
    scheduled_time=time(8, 0),
    status='scheduled',
    machine_number='M-001',
    notes='Regular dialysis session'
)

print(f"Created appointment: {appointment}")
```

**Create multiple appointments:**
```python
from datetime import timedelta

# Create 5 appointments
for i in range(5):
    apt_date = date.today() + timedelta(days=i+1)
    Appointment.objects.create(
        patient=patient,
        appointment_date=apt_date,
        shift='morning',
        scheduled_time=time(8, 0),
        status='scheduled',
        machine_number=f'M-00{i+1}'
    )

print(f"Created 5 appointments!")
```

---

## 📋 **Appointment Fields Explained**

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **patient** | ✅ Yes | Which patient | James Miller |
| **appointment_date** | ✅ Yes | Date of appointment | 2026-01-30 |
| **shift** | ✅ Yes | Time of day | morning/evening/night |
| **scheduled_time** | ✅ Yes | Exact time | 08:00:00 |
| **status** | ✅ Yes | Current status | scheduled/completed/cancelled |
| **machine_number** | ❌ No | Assigned machine | M-001 |
| **notes** | ❌ No | Additional info | "Regular session" |
| **actual_start_time** | ❌ No | When session started | 08:05:00 |
| **actual_end_time** | ❌ No | When session ended | 11:30:00 |

---

## 🎨 **Status Types**

| Status | When to Use | Badge Color |
|--------|-------------|-------------|
| **scheduled** | Appointment booked | Blue 🔵 |
| **checked_in** | Patient arrived | Yellow 🟡 |
| **in_progress** | Session ongoing | Yellow 🟡 |
| **completed** | Session finished | Green 🟢 |
| **cancelled** | Appointment cancelled | Red 🔴 |
| **no_show** | Patient didn't show | Red 🔴 |

---

## ⏰ **Shift Types**

| Shift | Time Range | Icon |
|-------|------------|------|
| **morning** | 6AM - 12PM | 🌅 |
| **evening** | 12PM - 6PM | 🌆 |
| **night** | 6PM - 12AM | 🌙 |

---

## 🧪 **Testing the Appointments Page**

### **Test Scenario 1: View Appointments**
1. Login as patient: `akshata@gmail.com` / `staff123`
2. Navigate to "My Appointments"
3. You should see **5 appointments** (3 upcoming, 2 completed)
4. Statistics should show:
   - Total: 5
   - Upcoming: 3
   - Completed: 2

### **Test Scenario 2: Filter Appointments**
1. Click **"Upcoming"** tab
   - Should show 3 appointments
2. Click **"Past"** tab
   - Should show 2 appointments
3. Click **"All Appointments"** tab
   - Should show all 5

### **Test Scenario 3: Add New Appointment**
1. Go to Django Admin
2. Add a new appointment for akshata
3. Go back to "My Appointments" page
4. Click **Refresh** button
5. Numbers should update! ✅

### **Test Scenario 4: Empty State**
1. Login as a patient with no appointments
2. Should see:
   - Total: 0
   - Upcoming: 0
   - Completed: 0
   - "No Appointments Found" message

---

## 🔄 **How to Update Appointment Status**

### **Workflow Example:**

**1. Patient Schedules Appointment**
- Status: `scheduled`
- Machine: Not assigned yet

**2. Patient Arrives**
- Status: `checked_in`
- Machine: Assign machine (e.g., M-001)

**3. Session Starts**
- Status: `in_progress`
- Set `actual_start_time`

**4. Session Ends**
- Status: `completed`
- Set `actual_end_time`
- Add notes if needed

**Update via Django Admin:**
1. Go to Appointments
2. Click on the appointment
3. Change status
4. Add start/end times
5. Save

---

## 📞 **Contact Information**

The help section shows:
```
Contact: reception@dialysis.com
```

**To change this:**
1. Open: `frontend/src/pages/PatientAppointments.jsx`
2. Find line ~337:
   ```jsx
   <span className="font-medium">Contact: reception@dialysis.com</span>
   ```
3. Change to your email/phone:
   ```jsx
   <span className="font-medium">Contact: +1-555-0123</span>
   ```
4. Save file (auto-reloads)

---

## 🎯 **Quick Commands Reference**

### **View All Appointments**
```bash
cd backend
python manage.py shell
```
```python
from appointments.models import Appointment
for apt in Appointment.objects.all():
    print(f"{apt.patient} - {apt.appointment_date} - {apt.status}")
```

### **Count Appointments by Status**
```python
from appointments.models import Appointment
print(f"Scheduled: {Appointment.objects.filter(status='scheduled').count()}")
print(f"Completed: {Appointment.objects.filter(status='completed').count()}")
```

### **Delete All Appointments** (⚠️ Careful!)
```python
from appointments.models import Appointment
Appointment.objects.all().delete()
print("All appointments deleted!")
```

### **Create Appointments for All Patients**
```bash
cd backend
python create_sample_appointments.py
```

---

## 🎉 **You're All Set!**

The appointments page is now fully functional with sample data!

**Next Steps:**
1. ✅ Login as `akshata@gmail.com` / `staff123`
2. ✅ Navigate to "My Appointments"
3. ✅ See your 5 appointments with updated numbers
4. ✅ Try filtering by Upcoming/Past
5. ✅ Add more appointments via Django Admin

**The numbers update automatically based on:**
- Database content
- Current date (upcoming vs past)
- Appointment status
- Patient filter (only shows logged-in patient's appointments)

---

**Last Updated**: January 26, 2026  
**Sample Appointments**: ✅ Created  
**Total in Database**: 24 appointments
