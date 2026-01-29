"""
Simple export functions that work without external dependencies
"""
from django.http import HttpResponse
from django.utils import timezone
import csv
import json

def export_patients_csv():
    """Export patients to CSV without external dependencies"""
    from patients.models import Patient
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="patients_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Patient ID', 'First Name', 'Last Name', 'Gender', 'Date of Birth', 
        'Phone', 'Email', 'Blood Type', 'Emergency', 'Status', 'Created'
    ])
    
    patients = Patient.objects.all().order_by('patient_id')
    for patient in patients:
        writer.writerow([
            patient.patient_id,
            patient.first_name,
            patient.last_name,
            patient.gender,
            patient.date_of_birth.strftime('%Y-%m-%d'),
            patient.phone_number,
            patient.email or 'N/A',
            patient.blood_type or 'N/A',
            'Yes' if patient.is_emergency else 'No',
            'Active' if patient.is_active else 'Inactive',
            patient.created_at.strftime('%Y-%m-%d %H:%M')
        ])
    
    return response

def export_queue_csv():
    """Export today's queue to CSV"""
    from dialysis_queue.models import Queue
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="queue_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Queue Number', 'Patient Name', 'Priority', 'Status', 
        'Check-in Time', 'Wait Time (min)', 'Machine', 'Staff'
    ])
    
    today = timezone.now().date()
    queues = Queue.objects.filter(check_in_time__date=today).order_by('queue_number')
    
    for queue in queues:
        writer.writerow([
            queue.queue_number,
            f"{queue.patient.first_name} {queue.patient.last_name}",
            queue.priority.title(),
            queue.status.replace('_', ' ').title(),
            queue.check_in_time.strftime('%Y-%m-%d %H:%M'),
            queue.estimated_wait_time,
            queue.assigned_machine or 'Not Assigned',
            queue.assigned_staff.get_full_name() if queue.assigned_staff else 'Not Assigned'
        ])
    
    return response

def export_machines_csv():
    """Export machines to CSV"""
    from machines.models import DialysisMachine
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="machines_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Machine ID', 'Name', 'Type', 'Status', 'Manufacturer', 
        'Total Sessions', 'Operating Hours', 'Last Maintenance', 'Active'
    ])
    
    machines = DialysisMachine.objects.all().order_by('machine_id')
    for machine in machines:
        writer.writerow([
            machine.machine_id,
            machine.name,
            machine.machine_type.title(),
            machine.status.replace('_', ' ').title(),
            machine.manufacturer,
            machine.total_sessions,
            float(machine.total_operating_hours),
            machine.last_maintenance_date.strftime('%Y-%m-%d') if machine.last_maintenance_date else 'Never',
            'Yes' if machine.is_active else 'No'
        ])
    
    return response

def export_dashboard_json():
    """Export dashboard statistics as JSON"""
    from patients.models import Patient
    from dialysis_queue.models import Queue
    from machines.models import DialysisMachine
    
    today = timezone.now().date()
    
    stats = {
        'generated_at': timezone.now().isoformat(),
        'date': today.isoformat(),
        'patients': {
            'total': Patient.objects.filter(is_active=True).count(),
            'emergency': Patient.objects.filter(is_emergency=True, is_active=True).count(),
            'active_today': Queue.objects.filter(check_in_time__date=today).count()
        },
        'queue': {
            'waiting': Queue.objects.filter(check_in_time__date=today, status='waiting').count(),
            'in_progress': Queue.objects.filter(check_in_time__date=today, status='in_progress').count(),
            'completed': Queue.objects.filter(check_in_time__date=today, status='completed').count()
        },
        'machines': {
            'total': DialysisMachine.objects.filter(is_active=True).count(),
            'available': DialysisMachine.objects.filter(is_active=True, status='available').count(),
            'in_use': DialysisMachine.objects.filter(is_active=True, status='in_use').count()
        }
    }
    
    response = HttpResponse(
        json.dumps(stats, indent=2),
        content_type='application/json'
    )
    response['Content-Disposition'] = 'attachment; filename="dashboard_stats.json"'
    
    return response