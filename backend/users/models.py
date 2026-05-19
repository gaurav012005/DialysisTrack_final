from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('nurse', 'Nurse'),
        ('technician', 'Technician'),
        ('receptionist', 'Receptionist'),
        ('patient', 'Patient'),
        ('driver', 'Driver'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='receptionist')
    department = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        # Superusers (admin accounts) can NEVER be deactivated
        if self.is_superuser:
            self.is_active = True
            self.is_staff = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} - {self.role}"