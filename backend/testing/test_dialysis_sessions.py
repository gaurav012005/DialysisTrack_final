"""
Test script for Dialysis Session functionality
Run this after migrations to verify everything works
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from dialysis_queue.models import Queue, DialysisSession
from patients.models import Patient
from users.models import User

def test_session_creation():
    print("Testing Dialysis Session Creation...")
    
    # Get first patient and queue entry
    patient = Patient.objects.first()
    queue = Queue.objects.filter(patient=patient).first()
    
    if not patient or not queue:
        print("❌ No patient or queue found. Create test data first.")
        return
    
    # Get staff members
    doctor = User.objects.filter(role='doctor').first()
    nurse = User.objects.filter(role='nurse').first()
    
    # Create session
    session = DialysisSession.objects.create(
        queue=queue,
        patient=patient,
        pre_bp_systolic=120,
        pre_bp_diastolic=80,
        pre_heart_rate=72,
        pre_temperature=36.5,
        pre_oxygen_saturation=98,
        blood_flow_rate=300,
        dialysate_flow_rate=500,
        heparin_dose=5000,
        medications="Heparin 5000 units, EPO 4000 units",
        nurse_notes="Patient stable, no complaints",
        attending_doctor=doctor,
        attending_nurse=nurse,
        created_by=nurse
    )
    
    print(f"✅ Session created: {session}")
    print(f"   Patient: {session.patient}")
    print(f"   Pre BP: {session.pre_bp_systolic}/{session.pre_bp_diastolic}")
    print(f"   Doctor: {session.attending_doctor}")
    print(f"   Nurse: {session.attending_nurse}")
    
    # Test session history
    history = DialysisSession.objects.filter(patient=patient)
    print(f"\n✅ Patient has {history.count()} session(s) in history")
    
    return session

def test_session_completion(session):
    print("\nTesting Session Completion...")
    
    # Update with post-dialysis data
    session.post_bp_systolic = 115
    session.post_bp_diastolic = 75
    session.post_heart_rate = 68
    session.post_temperature = 36.8
    session.post_oxygen_saturation = 99
    session.ultrafiltration_volume = 2.5
    session.doctor_notes = "Session completed successfully"
    session.save()
    
    print(f"✅ Session completed")
    print(f"   Post BP: {session.post_bp_systolic}/{session.post_bp_diastolic}")
    print(f"   UF Volume: {session.ultrafiltration_volume}L")

if __name__ == '__main__':
    print("=" * 50)
    print("DIALYSIS SESSION SYSTEM TEST")
    print("=" * 50)
    
    session = test_session_creation()
    if session:
        test_session_completion(session)
    
    print("\n" + "=" * 50)
    print("✅ All tests completed!")
    print("=" * 50)
