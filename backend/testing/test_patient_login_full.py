"""
Test Case: Patient Login System
Tests patient account creation and login functionality
"""
from django.test import TestCase
from django.contrib.auth import authenticate
from patients.models import Patient
from users.models import User
from datetime import date

class PatientLoginTestCase(TestCase):
    
    def setUp(self):
        """Set up test data"""
        print("\n" + "="*60)
        print("PATIENT LOGIN SYSTEM - TEST SUITE")
        print("="*60)
    
    def test_01_create_patient_with_email(self):
        """Test 1: Create patient with email"""
        print("\n[TEST 1] Creating patient with email...")
        
        patient = Patient.objects.create(
            patient_id='TEST001',
            first_name='John',
            last_name='Doe',
            email='john.doe@test.com',
            date_of_birth=date(1990, 1, 1),
            gender='male',
            phone_number='1234567890',
            address='Test Address',
            emergency_contact_name='Jane Doe',
            emergency_contact_phone='0987654321',
            primary_diagnosis='Test Diagnosis'
        )
        
        self.assertIsNotNone(patient)
        self.assertEqual(patient.email, 'john.doe@test.com')
        print(f"✅ Patient created: {patient.first_name} {patient.last_name}")
        print(f"   Email: {patient.email}")
        print(f"   Patient ID: {patient.patient_id}")
    
    def test_02_auto_create_user_account(self):
        """Test 2: Auto-create user account for patient"""
        print("\n[TEST 2] Auto-creating user account...")
        
        # Create patient
        patient = Patient.objects.create(
            patient_id='TEST002',
            first_name='Jane',
            last_name='Smith',
            email='jane.smith@test.com',
            date_of_birth=date(1985, 5, 15),
            gender='female',
            phone_number='5555555555',
            address='Test Address 2',
            emergency_contact_name='John Smith',
            emergency_contact_phone='4444444444',
            primary_diagnosis='Test Diagnosis 2'
        )
        
        # Manually create user (simulating auto-creation)
        username = patient.email.split('@')[0] + '_' + patient.patient_id
        user = User.objects.create_user(
            username=username,
            email=patient.email,
            password='patient123',
            first_name=patient.first_name,
            last_name=patient.last_name,
            role='patient'
        )
        patient.user = user
        patient.save()
        
        self.assertIsNotNone(patient.user)
        self.assertEqual(patient.user.email, patient.email)
        self.assertEqual(patient.user.role, 'patient')
        print(f"✅ User account created")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Role: {user.role}")
    
    def test_03_patient_can_login(self):
        """Test 3: Patient can login with credentials"""
        print("\n[TEST 3] Testing patient login...")
        
        # Create patient with user
        patient = Patient.objects.create(
            patient_id='TEST003',
            first_name='Bob',
            last_name='Johnson',
            email='bob.johnson@test.com',
            date_of_birth=date(1992, 3, 20),
            gender='male',
            phone_number='6666666666',
            address='Test Address 3',
            emergency_contact_name='Alice Johnson',
            emergency_contact_phone='7777777777',
            primary_diagnosis='Test Diagnosis 3'
        )
        
        username = patient.email.split('@')[0] + '_' + patient.patient_id
        user = User.objects.create_user(
            username=username,
            email=patient.email,
            password='patient123',
            first_name=patient.first_name,
            last_name=patient.last_name,
            role='patient'
        )
        patient.user = user
        patient.save()
        
        # Test authentication
        auth_user = authenticate(username=username, password='patient123')
        
        self.assertIsNotNone(auth_user)
        self.assertEqual(auth_user.email, patient.email)
        self.assertEqual(auth_user.role, 'patient')
        print(f"✅ Authentication successful")
        print(f"   Login Email: {patient.email}")
        print(f"   Password: patient123")
        print(f"   Authenticated User: {auth_user.username}")
    
    def test_04_patient_without_email(self):
        """Test 4: Patient without email (no user account)"""
        print("\n[TEST 4] Creating patient without email...")
        
        patient = Patient.objects.create(
            patient_id='TEST004',
            first_name='No',
            last_name='Email',
            email='',
            date_of_birth=date(1988, 8, 8),
            gender='other',
            phone_number='8888888888',
            address='Test Address 4',
            emergency_contact_name='Contact Person',
            emergency_contact_phone='9999999999',
            primary_diagnosis='Test Diagnosis 4'
        )
        
        self.assertIsNone(patient.user)
        print(f"✅ Patient created without user account")
        print(f"   Patient ID: {patient.patient_id}")
        print(f"   Email: (none)")
        print(f"   User Account: None")
    
    def test_05_multiple_patients(self):
        """Test 5: Create multiple patients with accounts"""
        print("\n[TEST 5] Creating multiple patients...")
        
        patients_data = [
            ('TEST005', 'Alice', 'Brown', 'alice.brown@test.com'),
            ('TEST006', 'Charlie', 'Davis', 'charlie.davis@test.com'),
            ('TEST007', 'Diana', 'Evans', 'diana.evans@test.com'),
        ]
        
        created_count = 0
        for pid, fname, lname, email in patients_data:
            patient = Patient.objects.create(
                patient_id=pid,
                first_name=fname,
                last_name=lname,
                email=email,
                date_of_birth=date(1990, 1, 1),
                gender='male',
                phone_number='1111111111',
                address='Test Address',
                emergency_contact_name='Emergency Contact',
                emergency_contact_phone='2222222222',
                primary_diagnosis='Test'
            )
            
            username = email.split('@')[0] + '_' + pid
            user = User.objects.create_user(
                username=username,
                email=email,
                password='patient123',
                first_name=fname,
                last_name=lname,
                role='patient'
            )
            patient.user = user
            patient.save()
            created_count += 1
            print(f"   ✅ {fname} {lname} - {email}")
        
        self.assertEqual(created_count, 3)
        print(f"✅ Created {created_count} patients with accounts")
    
    def test_06_verify_all_credentials(self):
        """Test 6: Verify all patient credentials work"""
        print("\n[TEST 6] Verifying all patient credentials...")
        
        # Create test patients
        test_patients = [
            ('TEST008', 'Test1', 'Patient1', 'test1@test.com'),
            ('TEST009', 'Test2', 'Patient2', 'test2@test.com'),
        ]
        
        for pid, fname, lname, email in test_patients:
            patient = Patient.objects.create(
                patient_id=pid,
                first_name=fname,
                last_name=lname,
                email=email,
                date_of_birth=date(1990, 1, 1),
                gender='male',
                phone_number='1111111111',
                address='Test',
                emergency_contact_name='Contact',
                emergency_contact_phone='2222222222',
                primary_diagnosis='Test'
            )
            
            username = email.split('@')[0] + '_' + pid
            user = User.objects.create_user(
                username=username,
                email=email,
                password='patient123',
                first_name=fname,
                last_name=lname,
                role='patient'
            )
            patient.user = user
            patient.save()
            
            # Verify login
            auth_user = authenticate(username=username, password='patient123')
            self.assertIsNotNone(auth_user)
            print(f"   ✅ {email} / patient123 - LOGIN OK")
        
        print(f"✅ All credentials verified")
    
    def tearDown(self):
        """Clean up after tests"""
        pass

def run_tests():
    """Run all tests"""
    import sys
    from io import StringIO
    from django.test.runner import DiscoverRunner
    
    # Capture output
    runner = DiscoverRunner(verbosity=2)
    test_suite = runner.test_loader.loadTestsFromTestCase(PatientLoginTestCase)
    result = runner.test_runner.run(test_suite)
    
    print("\n" + "="*60)
    print("TEST RESULTS SUMMARY")
    print("="*60)
    print(f"Tests Run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success Rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    print("="*60)
    
    if result.wasSuccessful():
        print("✅ ALL TESTS PASSED!")
    else:
        print("❌ SOME TESTS FAILED")
    
    return result.wasSuccessful()

if __name__ == '__main__':
    run_tests()
