# ER Schema & Database Architecture

DialysisTrack relies on a highly normalized MySQL Relational Database to ensure data consistency, enforce foreign key constraints, and guarantee ACID (Atomicity, Consistency, Isolation, Durability) properties across hospital operations.

## 1. Core Base Entities

### Users (`users_user`)
The foundational table extended from Django's AbstractUser. Every actor in the system possesses a record here.
- **Fields:** `id` (PK), `username`, `password`, `email`, `first_name`, `last_name`, `role` (Admin, Doctor, etc.), `department`, `phone_number`.
- **Relations:** 
  - 1-to-1 with `patients_patient` (if the User acts as a Patient trying to login).
  - 1-to-Many with `billing_payment` (a Receptionist `User` can process many Payments).

### Patients (`patients_patient`)
Stores detailed medical demographics.
- **Fields:** `id` (PK), `user_id` (FK), `patient_id` (Unique String), `date_of_birth`, `gender`, `blood_type` (A+, O-, etc.), `address`, `emergency_contact_name`, `emergency_contact_phone`, `medical_history` (Text), `is_emergency` (Boolean).
- **Relations:**
  - 1-to-Many with `appointments_appointment` (One Patient has many Appointments).
  - 1-to-Many with `dialysis_queue_dialysissession` (One Patient undergoes many Sessions).

---

## 2. Operational Entities

### Machines (`dialysis_queue_machine`)
Physical hospital hardware inventory.
- **Fields:** `id` (PK), `serial_number`, `model`, `status` (Available, In Use, Maintenance, Offline), `last_maintenance_date`, `total_sessions_run`, `location` (Ward A, ICU).
- **Relations:**
  - 1-to-Many with `dialysis_queue_dialysissession` (A Machine runs many Sessions over time).

### Dialysis Sessions (`dialysis_queue_dialysissession`)
The core operational transaction connecting the hardware to the human.
- **Fields:** `id` (PK), `patient_id` (FK), `machine_id` (FK), `start_time` (Datetime), `end_time` (Datetime), `status` (Scheduled, Ongoing, Completed, Cancelled).
- **Clinical Data Captured:** `pre_weight`, `post_weight`, `blood_pressure_start`, `blood_pressure_end`, `blood_volume_processed`, `notes`, `complications`.
- **Relations:**
  - 1-to-1 with `billing_bill` (Completing a Session generates exactly One Invoice).

---

## 3. Financial Entities (Billing Layer)

### Bills (`billing_bill`)
The master invoice generated directly from a `DialysisSession`.
- **Fields:** `id` (PK), `bill_number` (Unique), `patient_id` (FK), `session_cost`, `medicine_cost`, `consultation_cost`, `other_charges`, `subtotal`, `tax_amount`, `total_amount`, `paid_amount`, `status` (Pending, Partial, Paid, Overdue).
- **Calculated Constraint:** `total_amount` must always equal `subtotal + tax_amount - discount`.

### Payments (`billing_payment`)
Records individual financial collections (atomically).
- **Fields:** `id` (PK), `payment_id` (Unique String), `bill_id` (FK), `amount`, `payment_method` (Cash, UPI, Card), `status` (Completed, Repaid), `transaction_id`, `bank_name`, `processing_fee`.
- **Audit Logging:** `processed_by_id` (FK to User). Identifies exactly which Receptionist touched the cash drawer.
- **Relations:**
  - Many-to-1 with `billing_bill` (A ₹5,000 Bill can be paid via two ¥2,500 Payments).

---

## 4. Live Tracking Entities (Fleet Layer)

### Ambulances (`fleet_ambulance`)
- **Fields:** `id` (PK), `vehicle_number`, `driver_id` (FK to User), `status` (Available, On Trip, Maintenance), `capacity`, `equipment_level` (Basic/ICU).

### Ambulance Rides (`fleet_ambulanceride`)
The atomic deployment of an ambulance to a patient.
- **Fields:** `id` (PK), `ambulance_id` (FK), `patient_id` (FK), `status` (Assigned, En Route, Arrived, Completed), `pickup_address`, `driver_lat` (Float), `driver_lng` (Float).
- **Real-Time Dynamic:** The `driver_lat` and `driver_lng` are continuously overwritten by the Redis WebSocket consumer to persist the last known good location of the vehicle.
