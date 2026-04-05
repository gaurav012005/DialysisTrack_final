
# 4. DATABASE DESIGN

Designing the database was one of the most important steps in the whole project. Every feature — from appointment booking to billing to GPS tracking — depends on how well the data is structured. We needed a schema that is normalised enough to avoid redundancy, but practical enough to keep query performance good for the dashboards and reports.

This chapter describes the schema, table-by-table structure, all relationships and constraints, and the reasoning behind our design decisions.

---
<div style="page-break-after: always;"></div>

## 4.1 Database Schema Overview

The database has **18 tables** organised across **8 Django apps**. Each Django app handles a specific functional area of the system.

| # | Table Name | Django App | Purpose | Approx. Rows (1-year est.) |
|:-:|:-----------|:-----------|:--------|:--------------------------:|
| 1 | users_user | users | User accounts for all 7 roles | 50–100 |
| 2 | patients_patient | patients | Patient demographics and medical data | 200–500 |
| 3 | appointments_appointment | appointments | Scheduled dialysis appointments | 5,000–10,000 |
| 4 | dialysis_queue_queue | dialysis_queue | Treatment queue entries | 5,000–10,000 |
| 5 | dialysis_queue_dialysissession | dialysis_queue | Session vitals and clinical parameters | 5,000–10,000 |
| 6 | dialysis_queue_queuesettings | dialysis_queue | Queue configuration (single row, global) | 1 |
| 7 | machines_dialysismachine | machines | Dialysis machine inventory | 10–20 |
| 8 | machines_maintenancelog | machines | Machine maintenance history | 100–200 |
| 9 | machines_cleaninglog | machines | Post-session cleaning records | 5,000–10,000 |
| 10 | billing_bill | billing | Bills with GST calculation | 5,000–10,000 |
| 11 | billing_payment | billing | Payment transactions | 5,000–10,000 |
| 12 | billing_insuranceprovider | billing | Insurance company master data | 10–20 |
| 13 | billing_patientinsurance | billing | Patient-to-insurance mapping | 100–300 |
| 14 | staff_staffschedule | staff | Shift assignments for staff | 3,000–5,000 |
| 15 | staff_staffattendance | staff | Daily attendance punches | 3,000–5,000 |
| 16 | staff_leaverequest | staff | Leave applications and approvals | 100–200 |
| 17 | fleet_ambulance | fleet | Ambulance vehicle registration | 2–5 |
| 18 | fleet_ambulanceride | fleet | Ride tracking with GPS | 500–2,000 |

The row estimates are based on a 15-machine centre serving 30 patients per day across 3 shifts. Smaller centres will have proportionally fewer records.

### 4.1.1 Database Engine

| Environment | Engine | Why |
|:------------|:-------|:----|
| Development | SQLite 3.x | Zero configuration — just a single file (db.sqlite3). Perfect for local development and testing on any machine |
| Production | MySQL 8.0 (InnoDB) | ACID-compliant with row-level locking, crash recovery, and support for concurrent users. Handles the full load of a busy centre |

Switching between the two requires changing a single block in Django's `settings.py` file. Django's ORM generates the correct SQL for each engine automatically.

### 4.1.2 Normalisation

The schema follows **Third Normal Form (3NF)** with a few intentional denormalisations for performance:

**First Normal Form (1NF):** Every column contains only atomic (single) values. For example, instead of storing "allergies" as a comma-separated string like "penicillin,aspirin", each allergy would ideally be a separate record. However, we chose to store allergies as a TEXT field because the list is free-form and rarely queried individually — it is mainly for display purposes.

**Second Normal Form (2NF):** Every non-key attribute depends on the full primary key. For instance, in the `dialysissession` table, all vital sign columns (pre_bp_systolic, post_heart_rate, etc.) depend entirely on the session ID, not on any partial key.

**Third Normal Form (3NF):** No transitive dependencies. Patient's name and phone are stored in the `patients_patient` table and not duplicated in the `queue` or `billing` tables. When a bill needs to show the patient's name, it joins to the patient table via the foreign key.

**Intentional denormalisations:**
- `queue.blood_pressure` and `queue.weight_before/after` duplicate data that also exists in `dialysissession`. This was done because the queue view needs to show these values quickly without joining to the session table, which improves dashboard load times.
- `bill.subtotal` and `bill.total_amount` are calculated fields that could be derived from the individual cost columns. We store them pre-calculated to avoid re-computing on every page load.

---
<div style="page-break-after: always;"></div>

## 4.2 Table Design

### 4.2.1 users_user

This is the central authentication table. Every person who logs into the system has a record here. Django's built-in `AbstractUser` is extended with custom fields for role, department, phone, and address.

| Column | Type | Constraints | Description |
|:-------|:-----|:-----------|:------------|
| id | INT | PK, Auto | Internal unique ID |
| username | VARCHAR(150) | Unique, Not Null | Login username |
| email | VARCHAR(254) | Unique | Email address |
| password | VARCHAR(128) | Not Null | Bcrypt/PBKDF2 hashed password (Django does NOT store plaintext) |
| first_name | VARCHAR(150) | | User's first name |
| last_name | VARCHAR(150) | | User's last name |
| role | VARCHAR(20) | Not Null, default 'receptionist' | One of: admin, doctor, nurse, technician, receptionist, patient, driver |
| department | VARCHAR(100) | | Department (Nephrology, Nursing, etc.) |
| phone_number | VARCHAR(15) | | Contact phone |
| address | TEXT | | Residential address |
| date_of_birth | DATE | Nullable | Date of birth |
| hire_date | DATE | Nullable | Employment start date (for staff) |
| is_active | BOOLEAN | Default True | False = account deactivated |
| is_staff | BOOLEAN | Default False | True = can access Django admin panel |
| date_joined | DATETIME | Auto | Account creation timestamp |
| last_login | DATETIME | Nullable | Last successful login |

**Design note:** The `role` field is a simple VARCHAR rather than a separate role table because we have a fixed set of 7 roles that will not change at runtime. A separate role table would add complexity (joins on every permission check) without benefit.

### 4.2.2 patients_patient

Stores all clinical and demographic data for a patient. Linked to `users_user` via an optional FK so that patients who register online get a user account, while patients registered by the receptionist may not have one initially.

| Column | Type | Constraints | Description |
|:-------|:-----|:-----------|:------------|
| id | INT | PK | Internal ID |
| patient_id | VARCHAR(20) | Unique, auto-gen | Human-readable ID (P001, P002, ...) |
| user_id | INT | FK → users_user, Nullable | Linked user account (if any) |
| first_name | VARCHAR(100) | Not Null | Patient first name |
| last_name | VARCHAR(100) | Not Null | Patient last name |
| date_of_birth | DATE | Not Null | Used to calculate age |
| gender | VARCHAR(10) | Not Null | male / female / other |
| blood_type | VARCHAR(3) | | A+, B-, O+, AB+, etc. |
| phone_number | VARCHAR(15) | Not Null | Primary contact number |
| email | VARCHAR(254) | | Email for communication |
| address | TEXT | Not Null | Residential address |
| emergency_contact_name | VARCHAR(100) | Not Null | Emergency contact person |
| emergency_contact_phone | VARCHAR(15) | Not Null | Emergency contact phone |
| primary_diagnosis | TEXT | Not Null | CKD stage, ESRD, etc. |
| comorbidities | TEXT | | Diabetes, hypertension, etc. |
| allergies | TEXT | | Drug allergies |
| current_medications | TEXT | | Ongoing medications |
| dialysis_type | VARCHAR(50) | | Haemodialysis / Peritoneal |
| vascular_access | VARCHAR(100) | | AV Fistula / AV Graft / Catheter |
| dry_weight | DECIMAL(5,2) | Nullable | Target post-dialysis weight (kg) |
| target_weight_loss | DECIMAL(4,2) | Nullable | Max fluid removal per session (kg) |
| is_emergency | BOOLEAN | Default False | True = auto-prioritised in queue |
| is_active | BOOLEAN | Default True | False = discharged or deceased |
| created_at | DATETIME | Auto | Record creation time |
| updated_at | DATETIME | Auto on update | Last modified time |

**Design note:** We store `first_name` and `last_name` separately (not as a single `name` field) so that we can sort by last name — which is the standard in medical records.

---
<div style="page-break-after: always;"></div>

### 4.2.3 appointments_appointment

Each row represents a single appointment booking.

| Column | Type | Constraints | Description |
|:-------|:-----|:-----------|:------------|
| id | INT | PK | Internal ID |
| patient_id | INT | FK → patient | Which patient |
| date | DATE | Not Null | Appointment date |
| shift | VARCHAR(20) | Not Null | morning (6AM–12PM) / evening (12PM–6PM) / night (6PM–12AM) |
| status | VARCHAR(20) | Default 'scheduled' | scheduled / confirmed / completed / cancelled |
| created_by_id | INT | FK → user, Nullable | Who created this appointment |
| notes | TEXT | | Special instructions |
| created_at | DATETIME | Auto | Booking timestamp |

**Validation:** The API prevents double-booking — a patient cannot have two appointments on the same date and shift.

### 4.2.4 dialysis_queue_queue

When a patient arrives and checks in, a queue entry is created. This table is the central operational table that the nurses look at all day.

| Column | Type | Constraints | Description |
|:-------|:-----|:-----------|:------------|
| id | INT | PK | Internal ID |
| patient_id | INT | FK → patient | Which patient |
| appointment_id | INT | FK → appointment, Nullable | Linked appointment (NULL for walk-ins) |
| queue_number | VARCHAR(10) | Unique | Auto-generated (Q001, Q002, ...) |
| priority | VARCHAR(20) | Default 'scheduled' | emergency / scheduled / walk_in |
| status | VARCHAR(20) | Default 'waiting' | waiting / in_progress / completed / cancelled |
| check_in_time | DATETIME | Auto | When the patient checked in |
| estimated_wait_time | INT | Default 0 | Estimated wait in minutes |
| actual_start_time | DATETIME | Nullable | When dialysis actually started |
| actual_end_time | DATETIME | Nullable | When dialysis ended |
| assigned_machine | VARCHAR(50) | | Machine ID (M-001, etc.) |
| assigned_staff_id | INT | FK → user, Nullable | Nurse assigned |
| blood_pressure | VARCHAR(20) | | Quick-reference BP reading |
| weight_before | DECIMAL(5,2) | Nullable | Pre-dialysis weight (kg) |
| weight_after | DECIMAL(5,2) | Nullable | Post-dialysis weight (kg) |
| notes | TEXT | | Queue-specific notes |

### 4.2.5 dialysis_queue_dialysissession

One-to-one with queue. This is where the detailed clinical data for each treatment session lives.

| Column | Type | Constraints | Description |
|:-------|:-----|:-----------|:------------|
| id | INT | PK | Internal ID |
| queue_id | INT | FK, OneToOne → queue | Links to the queue entry |
| patient_id | INT | FK → patient | Which patient |
| attending_doctor_id | INT | FK → user, Nullable | Doctor on duty |
| attending_nurse_id | INT | FK → user, Nullable | Nurse performing treatment |
| pre_bp_systolic | INT | Nullable | Pre-dialysis systolic BP (mmHg) |
| pre_bp_diastolic | INT | Nullable | Pre-dialysis diastolic BP (mmHg) |
| pre_heart_rate | INT | Nullable | Pre-dialysis heart rate (bpm) |
| pre_temperature | DECIMAL(4,1) | Nullable | Pre-dialysis temperature (°C) |
| pre_oxygen_saturation | INT | Nullable | Pre-dialysis SpO2 (%) |
| post_bp_systolic | INT | Nullable | Post-dialysis systolic BP |
| post_bp_diastolic | INT | Nullable | Post-dialysis diastolic BP |
| post_heart_rate | INT | Nullable | Post-dialysis heart rate |
| post_temperature | DECIMAL(4,1) | Nullable | Post-dialysis temperature |
| post_oxygen_saturation | INT | Nullable | Post-dialysis SpO2 |
| blood_flow_rate | INT | Nullable | Blood pump speed (mL/min) |
| dialysate_flow_rate | INT | Nullable | Dialysate flow (mL/min) |
| ultrafiltration_volume | DECIMAL(5,2) | Nullable | Fluid removed (litres) |
| heparin_dose | DECIMAL(6,2) | Nullable | Anticoagulant dose (units) |
| medications | TEXT | | Medications administered during session |
| complications | TEXT | | Any complications (cramping, hypotension, etc.) |
| nurse_notes | TEXT | | Nursing observations |
| doctor_notes | TEXT | | Doctor's clinical notes |

**Design note:** We store pre and post vitals in the same row (rather than separate rows) because they always occur in pairs — there is always exactly one pre and one post reading per session. This simplifies queries significantly when generating vital trend charts.

---
<div style="page-break-after: always;"></div>

### 4.2.6 machines_dialysismachine

| Column | Type | Constraints | Description |
|:-------|:-----|:-----------|:------------|
| id | INT | PK | Internal ID |
| machine_id | VARCHAR(20) | Unique | Human-readable ID (M-001, M-002, ...) |
| name | VARCHAR(100) | Not Null | Display name (e.g., "Fresenius 5008S #3") |
| machine_type | VARCHAR(20) | Default 'hemodialysis' | hemodialysis / peritoneal / crrt |
| manufacturer | VARCHAR(100) | Not Null | Fresenius, Nipro, Baxter, etc. |
| model | VARCHAR(100) | Not Null | Model number/name |
| serial_number | VARCHAR(100) | Unique | Factory serial number |
| status | VARCHAR(20) | Default 'available' | available / in_use / cleaning / maintenance / out_of_service |
| current_patient_id | INT | FK → patient, Nullable | Currently assigned patient (NULL when free) |
| location | VARCHAR(100) | | Ward / room / bed number |
| purchase_date | DATE | Not Null | When the machine was bought |
| warranty_expiry | DATE | Nullable | Warranty end date |
| last_maintenance_date | DATE | Nullable | Most recent maintenance |
| next_maintenance_date | DATE | Nullable | Upcoming scheduled maintenance |
| maintenance_interval_days | INT | Default 90 | Maintenance frequency (days) |
| total_sessions | INT | Default 0 | Lifetime session count (auto-incremented) |
| total_operating_hours | DECIMAL(8,2) | Default 0 | Lifetime usage hours |

Machine status lifecycle: `available` → `in_use` (when assigned to a patient) → `cleaning` (after session ends, nurse marks cleaning) → `available` (after cleaning is done). The `maintenance` and `out_of_service` states are set manually when needed.

### 4.2.7 billing_bill

| Column | Type | Constraints | Description |
|:-------|:-----|:-----------|:------------|
| id | INT | PK | Internal ID |
| bill_number | VARCHAR(20) | Unique, auto-gen | Format: DT + YYYYMMDD + sequence (e.g., DT20260405001) |
| patient_id | INT | FK → patient | Billed patient |
| dialysis_sessions | INT | Default 1 | Number of sessions being billed |
| session_cost | DECIMAL(10,2) | Default 2500.00 | Cost per session (Rs.) |
| medicine_cost | DECIMAL(10,2) | Default 0.00 | Medicines administered |
| consultation_cost | DECIMAL(10,2) | Default 500.00 | Doctor consultation fee |
| other_charges | DECIMAL(10,2) | Default 0.00 | Miscellaneous charges |
| subtotal | DECIMAL(10,2) | Auto-calculated | sessions × session_cost + medicine + consultation + other |
| discount | DECIMAL(10,2) | Default 0.00 | Discount amount (Rs.) |
| tax_amount | DECIMAL(10,2) | Auto 18% GST | (subtotal - discount) × 0.18 |
| total_amount | DECIMAL(10,2) | Auto-calculated | subtotal - discount + tax_amount |
| paid_amount | DECIMAL(10,2) | Default 0.00 | Amount paid so far |
| status | VARCHAR(20) | Default 'pending' | pending / partial / paid / overdue |
| due_date | DATE | Not Null | Payment due date |

**Billing formula:**
```
subtotal = (dialysis_sessions × session_cost) + medicine_cost + consultation_cost + other_charges
tax_amount = (subtotal - discount) × 0.18
total_amount = subtotal - discount + tax_amount
```

### 4.2.8 billing_payment

| Column | Type | Constraints | Description |
|:-------|:-----|:-----------|:------------|
| id | INT | PK | Internal ID |
| payment_id | VARCHAR(20) | Unique, auto-gen | Human-readable payment reference |
| bill_id | INT | FK → bill | Which bill is being paid |
| amount | DECIMAL(10,2) | Not Null | Payment amount (Rs.) |
| payment_method | VARCHAR(20) | Not Null | cash / upi / card / net_banking |
| transaction_reference | VARCHAR(100) | | UPI transaction ID, card reference, etc. |
| processed_by_id | INT | FK → user, Nullable | Staff member who processed the payment |
| payment_date | DATETIME | Auto | When the payment was made |

A bill can have multiple payment records (partial payments). The bill's `paid_amount` is the sum of all linked payment amounts.

---
<div style="page-break-after: always;"></div>

### 4.2.9 staff_staffschedule

| Column | Type | Constraints | Description |
|:-------|:-----|:-----------|:------------|
| id | INT | PK | Internal ID |
| staff_id | INT | FK → user | Which staff member |
| shift_date | DATE | Not Null | Date of the shift |
| shift_type | VARCHAR(20) | Not Null | morning / evening / night |
| start_time | TIME | Not Null | Shift start time |
| end_time | TIME | Not Null | Shift end time |
| is_present | BOOLEAN | Default False | Whether staff was present |
| notes | TEXT | | Shift notes |

Unique constraint on (staff_id, shift_date) — a staff member can have at most one shift per day.

### 4.2.10 staff_staffattendance

| Column | Type | Constraints | Description |
|:-------|:-----|:-----------|:------------|
| id | INT | PK | Internal ID |
| staff_id | INT | FK → user | Which staff member |
| date | DATE | Not Null | Attendance date |
| status | VARCHAR(20) | Not Null | present / absent / late / half_day / on_leave |
| check_in_time | TIME | Nullable | Actual arrival time |
| check_out_time | TIME | Nullable | Actual departure time |
| notes | TEXT | | Attendance notes |

### 4.2.11 staff_leaverequest

| Column | Type | Constraints | Description |
|:-------|:-----|:-----------|:------------|
| id | INT | PK | Internal ID |
| staff_id | INT | FK → user | Who is requesting leave |
| leave_type | VARCHAR(20) | | casual / sick / earned / emergency |
| start_date | DATE | Not Null | Leave start |
| end_date | DATE | Not Null | Leave end |
| reason | TEXT | | Reason for leave |
| status | VARCHAR(20) | Default 'pending' | pending / approved / rejected |
| approved_by_id | INT | FK → user, Nullable | Who approved/rejected |
| created_at | DATETIME | Auto | Request timestamp |

### 4.2.12 fleet_ambulance and fleet_ambulanceride

**fleet_ambulance:**

| Column | Type | Constraints | Description |
|:-------|:-----|:-----------|:------------|
| id | INT | PK | Internal ID |
| vehicle_number | VARCHAR(20) | Unique | Registration plate (MH12AB1234) |
| driver_id | INT | FK → user, Nullable | Assigned driver |
| status | VARCHAR(20) | Default 'available' | available / on_trip / maintenance |

**fleet_ambulanceride:**

| Column | Type | Constraints | Description |
|:-------|:-----|:-----------|:------------|
| id | INT | PK | Internal ID |
| ambulance_id | INT | FK → ambulance | Which ambulance |
| patient_id | INT | FK → patient | Patient being transported |
| pickup_address | TEXT | Not Null | Pickup location |
| dropoff_address | TEXT | | Drop-off location (usually the centre) |
| status | VARCHAR(20) | Default 'assigned' | assigned → en_route → arrived → picked_up → completed |
| driver_lat | DECIMAL(10,7) | Nullable | Current latitude (updated via WebSocket) |
| driver_lng | DECIMAL(10,7) | Nullable | Current longitude |
| requested_at | DATETIME | Auto | When the ride was requested |
| completed_at | DATETIME | Nullable | When the ride was completed |

---
<div style="page-break-after: always;"></div>

## 4.3 Relationships and Constraints

### 4.3.1 Foreign Key Summary

The following table lists every foreign key relationship in the database:

| Child Table | FK Column | Parent Table | On Delete | Reason |
|:------------|:----------|:-------------|:----------|:-------|
| patient | user_id | user | SET NULL | Patient record should survive even if user account is removed |
| appointment | patient_id | patient | CASCADE | No point keeping an appointment without a patient |
| appointment | created_by_id | user | SET NULL | Keep the appointment even if the creator leaves |
| queue | patient_id | patient | CASCADE | Queue entry is meaningless without the patient |
| queue | appointment_id | appointment | SET NULL | Walk-in patients have no appointment; keep queue even if appointment is cancelled |
| queue | assigned_staff_id | user | SET NULL | Reassign if staff changes |
| dialysissession | queue_id | queue | CASCADE | Session is part of the queue workflow |
| dialysissession | patient_id | patient | CASCADE | Session data belongs to the patient |
| dialysissession | attending_doctor_id | user | SET NULL | Session record survives staff changes |
| dialysissession | attending_nurse_id | user | SET NULL | Same as above |
| dialysismachine | current_patient_id | patient | SET NULL | Machine becomes free if patient is removed |
| maintenancelog | machine_id | machine | CASCADE | Maintenance history goes with the machine |
| cleaninglog | machine_id | machine | CASCADE | Cleaning history goes with the machine |
| bill | patient_id | patient | CASCADE | Bills belong to the patient |
| payment | bill_id | bill | CASCADE | Payments are part of the bill |
| payment | processed_by_id | user | SET NULL | Keep payment record even if staff leaves |
| staffschedule | staff_id | user | CASCADE | Schedule is only relevant for the specific staff |
| staffattendance | staff_id | user | CASCADE | Attendance is staff-specific |
| leaverequest | staff_id | user | CASCADE | Leave requests belong to staff |
| leaverequest | approved_by_id | user | SET NULL | Keep the request even if approver leaves |
| ambulance | driver_id | user | SET NULL | Ambulance can be reassigned |
| ambulanceride | ambulance_id | ambulance | CASCADE | Ride is tied to the ambulance |
| ambulanceride | patient_id | patient | CASCADE | Ride is for a specific patient |

### 4.3.2 Key Design Decisions Explained

**Why CASCADE from patient for clinical tables:**
If a patient record is deleted (which should only happen in extreme cases by the admin), all their dependent records — appointments, queue entries, sessions, and bills — should also be removed. Otherwise, we end up with orphaned rows that reference a patient who no longer exists, which would break every page that tries to display patient information.

**Why SET NULL for staff foreign keys:**
Staff come and go. A nurse who recorded a session might leave the hospital six months later. We do not want to delete the session record just because the nurse left. So we set the FK to NULL, which means the record stays but the "recorded by" field shows as blank.

**Why DECIMAL for all monetary fields:**
We use DECIMAL(10,2) for every financial column — bill amounts, payment amounts, discounts, tax. We never use FLOAT or DOUBLE for money. This is because floating-point arithmetic has precision issues (for example, `0.1 + 0.2 = 0.30000000000000004` in most programming languages). For billing in a healthcare setting, even a 1 paisa discrepancy triggers questions from the accounts team.

**Auto-generated human-readable IDs:**
Every major entity has a human-readable ID in addition to the database auto-increment ID:
- Patients: P001, P002, P003, ...
- Bills: DT20260405001 (DT + date + sequence)
- Queue: Q001, Q002, ...
- Machines: M-001, M-002, ...

These are generated in the Django model's `save()` method. They are used in the UI and on printed receipts — nobody wants to look at "Patient #47823", they want to see "Patient P048."

**Unique constraints:**
- `users_user.username` — no two users can have the same login
- `users_user.email` — used for password reset, must be unique
- `patients_patient.patient_id` — the P001 format must be unique
- `machines_dialysismachine.machine_id` — M-001 must be unique
- `machines_dialysismachine.serial_number` — manufacturer's serial, no duplicates
- `billing_bill.bill_number` — each bill gets a unique number for tax compliance
- `fleet_ambulance.vehicle_number` — vehicle registration plate, unique

