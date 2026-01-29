"""
Create Sample Appointments for Testing

This script creates sample appointments for existing patients.
Run from the backend directory:
    python create_sample_appointments.py
"""

import os
import django
from datetime import date, time, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from appointments.models import Appointment
from patients.models import Patient
from users.models import User

def create_sample_appointments():
    print("Creating sample appointments...\n")
    
    # Get all patients
    patients = Patient.objects.all()
    
    if not patients.exists():
        print("❌ No patients found! Please create patients first.")
        print("You can create patients in Django Admin: http://localhost:8000/admin")
        return
    
    print(f"Found {patients.count()} patients\n")
    
    # Sample appointment data
    appointments_data = [
        # Upcoming appointments
        {
            'days_from_now': 1,
            'shift': 'morning',
            'time': time(8, 0),
            'status': 'scheduled',
            'machine': 'M-001',
            'notes': 'Regular dialysis session'
        },
        {
            'days_from_now': 3,
            'shift': 'evening',
            'time': time(14, 0),
            'status': 'scheduled',
            'machine': 'M-002',
            'notes': 'Follow-up session'
        },
        {
            'days_from_now': 5,
            'shift': 'morning',
            'time': time(9, 30),
            'status': 'scheduled',
            'machine': 'M-003',
            'notes': ''
        },
        # Past appointments
        {
            'days_from_now': -2,
            'shift': 'morning',
            'time': time(8, 0),
            'status': 'completed',
            'machine': 'M-001',
            'notes': 'Session completed successfully',
            'actual_start': time(8, 5),
            'actual_end': time(11, 30)
        },
        {
            'days_from_now': -5,
            'shift': 'evening',
            'time': time(15, 0),
            'status': 'completed',
            'machine': 'M-002',
            'notes': 'Regular session',
            'actual_start': time(15, 10),
            'actual_end': time(18, 45)
        },
    ]
    
    created_count = 0
    
    # Create appointments for each patient
    for patient in patients[:3]:  # Create for first 3 patients
        print(f"Creating appointments for: {patient.first_name} {patient.last_name}")
        
        for apt_data in appointments_data:
            appointment_date = date.today() + timedelta(days=apt_data['days_from_now'])
            
            # Check if appointment already exists
            existing = Appointment.objects.filter(
                patient=patient,
                appointment_date=appointment_date,
                shift=apt_data['shift']
            ).exists()
            
            if existing:
                print(f"  ⏭️  Skipped: {appointment_date} {apt_data['shift']} (already exists)")
                continue
            
            # Create appointment
            appointment = Appointment.objects.create(
                patient=patient,
                appointment_date=appointment_date,
                shift=apt_data['shift'],
                scheduled_time=apt_data['time'],
                status=apt_data['status'],
                machine_number=apt_data['machine'],
                notes=apt_data['notes'],
                actual_start_time=apt_data.get('actual_start'),
                actual_end_time=apt_data.get('actual_end')
            )
            
            created_count += 1
            status_emoji = '✅' if apt_data['status'] == 'completed' else '📅'
            print(f"  {status_emoji} Created: {appointment_date} {apt_data['shift']} - {apt_data['status']}")
        
        print()
    
    print(f"\n✅ Successfully created {created_count} appointments!")
    print(f"\n📊 Summary:")
    print(f"  Total appointments in database: {Appointment.objects.count()}")
    print(f"  Scheduled: {Appointment.objects.filter(status='scheduled').count()}")
    print(f"  Completed: {Appointment.objects.filter(status='completed').count()}")
    print(f"\n🎉 You can now view these appointments in the Patient Appointments page!")
    print(f"   Login as a patient and navigate to 'My Appointments'")

if __name__ == '__main__':
    create_sample_appointments()
