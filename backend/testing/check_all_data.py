#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from patients.models import Patient
from machines.models import DialysisMachine
from dialysis_queue.models import Queue
from users.models import User

def check_all_data():
    """Check data in all main models"""
    
    print("=== DATABASE STATUS ===\n")
    
    # Check Users
    users = User.objects.all()
    print(f"USERS ({users.count()}):")
    for user in users[:5]:
        print(f"  - {user.username} ({user.email}) - Role: {user.role}")
    
    # Check Patients  
    patients = Patient.objects.all()
    print(f"\nPATIENTS ({patients.count()}):")
    for patient in patients[:5]:
        print(f"  - {patient.first_name} {patient.last_name} (ID: {patient.patient_id})")
    
    # Check Machines
    machines = DialysisMachine.objects.all()
    print(f"\nMACHINES ({machines.count()}):")
    for machine in machines:
        print(f"  - {machine.name} ({machine.status}) - Type: {machine.machine_type}")
        print(f"    Last Maintenance: {machine.last_maintenance_date}")
        print(f"    Next Maintenance: {machine.next_maintenance_date}")
    
    # Check Queue
    queue = Queue.objects.all()
    print(f"\nQUEUE ({queue.count()}):")
    for q in queue[:5]:
        print(f"  - {q.patient.first_name} {q.patient.last_name} - Status: {q.status}")
    
    print(f"\n=== SUMMARY ===")
    print(f"Users: {users.count()}")
    print(f"Patients: {patients.count()}")
    print(f"Machines: {machines.count()}")
    print(f"Queue Entries: {queue.count()}")

if __name__ == '__main__':
    check_all_data()