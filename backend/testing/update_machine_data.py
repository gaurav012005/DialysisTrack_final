#!/usr/bin/env python
import os
import sys
import django
from datetime import date, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from machines.models import DialysisMachine

def update_machine_data():
    """Update machine data with proper field values"""
    
    machines = DialysisMachine.objects.all()
    
    for i, machine in enumerate(machines, 1):
        machine.machine_type = 'hemodialysis'
        machine.manufacturer = 'Fresenius'
        machine.model = f'4008S-{i}'
        machine.purchase_date = date(2023, 1, 1)
        machine.last_maintenance_date = date.today() - timedelta(days=30)
        machine.next_maintenance_date = date.today() + timedelta(days=60)
        machine.total_sessions = 150 + (i * 25)
        machine.total_operating_hours = 1200 + (i * 200)
        machine.save()
        
        print(f"Updated {machine.name}")
    
    print(f"\nUpdated {machines.count()} machines with proper data")

if __name__ == '__main__':
    update_machine_data()