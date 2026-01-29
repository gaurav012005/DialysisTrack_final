from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class UserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='nurse'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.role, 'nurse')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)