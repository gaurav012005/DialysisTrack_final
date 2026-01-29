#!/usr/bin/env python
"""
Verify Database Setup - Check all created data
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from patients.models import Patient
from machines.models import DialysisMachine
from appointments.models import Appointment
from dialysis_queue.models import Queue
from billing.models import Bill

print("\n" + "="*60)
print("  DATABASE VERIFICATION")
print("="*60 + "\n")

# Check Users
users = User.objects.all()
print(f"📊 Total Users: {users.count()}")
print(f"   - Admins: {User.objects.filter(role='admin').count()}")
print(f"   - Doctors: {User.objects.filter(role='doctor').count()}")
print(f"   - Nurses: {User.objects.filter(role='nurse').count()}")
print(f"   - Technicians: {User.objects.filter(role='technician').count()}")
print(f"   - Receptionists: {User.objects.filter(role='receptionist').count()}")
print(f"   - Patients: {User.objects.filter(role='patient').count()}\n")

# Check Patients
patients = Patient.objects.all()
print(f"👥 Total Patients: {patients.count()}")
for patient in patients[:5]:  # Show first 5
    print(f"   - {patient.patient_id}: {patient.first_name} {patient.last_name}")
if patients.count() > 5:
    print(f"   ... and {patients.count() - 5} more\n")
else:
    print()

# Check Machines
machines = DialysisMachine.objects.all()
print(f"🏥 Total Machines: {machines.count()}")
print(f"   - Available: {machines.filter(status='available').count()}")
print(f"   - In Use: {machines.filter(status='in_use').count()}")
print(f"   - Maintenance: {machines.filter(status='maintenance').count()}\n")

# Check Appointments
appointments = Appointment.objects.all()
print(f"📅 Total Appointments: {appointments.count()}")
print(f"   - Scheduled: {appointments.filter(status='scheduled').count()}")
print(f"   - Completed: {appointments.filter(status='completed').count()}")
print(f"   - Cancelled: {appointments.filter(status='cancelled').count()}\n")

# Check Queue
queue = Queue.objects.all()
print(f"⏳ Total Queue Entries: {queue.count()}")
print(f"   - Waiting: {queue.filter(status='waiting').count()}")
print(f"   - In Progress: {queue.filter(status='in_progress').count()}")
print(f"   - Completed: {queue.filter(status='completed').count()}\n")

# Check Bills
bills = Bill.objects.all()
print(f"💰 Total Bills: {bills.count()}")
print(f"   - Pending: {bills.filter(status='pending').count()}")
print(f"   - Paid: {bills.filter(status='paid').count()}")
print(f"   - Partial: {bills.filter(status='partial').count()}\n")

print("="*60)
print("\n🔑 SAMPLE LOGIN CREDENTIALS:\n")
print("Admin:")
print("  Email: admin@dialysis.com")
print("  Password: admin123\n")

print("Doctor:")
print("  Email: dr.smith@dialysis.com")
print("  Password: staff123\n")

print("Patient:")
if patients.exists():
    p = patients.first()
    print(f"  Email: {p.email}")
    print("  Password: patient123\n")

print("="*60)
print("✅ Database verification complete!")
print("="*60 + "\n")
