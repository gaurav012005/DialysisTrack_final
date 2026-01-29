import os
import django
from datetime import date, datetime, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from patients.models import Patient
from machines.models import DialysisMachine
from dialysis_queue.models import Queue
from appointments.models import Appointment
from staff.models import StaffSchedule

def create_sample_data():
    print("Creating sample data...")
    
    # Create sample patients
    patients_data = [
        {'patient_id': 'P001', 'first_name': 'John', 'last_name': 'Smith', 'date_of_birth': '1975-03-15', 'gender': 'male', 'phone_number': '555-0101'},
        {'patient_id': 'P002', 'first_name': 'Maria', 'last_name': 'Garcia', 'date_of_birth': '1968-07-22', 'gender': 'female', 'phone_number': '555-0102', 'is_emergency': True},
        {'patient_id': 'P003', 'first_name': 'Robert', 'last_name': 'Johnson', 'date_of_birth': '1952-11-08', 'gender': 'male', 'phone_number': '555-0103'},
        {'patient_id': 'P004', 'first_name': 'Sarah', 'last_name': 'Wilson', 'date_of_birth': '1980-05-30', 'gender': 'female', 'phone_number': '555-0104'},
        {'patient_id': 'P005', 'first_name': 'Michael', 'last_name': 'Brown', 'date_of_birth': '1963-09-12', 'gender': 'male', 'phone_number': '555-0105'},
    ]
    
    for data in patients_data:
        patient, created = Patient.objects.get_or_create(
            patient_id=data['patient_id'],
            defaults={
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'date_of_birth': data['date_of_birth'],
                'gender': data['gender'],
                'phone_number': data['phone_number'],
                'address': f"123 Main St, City, State",
                'emergency_contact_name': f"{data['first_name']} Emergency Contact",
                'emergency_contact_phone': '555-9999',
                'primary_diagnosis': 'Chronic Kidney Disease',
                'is_emergency': data.get('is_emergency', False)
            }
        )
        if created:
            print(f"Created patient: {patient.first_name} {patient.last_name}")
    
    # Create sample machines
    machines_data = [
        {'machine_id': 'M001', 'name': 'Dialysis Machine 1', 'status': 'available'},
        {'machine_id': 'M002', 'name': 'Dialysis Machine 2', 'status': 'in_use'},
        {'machine_id': 'M003', 'name': 'Dialysis Machine 3', 'status': 'available'},
        {'machine_id': 'M004', 'name': 'Dialysis Machine 4', 'status': 'maintenance'},
    ]
    
    for data in machines_data:
        machine, created = DialysisMachine.objects.get_or_create(
            machine_id=data['machine_id'],
            defaults={
                'name': data['name'],
                'manufacturer': 'Fresenius',
                'model': '4008S',
                'serial_number': f"SN{data['machine_id']}",
                'purchase_date': '2020-01-01',
                'status': data['status']
            }
        )
        if created:
            print(f"Created machine: {machine.name}")
    
    # Create sample queue entries
    patients = Patient.objects.all()[:3]
    for i, patient in enumerate(patients):
        queue, created = Queue.objects.get_or_create(
            patient=patient,
            defaults={
                'queue_number': f"Q{str(i+1).zfill(3)}",
                'priority': 'emergency' if patient.is_emergency else 'scheduled',
                'status': ['waiting', 'in_progress', 'waiting'][i],
                'assigned_machine': f"M{str(i+1).zfill(3)}" if i < 2 else '',
                'estimated_wait_time': [0, 0, 15][i]
            }
        )
        if created:
            print(f"Created queue entry: {queue.queue_number}")
    
    # Create sample appointments
    today = date.today()
    for i in range(3):
        appointment_date = today + timedelta(days=i)
        patient = patients[i] if i < len(patients) else patients[0]
        
        appointment, created = Appointment.objects.get_or_create(
            patient=patient,
            appointment_date=appointment_date,
            defaults={
                'shift': ['morning', 'evening', 'morning'][i],
                'scheduled_time': ['08:00', '14:00', '09:00'][i],
                'status': 'scheduled'
            }
        )
        if created:
            print(f"Created appointment: {appointment.patient} on {appointment.appointment_date}")
    
    print("Sample data creation completed!")

if __name__ == "__main__":
    create_sample_data()