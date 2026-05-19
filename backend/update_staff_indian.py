#!/usr/bin/env python
"""
Update Staff to Indian Names - DialysisTrack
Replaces all existing staff accounts with Indian names, emails & passwords.
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

# ─────────────────────────────────────────────────────────────
#  NEW INDIAN STAFF DATA
# ─────────────────────────────────────────────────────────────
INDIAN_STAFF = [
    # ── Doctors ──────────────────────────────────────────────
    {
        'old_email': 'dr.smith@dialysis.com',
        'email':     'dr.mehta@dialysis.com',
        'username':  'drmehta',
        'first_name': 'Arjun',
        'last_name':  'Mehta',
        'role':       'doctor',
        'phone':      '9876543201',
        'password':   'staff123',
    },
    {
        'old_email': 'dr.johnson@dialysis.com',
        'email':     'dr.patel@dialysis.com',
        'username':  'drpatel',
        'first_name': 'Priya',
        'last_name':  'Patel',
        'role':       'doctor',
        'phone':      '9876543202',
        'password':   'staff123',
    },

    # ── Nurses ───────────────────────────────────────────────
    {
        'old_email': 'nurse.wilson@dialysis.com',
        'email':     'nurse.rao@dialysis.com',
        'username':  'nrao',
        'first_name': 'Sunita',
        'last_name':  'Rao',
        'role':       'nurse',
        'phone':      '9876543203',
        'password':   'staff123',
    },
    {
        'old_email': 'nurse.brown@dialysis.com',
        'email':     'nurse.nair@dialysis.com',
        'username':  'nnair',
        'first_name': 'Vikram',
        'last_name':  'Nair',
        'role':       'nurse',
        'phone':      '9876543204',
        'password':   'staff123',
    },

    # ── Technicians ──────────────────────────────────────────
    {
        'old_email': 'tech.davis@dialysis.com',
        'email':     'tech.kumar@dialysis.com',
        'username':  'tkumar',
        'first_name': 'Ravi',
        'last_name':  'Kumar',
        'role':       'technician',
        'phone':      '9876543205',
        'password':   'staff123',
    },
    {
        'old_email': 'tech.garcia@dialysis.com',
        'email':     'tech.singh@dialysis.com',
        'username':  'tsingh',
        'first_name': 'Anita',
        'last_name':  'Singh',
        'role':       'technician',
        'phone':      '9876543206',
        'password':   'staff123',
    },

    # ── Receptionist ─────────────────────────────────────────
    {
        'old_email': 'reception@dialysis.com',
        'email':     'reception.joshi@dialysis.com',
        'username':  'kjoshi',
        'first_name': 'Kavita',
        'last_name':  'Joshi',
        'role':       'receptionist',
        'phone':      '9876543207',
        'password':   'staff123',
    },
]

# ─────────────────────────────────────────────────────────────
#  ADMIN UPDATE (name only – keep existing email/password)
# ─────────────────────────────────────────────────────────────
ADMIN_UPDATE = {
    'email':      'admin@dialysis.com',
    'first_name': 'Rajesh',
    'last_name':  'Sharma',
    'phone':      '9876543200',
}


def update_admin():
    print("\n" + "="*55)
    print("  Updating Admin User")
    print("="*55)
    try:
        admin = User.objects.get(email=ADMIN_UPDATE['email'])
        admin.first_name = ADMIN_UPDATE['first_name']
        admin.last_name  = ADMIN_UPDATE['last_name']
        admin.phone_number = ADMIN_UPDATE['phone']
        admin.save()
        print(f"[OK] Admin updated -> {admin.first_name} {admin.last_name}  ({admin.email})")
    except User.DoesNotExist:
        print(f"[!!] Admin ({ADMIN_UPDATE['email']}) not found - run setup_database.py first.")


def update_staff():
    print("\n" + "="*55)
    print("  Updating Staff Users")
    print("="*55)

    for data in INDIAN_STAFF:
        old_email = data['old_email']
        new_email = data['email']

        # 1. Delete the old user if it exists
        if User.objects.filter(email=old_email).exists():
            User.objects.filter(email=old_email).delete()
            print(f"  [--] Removed old user: {old_email}")

        # 2. Also remove any leftover with the new email to avoid duplicates
        User.objects.filter(email=new_email).delete()
        User.objects.filter(username=data['username']).delete()

        # 3. Create fresh user with Indian details
        try:
            user = User.objects.create_user(
                email=new_email,
                username=data['username'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                role=data['role'],
                phone_number=data['phone'],
                is_staff=True,
            )
            print(f"[OK] Created {data['role']:15s} -> {data['first_name']} {data['last_name']}")
            print(f"     Email: {new_email}  | Password: {data['password']}")
        except Exception as exc:
            print(f"[!!] Error creating {new_email}: {exc}")


def print_summary():
    print("\n" + "="*55)
    print("  [IN]  Indian Staff Credentials Summary")
    print("="*55)

    rows = [
        ("[Admin]",        "Rajesh Sharma",   "admin@dialysis.com",          "Admin@2o26"),
        ("[Doctor 1]",     "Dr. Arjun Mehta", "dr.mehta@dialysis.com",       "staff123"),
        ("[Doctor 2]",     "Dr. Priya Patel", "dr.patel@dialysis.com",       "staff123"),
        ("[Nurse 1]",      "Sunita Rao",      "nurse.rao@dialysis.com",      "staff123"),
        ("[Nurse 2]",      "Vikram Nair",     "nurse.nair@dialysis.com",     "staff123"),
        ("[Technician 1]", "Ravi Kumar",      "tech.kumar@dialysis.com",     "staff123"),
        ("[Technician 2]", "Anita Singh",     "tech.singh@dialysis.com",     "staff123"),
        ("[Receptionist]", "Kavita Joshi",    "reception.joshi@dialysis.com","staff123"),
    ]

    print(f"\n{'Role':<18} {'Name':<20} {'Email':<35} {'Password'}")
    print("-"*93)
    for role, name, email, pwd in rows:
        print(f"{role:<18} {name:<20} {email:<35} {pwd}")

    print("\n[DONE] All staff accounts updated with Indian names!")
    print("Login at: http://localhost:5173\n")


if __name__ == '__main__':
    update_admin()
    update_staff()
    print_summary()
