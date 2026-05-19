#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Reset Patient Data & Add Demo Patients for DialysisTrack
---------------------------------------------------------
This script:
  1. Deletes ALL existing patient-related data:
     - Payments, Bills, PatientInsurance
     - AmbulanceRides
     - DialysisSessions, Queue entries
     - Appointments
     - Patient records
     - User accounts with role='patient' (ONLY patient users)
  2. Keeps ALL staff/admin passwords and accounts intact.
  3. Inserts 4 realistic demo patients with appointments, queue, and billing data.
"""

import os
import sys
import io

# Force UTF-8 stdout to avoid Windows cp1252 encoding errors
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import django
from datetime import date, datetime, timedelta
from decimal import Decimal
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from patients.models import Patient
from machines.models import DialysisMachine
from dialysis_queue.models import Queue, DialysisSession
from appointments.models import Appointment
from billing.models import Bill, Payment, PatientInsurance
from fleet.models import AmbulanceRide
from notifications.models import Notification


def print_header(text):
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)


# -----------------------------------------------
#  STEP 1 - Delete old patient data
# -----------------------------------------------
def delete_old_patient_data():
    print_header("STEP 1: Deleting Old Patient Data")

    # Order matters - delete dependent tables first
    models_to_clear = [
        ("Payments",          Payment),
        ("Bills",             Bill),
        ("Patient Insurance", PatientInsurance),
        ("Ambulance Rides",   AmbulanceRide),
        ("Dialysis Sessions", DialysisSession),
        ("Queue Entries",     Queue),
        ("Appointments",      Appointment),
        ("Notifications (patient)", None),  # handled separately
        ("Patient Records",   Patient),
    ]

    for label, model in models_to_clear:
        if model is None:
            # Delete notifications for patient users only
            patient_users = User.objects.filter(role='patient')
            count = Notification.objects.filter(user__in=patient_users).count()
            Notification.objects.filter(user__in=patient_users).delete()
            print(f"  [OK] Deleted {count} {label}")
            continue
        count = model.objects.count()
        model.objects.all().delete()
        print(f"  [OK] Deleted {count} {label}")

    # Delete patient user accounts (passwords / auth) - ONLY role='patient'
    patient_users = User.objects.filter(role='patient')
    count = patient_users.count()
    patient_users.delete()
    print(f"  [OK] Deleted {count} Patient User Accounts")

    # Reset machine current_patient links
    DialysisMachine.objects.filter(current_patient__isnull=False).update(
        current_patient=None, current_session_start=None, status='available'
    )
    print("  [OK] Reset machine patient assignments")

    print("\n  [DONE] All old patient data removed. Staff & admin accounts untouched.\n")


# -----------------------------------------------
#  STEP 2 - Create 4 realistic demo patients
# -----------------------------------------------
DEMO_PATIENTS = [
    {
        "patient_id": "P001",
        "first_name": "Ramesh",
        "last_name": "Patil",
        "dob": "1962-08-14",
        "gender": "male",
        "blood_type": "B+",
        "phone": "9876543210",
        "email": "ramesh.patil@email.com",
        "address": "12, Shivaji Nagar, Pune, Maharashtra 411005",
        "emergency_contact_name": "Sunita Patil",
        "emergency_contact_phone": "9876543211",
        "primary_diagnosis": "Chronic Kidney Disease Stage 5 (CKD-5) secondary to Diabetic Nephropathy",
        "comorbidities": "Type 2 Diabetes Mellitus, Hypertension, Mild Anemia",
        "allergies": "Sulfonamides",
        "current_medications": "Insulin Glargine 20U, Amlodipine 5mg, Erythropoietin 4000IU/week",
        "dialysis_type": "Hemodialysis",
        "vascular_access": "Left Arteriovenous Fistula (AVF)",
        "dry_weight": Decimal("68.50"),
        "target_weight_loss": Decimal("2.50"),
    },
    {
        "patient_id": "P002",
        "first_name": "Anjali",
        "last_name": "Sharma",
        "dob": "1975-03-22",
        "gender": "female",
        "blood_type": "O+",
        "phone": "9823456789",
        "email": "anjali.sharma@email.com",
        "address": "45, MG Road, Thane West, Mumbai, Maharashtra 400601",
        "emergency_contact_name": "Vikram Sharma",
        "emergency_contact_phone": "9823456780",
        "primary_diagnosis": "End-Stage Renal Disease (ESRD) due to Chronic Glomerulonephritis",
        "comorbidities": "Hypertension, Secondary Hyperparathyroidism",
        "allergies": "Penicillin",
        "current_medications": "Telmisartan 40mg, Calcium Acetate 667mg TID, Calcitriol 0.25mcg",
        "dialysis_type": "Hemodialysis",
        "vascular_access": "Right Internal Jugular Permcath",
        "dry_weight": Decimal("55.00"),
        "target_weight_loss": Decimal("2.00"),
        "is_emergency": True,
    },
    {
        "patient_id": "P003",
        "first_name": "Suresh",
        "last_name": "Kulkarni",
        "dob": "1958-11-05",
        "gender": "male",
        "blood_type": "A+",
        "phone": "9765432100",
        "email": "suresh.kulkarni@email.com",
        "address": "78, Deccan Gymkhana, Pune, Maharashtra 411004",
        "emergency_contact_name": "Meena Kulkarni",
        "emergency_contact_phone": "9765432101",
        "primary_diagnosis": "CKD Stage 5 secondary to Hypertensive Nephrosclerosis",
        "comorbidities": "Resistant Hypertension, Coronary Artery Disease (post-CABG), Peripheral Vascular Disease",
        "allergies": "None known",
        "current_medications": "Metoprolol 50mg BD, Losartan 50mg, Aspirin 75mg, Atorvastatin 20mg, Sevelamer 800mg TID",
        "dialysis_type": "Hemodialysis",
        "vascular_access": "Left Brachiocephalic AVF",
        "dry_weight": Decimal("72.00"),
        "target_weight_loss": Decimal("3.00"),
    },
    {
        "patient_id": "P004",
        "first_name": "Priya",
        "last_name": "Deshmukh",
        "dob": "1990-06-18",
        "gender": "female",
        "blood_type": "AB+",
        "phone": "9654321098",
        "email": "priya.deshmukh@email.com",
        "address": "23, Koregaon Park, Pune, Maharashtra 411001",
        "emergency_contact_name": "Rajesh Deshmukh",
        "emergency_contact_phone": "9654321099",
        "primary_diagnosis": "ESRD due to Lupus Nephritis (SLE Class IV)",
        "comorbidities": "Systemic Lupus Erythematosus, Anemia of Chronic Disease, Osteoporosis",
        "allergies": "Ibuprofen, Contrast Dye",
        "current_medications": "Prednisolone 10mg, Mycophenolate 500mg BD, Hydroxychloroquine 200mg, Folic Acid 5mg, Iron Sucrose IV",
        "dialysis_type": "Hemodialysis",
        "vascular_access": "Right Radiocephalic AVF",
        "dry_weight": Decimal("52.00"),
        "target_weight_loss": Decimal("1.80"),
    },
]


def create_demo_patients():
    print_header("STEP 2: Creating 4 Demo Patients")

    created_patients = []

    for data in DEMO_PATIENTS:
        # --- Create User account for patient ---
        user = User.objects.create_user(
            email=data["email"],
            username=data["patient_id"].lower(),
            password="patient123",
            first_name=data["first_name"],
            last_name=data["last_name"],
            role="patient",
            phone_number=data["phone"],
        )

        # --- Create Patient record ---
        patient = Patient.objects.create(
            patient_id=data["patient_id"],
            user=user,
            first_name=data["first_name"],
            last_name=data["last_name"],
            date_of_birth=data["dob"],
            gender=data["gender"],
            blood_type=data["blood_type"],
            phone_number=data["phone"],
            email=data["email"],
            address=data["address"],
            emergency_contact_name=data["emergency_contact_name"],
            emergency_contact_phone=data["emergency_contact_phone"],
            primary_diagnosis=data["primary_diagnosis"],
            comorbidities=data.get("comorbidities", ""),
            allergies=data.get("allergies", ""),
            current_medications=data.get("current_medications", ""),
            dialysis_type=data.get("dialysis_type", ""),
            vascular_access=data.get("vascular_access", ""),
            dry_weight=data.get("dry_weight"),
            target_weight_loss=data.get("target_weight_loss"),
            is_emergency=data.get("is_emergency", False),
        )
        created_patients.append(patient)
        print(f"  [OK] Patient {patient.patient_id}: {patient.first_name} {patient.last_name}")
        print(f"       Diagnosis: {patient.primary_diagnosis}")
        print(f"       Login: {data['email']} / patient123")

    return created_patients


# -----------------------------------------------
#  STEP 3 - Create Appointments for demo patients
# -----------------------------------------------
def create_demo_appointments(patients):
    print_header("STEP 3: Creating Appointments")

    today = date.today()
    schedules = [
        # (days_offset, shift, time)
        (0, "morning", "08:00"),
        (0, "evening", "14:00"),
        (1, "morning", "09:00"),
        (2, "morning", "08:00"),
        (3, "evening", "15:00"),
    ]

    appointments = []
    for i, patient in enumerate(patients):
        offset, shift, time_str = schedules[i % len(schedules)]
        appt_date = today + timedelta(days=offset)

        appt = Appointment.objects.create(
            patient=patient,
            appointment_date=appt_date,
            shift=shift,
            scheduled_time=time_str,
            status="scheduled",
            notes=f"Regular hemodialysis session - {patient.first_name} {patient.last_name}",
        )
        appointments.append(appt)
        print(f"  [OK] {patient.patient_id} -> {appt_date} ({shift} {time_str})")

    # Add one past completed appointment per patient for history
    for patient in patients:
        past_date = today - timedelta(days=random.randint(2, 7))
        Appointment.objects.create(
            patient=patient,
            appointment_date=past_date,
            shift="morning",
            scheduled_time="08:00",
            status="completed",
            notes=f"Completed dialysis session - {patient.first_name} {patient.last_name}",
        )
        print(f"  [OK] {patient.patient_id} -> {past_date} (completed - history)")

    return appointments


# -----------------------------------------------
#  STEP 4 - Create Queue Entries
# -----------------------------------------------
def create_demo_queue(patients):
    print_header("STEP 4: Creating Queue Entries")

    queue_configs = [
        {"priority": "scheduled",  "status": "waiting",     "wait": 15},
        {"priority": "emergency",  "status": "in_progress", "wait": 0},
        {"priority": "scheduled",  "status": "waiting",     "wait": 25},
        {"priority": "scheduled",  "status": "waiting",     "wait": 35},
    ]

    queues = []
    for i, patient in enumerate(patients):
        cfg = queue_configs[i]
        q = Queue.objects.create(
            patient=patient,
            queue_number=f"Q{str(i + 1).zfill(3)}",
            priority=cfg["priority"],
            status=cfg["status"],
            estimated_wait_time=cfg["wait"],
        )

        if cfg["status"] == "in_progress":
            machine = DialysisMachine.objects.filter(status="available").first()
            if machine:
                q.assigned_machine = machine.machine_id
                q.save()
                machine.status = "in_use"
                machine.current_patient = patient
                machine.save()
                print(f"  [OK] {patient.patient_id} -> Queue {q.queue_number} [IN PROGRESS on {machine.machine_id}]")
            else:
                print(f"  [OK] {patient.patient_id} -> Queue {q.queue_number} [IN PROGRESS - no machine available]")
        else:
            print(f"  [OK] {patient.patient_id} -> Queue {q.queue_number} [{cfg['status'].upper()}, ~{cfg['wait']}min]")

        queues.append(q)
    return queues


# -----------------------------------------------
#  STEP 5 - Create Bills
# -----------------------------------------------
def create_demo_bills(patients):
    print_header("STEP 5: Creating Demo Bills")

    bill_configs = [
        {"sessions": 3, "medicine": 750,  "other": 200, "discount": 500,  "status": "pending"},
        {"sessions": 1, "medicine": 1200, "other": 350, "discount": 0,    "status": "paid"},
        {"sessions": 2, "medicine": 500,  "other": 0,   "discount": 1000, "status": "partial"},
        {"sessions": 1, "medicine": 0,    "other": 150, "discount": 0,    "status": "pending"},
    ]

    for i, patient in enumerate(patients):
        cfg = bill_configs[i]
        bill = Bill.objects.create(
            patient=patient,
            dialysis_sessions=cfg["sessions"],
            session_cost=Decimal("2500.00"),
            medicine_cost=Decimal(str(cfg["medicine"])),
            consultation_cost=Decimal("500.00"),
            other_charges=Decimal(str(cfg["other"])),
            discount=Decimal(str(cfg["discount"])),
            due_date=date.today() + timedelta(days=7),
            status=cfg["status"],
        )
        print(f"  [OK] {patient.patient_id} -> Bill {bill.bill_number}  Rs.{bill.total_amount}  [{cfg['status'].upper()}]")

        # Record payment for paid/partial bills
        if cfg["status"] in ("paid", "partial"):
            pay_amount = bill.total_amount if cfg["status"] == "paid" else bill.total_amount * Decimal("0.5")
            payment = Payment.objects.create(
                bill=bill,
                amount=pay_amount,
                payment_method=random.choice(["cash", "upi"]),
                status="completed",
            )
            bill.paid_amount = pay_amount
            bill.save()
            print(f"       Payment: {payment.payment_id}  Rs.{pay_amount}")


# -----------------------------------------------
#  STEP 6 - Summary
# -----------------------------------------------
def print_summary():
    print_header("SETUP COMPLETE - Summary")

    print(f"""
  Database now contains:
      Patients    : {Patient.objects.count()}
      Appointments: {Appointment.objects.count()}
      Queue       : {Queue.objects.count()}
      Bills       : {Bill.objects.count()}
      Payments    : {Payment.objects.count()}

  DEMO LOGIN CREDENTIALS
  --------------------------------------
  | Patient         | Email                         | Password    |
  |-----------------|-------------------------------|-------------|
  | Ramesh Patil    | ramesh.patil@email.com        | patient123  |
  | Anjali Sharma   | anjali.sharma@email.com       | patient123  |
  | Suresh Kulkarni | suresh.kulkarni@email.com     | patient123  |
  | Priya Deshmukh  | priya.deshmukh@email.com      | patient123  |
  --------------------------------------

  Staff / Admin accounts are UNCHANGED.
  [DONE] Ready for demo!
""")


# -----------------------------------------------
#  MAIN
# -----------------------------------------------
def main():
    print("\n" + "=" * 60)
    print("  DIALYSISTRACK -- RESET & LOAD DEMO DATA")
    print("=" * 60)

    delete_old_patient_data()
    patients = create_demo_patients()
    create_demo_appointments(patients)
    create_demo_queue(patients)
    create_demo_bills(patients)
    print_summary()


if __name__ == "__main__":
    main()
