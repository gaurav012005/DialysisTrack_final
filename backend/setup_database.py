#!/usr/bin/env python
"""
Complete Database Setup Script for DialysisTrack
This script initializes the database with all necessary data:
- User roles (admin, doctors, nurses, technicians, receptionists)
- Sample patients with login credentials
- Dialysis machines
- Appointments and queue entries
- Sample billing data
"""

import os
import sys
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
from dialysis_queue.models import Queue
from appointments.models import Appointment
from staff.models import StaffSchedule
from billing.models import Bill, Payment

class DatabaseSetup:
    def __init__(self):
        self.created_items = {
            'users': [],
            'patients': [],
            'machines': [],
            'appointments': [],
            'queue_entries': [],
            'billing_accounts': []
        }
    
    def print_header(self, text):
        """Print formatted header"""
        print("\n" + "="*60)
        print(f"  {text}")
        print("="*60)
    
    def create_admin_user(self):
        """Create admin/superuser"""
        self.print_header("Creating Admin User")
        
        if User.objects.filter(email='admin@dialysis.com').exists():
            print("✓ Admin user already exists")
            return
        
        try:
            admin = User.objects.create_superuser(
                email='admin@dialysis.com',
                username='admin',
                password='admin123',
                first_name='System',
                last_name='Administrator',
                role='admin',
                phone_number='555-0000',
                is_staff=True,
                is_superuser=True
            )
            self.created_items['users'].append(admin)
            print(f"✓ Created admin: {admin.email}")
            print(f"  Password: admin123")
        except Exception as e:
            print(f"✗ Error creating admin: {e}")
    
    def create_staff_users(self):
        """Create staff members for different roles"""
        self.print_header("Creating Staff Users")
        
        staff_data = [
            # Doctors
            {'email': 'dr.smith@dialysis.com', 'username': 'drsmith', 'first_name': 'John', 
             'last_name': 'Smith', 'role': 'doctor', 'phone': '555-1001', 'specialization': 'Nephrology'},
            {'email': 'dr.johnson@dialysis.com', 'username': 'drjohnson', 'first_name': 'Sarah', 
             'last_name': 'Johnson', 'role': 'doctor', 'phone': '555-1002', 'specialization': 'Nephrology'},
            
            # Nurses
            {'email': 'nurse.wilson@dialysis.com', 'username': 'nwilson', 'first_name': 'Emily', 
             'last_name': 'Wilson', 'role': 'nurse', 'phone': '555-2001', 'specialization': 'Dialysis Care'},
            {'email': 'nurse.brown@dialysis.com', 'username': 'nbrown', 'first_name': 'Michael', 
             'last_name': 'Brown', 'role': 'nurse', 'phone': '555-2002', 'specialization': 'Dialysis Care'},
            
            # Technicians
            {'email': 'tech.davis@dialysis.com', 'username': 'tdavis', 'first_name': 'Robert', 
             'last_name': 'Davis', 'role': 'technician', 'phone': '555-3001', 'specialization': 'Dialysis Equipment'},
            {'email': 'tech.garcia@dialysis.com', 'username': 'tgarcia', 'first_name': 'Maria', 
             'last_name': 'Garcia', 'role': 'technician', 'phone': '555-3002', 'specialization': 'Maintenance'},
            
            # Receptionists
            {'email': 'reception@dialysis.com', 'username': 'reception', 'first_name': 'Lisa', 
             'last_name': 'Anderson', 'role': 'receptionist', 'phone': '555-4001', 'specialization': 'Front Desk'},
        ]
        
        for data in staff_data:
            if User.objects.filter(email=data['email']).exists():
                print(f"✓ {data['role'].title()}: {data['email']} already exists")
                continue
            
            try:
                user = User.objects.create_user(
                    email=data['email'],
                    username=data['username'],
                    password='staff123',  # Default password for all staff
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    role=data['role'],
                    phone_number=data['phone'],
                    is_staff=True
                )
                self.created_items['users'].append(user)
                print(f"✓ Created {data['role']}: {user.email} (password: staff123)")
            except Exception as e:
                print(f"✗ Error creating {data['email']}: {e}")
    
    def create_patients(self):
        """Create sample patients with user accounts"""
        self.print_header("Creating Patients")
        
        patients_data = [
            {'patient_id': 'P001', 'first_name': 'James', 'last_name': 'Miller', 'dob': '1975-03-15', 
             'gender': 'male', 'phone': '555-5001', 'email': 'james.miller@email.com', 
             'diagnosis': 'Chronic Kidney Disease Stage 5', 'blood_type': 'A+'},
            
            {'patient_id': 'P002', 'first_name': 'Patricia', 'last_name': 'Martinez', 'dob': '1968-07-22', 
             'gender': 'female', 'phone': '555-5002', 'email': 'patricia.martinez@email.com',
             'diagnosis': 'End-Stage Renal Disease', 'blood_type': 'O+', 'is_emergency': True},
            
            {'patient_id': 'P003', 'first_name': 'Robert', 'last_name': 'Taylor', 'dob': '1952-11-08', 
             'gender': 'male', 'phone': '555-5003', 'email': 'robert.taylor@email.com',
             'diagnosis': 'Diabetic Nephropathy', 'blood_type': 'B+'},
            
            {'patient_id': 'P004', 'first_name': 'Linda', 'last_name': 'Thomas', 'dob': '1980-05-30', 
             'gender': 'female', 'phone': '555-5004', 'email': 'linda.thomas@email.com',
             'diagnosis': 'Chronic Kidney Disease Stage 4', 'blood_type': 'AB+'},
            
            {'patient_id': 'P005', 'first_name': 'William', 'last_name': 'Moore', 'dob': '1963-09-12', 
             'gender': 'male', 'phone': '555-5005', 'email': 'william.moore@email.com',
             'diagnosis': 'Polycystic Kidney Disease', 'blood_type': 'A-'},
            
            {'patient_id': 'P006', 'first_name': 'Jennifer', 'last_name': 'White', 'dob': '1971-01-25', 
             'gender': 'female', 'phone': '555-5006', 'email': 'jennifer.white@email.com',
             'diagnosis': 'Hypertensive Nephropathy', 'blood_type': 'O-'},
        ]
        
        for data in patients_data:
            # Create user account for patient
            if not User.objects.filter(email=data['email']).exists():
                try:
                    user = User.objects.create_user(
                        email=data['email'],
                        username=data['patient_id'].lower(),
                        password='patient123',  # Default password
                        first_name=data['first_name'],
                        last_name=data['last_name'],
                        role='patient',
                        phone_number=data['phone']
                    )
                    self.created_items['users'].append(user)
                except Exception as e:
                    print(f"✗ Error creating user for {data['email']}: {e}")
                    user = None
            else:
                user = User.objects.get(email=data['email'])
            
            # Create patient record
            if Patient.objects.filter(patient_id=data['patient_id']).exists():
                print(f"✓ Patient {data['patient_id']} already exists")
                continue
            
            try:
                patient = Patient.objects.create(
                    patient_id=data['patient_id'],
                    user=user,
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    date_of_birth=data['dob'],
                    gender=data['gender'],
                    phone_number=data['phone'],
                    email=data['email'],
                    address=f"123 {data['last_name']} Street, Medical City, MC 12345",
                    emergency_contact_name=f"{data['first_name']} Family",
                    emergency_contact_phone='555-9999',
                    primary_diagnosis=data['diagnosis'],
                    blood_type=data.get('blood_type', 'O+'),
                    allergies='None',
                    is_emergency=data.get('is_emergency', False)
                )
                self.created_items['patients'].append(patient)
                print(f"✓ Created patient: {patient.patient_id} - {patient.first_name} {patient.last_name}")
                print(f"  Login: {data['email']} / password: patient123")
            except Exception as e:
                print(f"✗ Error creating patient {data['patient_id']}: {e}")
    
    def create_machines(self):
        """Create dialysis machines"""
        self.print_header("Creating Dialysis Machines")
        
        machines_data = [
            {'machine_id': 'DM001', 'name': 'Dialysis Unit 1', 'manufacturer': 'Fresenius', 
             'model': '4008S', 'status': 'available'},
            {'machine_id': 'DM002', 'name': 'Dialysis Unit 2', 'manufacturer': 'Fresenius', 
             'model': '4008S', 'status': 'available'},
            {'machine_id': 'DM003', 'name': 'Dialysis Unit 3', 'manufacturer': 'Gambro', 
             'model': 'AK 200', 'status': 'in_use'},
            {'machine_id': 'DM004', 'name': 'Dialysis Unit 4', 'manufacturer': 'Baxter', 
             'model': '2008T', 'status': 'available'},
            {'machine_id': 'DM005', 'name': 'Dialysis Unit 5', 'manufacturer': 'Fresenius', 
             'model': '5008', 'status': 'maintenance'},
            {'machine_id': 'DM006', 'name': 'Emergency Dialysis Unit', 'manufacturer': 'Fresenius', 
             'model': '4008S', 'status': 'available'},
        ]
        
        for data in machines_data:
            if DialysisMachine.objects.filter(machine_id=data['machine_id']).exists():
                print(f"✓ Machine {data['machine_id']} already exists")
                continue
            
            try:
                machine = DialysisMachine.objects.create(
                    machine_id=data['machine_id'],
                    name=data['name'],
                    manufacturer=data['manufacturer'],
                    model=data['model'],
                    serial_number=f"SN-{data['machine_id']}-{random.randint(1000, 9999)}",
                    purchase_date=date(2020, 1, 1) + timedelta(days=random.randint(0, 1000)),
                    last_maintenance_date=date.today() - timedelta(days=random.randint(1, 30)),
                    next_maintenance_date=date.today() + timedelta(days=random.randint(30, 90)),
                    status=data['status']
                )
                self.created_items['machines'].append(machine)
                print(f"✓ Created machine: {machine.machine_id} - {machine.name} ({machine.status})")
            except Exception as e:
                print(f"✗ Error creating machine {data['machine_id']}: {e}")
    
    def create_appointments(self):
        """Create sample appointments"""
        self.print_header("Creating Appointments")
        
        patients = Patient.objects.all()[:4]
        if not patients:
            print("✗ No patients available to create appointments")
            return
        
        today = date.today()
        shifts = ['morning', 'evening']
        times = ['08:00', '14:00']
        
        for i, patient in enumerate(patients):
            appointment_date = today + timedelta(days=i % 7)
            shift = shifts[i % 2]
            scheduled_time = times[i % 2]
            
            if Appointment.objects.filter(patient=patient, appointment_date=appointment_date).exists():
                continue
            
            try:
                appointment = Appointment.objects.create(
                    patient=patient,
                    appointment_date=appointment_date,
                    shift=shift,
                    scheduled_time=scheduled_time,
                    status='scheduled',
                    notes=f"Regular dialysis session for {patient.first_name}"
                )
                self.created_items['appointments'].append(appointment)
                print(f"✓ Created appointment: {patient.patient_id} on {appointment_date} ({shift})")
            except Exception as e:
                print(f"✗ Error creating appointment for {patient.patient_id}: {e}")
    
    def create_queue_entries(self):
        """Create current queue entries"""
        self.print_header("Creating Queue Entries")
        
        patients = Patient.objects.all()[:3]
        if not patients:
            print("✗ No patients available to create queue entries")
            return
        
        priorities = ['scheduled', 'emergency', 'scheduled']
        statuses = ['waiting', 'in_progress', 'waiting']
        
        for i, patient in enumerate(patients):
            if Queue.objects.filter(patient=patient, status__in=['waiting', 'in_progress']).exists():
                print(f"✓ Queue entry for {patient.patient_id} already exists")
                continue
            
            try:
                queue = Queue.objects.create(
                    patient=patient,
                    queue_number=f"Q{str(Queue.objects.count() + 1).zfill(3)}",
                    priority=priorities[i],
                    status=statuses[i],
                    estimated_wait_time=random.randint(0, 30) if statuses[i] == 'waiting' else 0
                )
                
                if statuses[i] == 'in_progress':
                    machines = DialysisMachine.objects.filter(status='available').first()
                    if machines:
                        queue.assigned_machine = machines.machine_id
                        queue.save()
                
                self.created_items['queue_entries'].append(queue)
                print(f"✓ Created queue entry: {queue.queue_number} for {patient.patient_id} ({queue.priority})")
            except Exception as e:
                print(f"✗ Error creating queue entry for {patient.patient_id}: {e}")
    
    def create_bills(self):
        """Create sample bills for patients"""
        self.print_header("Creating Sample Bills")
        
        patients = Patient.objects.all()[:3]  # Create bills for first 3 patients
        
        for i, patient in enumerate(patients):
            # Create a bill for recent dialysis session
            try:
                bill = Bill.objects.create(
                    patient=patient,
                    dialysis_sessions=random.randint(1, 3),
                    session_cost=Decimal('2500.00'),
                    medicine_cost=Decimal(str(random.choice([0, 500, 750, 1000]))),
                    consultation_cost=Decimal('500.00'),
                    other_charges=Decimal(str(random.choice([0, 200, 350]))),
                    discount=Decimal(str(random.choice([0, 500, 1000]))),
                    due_date=date.today() + timedelta(days=7),
                    status=random.choice(['pending', 'pending', 'paid'])
                )
                self.created_items['billing_accounts'].append(bill)
                print(f"✓ Created bill: {bill.bill_number} for {patient.patient_id} (₹{bill.total_amount})")
                
                # Create payment if bill is paid
                if bill.status == 'paid':
                    payment = Payment.objects.create(
                        bill=bill,
                        amount=bill.total_amount,
                        payment_method=random.choice(['cash', 'upi']),
                        status='completed'
                    )
                    bill.paid_amount = bill.total_amount
                    bill.save()
                    print(f"  ✓ Payment recorded: {payment.payment_id}")
                    
            except Exception as e:
                print(f"✗ Error creating bill for {patient.patient_id}: {e}")
    
    def print_summary(self):
        """Print summary of created items"""
        self.print_header("Setup Summary")
        
        print(f"\n📊 Database Setup Completed Successfully!\n")
        print(f"✓ Users created: {len(self.created_items['users'])}")
        print(f"✓ Patients created: {len(self.created_items['patients'])}")
        print(f"✓ Machines created: {len(self.created_items['machines'])}")
        print(f"✓ Appointments created: {len(self.created_items['appointments'])}")
        print(f"✓ Queue entries created: {len(self.created_items['queue_entries'])}")
        print(f"✓ Billing accounts created: {len(self.created_items['billing_accounts'])}")
        
        print(f"\n" + "="*60)
        print(f"🔑 LOGIN CREDENTIALS")
        print(f"="*60)
        print(f"\nAdmin Account:")
        print(f"  📧 Email: admin@dialysis.com")
        print(f"  🔒 Password: admin123\n")
        
        print(f"Staff Accounts (Doctors, Nurses, Technicians, Receptionists):")
        print(f"  🔒 Default Password: staff123")
        print(f"  📧 Emails:")
        print(f"     - dr.smith@dialysis.com (Doctor)")
        print(f"     - nurse.wilson@dialysis.com (Nurse)")
        print(f"     - tech.davis@dialysis.com (Technician)")
        print(f"     - reception@dialysis.com (Receptionist)\n")
        
        print(f"Patient Accounts:")
        print(f"  🔒 Default Password: patient123")
        print(f"  📧 Example: james.miller@email.com (Patient P001)")
        
        print(f"\n" + "="*60)
        print(f"✅ Your DialysisTrack database is ready to use!")
        print(f"="*60 + "\n")

def main():
    """Main setup function"""
    print("\n" + "🏥"*30)
    print("   DIALYSISTRACK DATABASE SETUP")
    print("🏥"*30)
    
    setup = DatabaseSetup()
    
    try:
        setup.create_admin_user()
        setup.create_staff_users()
        setup.create_patients()
        setup.create_machines()
        setup.create_appointments()
        setup.create_queue_entries()
        setup.create_bills()
        setup.print_summary()
        
    except Exception as e:
        print(f"\n❌ Fatal error during setup: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
