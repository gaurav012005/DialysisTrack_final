"""
Simple Patient Login Test
"""
from django.test import TestCase
from django.contrib.auth import authenticate
from patients.models import Patient
from users.models import User
from datetime import date

class PatientLoginTest(TestCase):
    
    def test_patient_account_creation(self):
        """Test patient account creation and login"""
        
        # Create patient
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
            primary_diagnosis='Test'
        )
        
        # Create user account
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
        
        # Assertions
        self.assertIsNotNone(patient)
        self.assertIsNotNone(patient.user)
        self.assertEqual(patient.user.role, 'patient')
        self.assertIsNotNone(auth_user)
        self.assertEqual(auth_user.email, patient.email)
        
        print(f"\nPASS: Patient {patient.first_name} can login with {patient.email} / patient123")
