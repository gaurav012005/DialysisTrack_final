#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from machines.models import DialysisMachine

def fix_machine_data():
    machines = DialysisMachine.objects.all()
    for machine in machines:
        if not machine.machine_type:
            machine.machine_type = 'hemodialysis'
        if not machine.last_maintenance_date:
            from datetime import date, timedelta
            machine.last_maintenance_date = date.today() - timedelta(days=30)
            machine.next_maintenance_date = date.today() + timedelta(days=60)
        machine.save()
        print(f"Fixed {machine.name}")

if __name__ == '__main__':
    fix_machine_data()