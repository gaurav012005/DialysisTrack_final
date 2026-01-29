from django.db import models
from patients.models import Patient

class Appointment(models.Model):
    SHIFT_CHOICES = (
        ('morning', 'Morning (6AM-12PM)'),
        ('evening', 'Evening (12PM-6PM)'),
        ('night', 'Night (6PM-12AM)'),
    )
    
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('checked_in', 'Checked In'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    )
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    shift = models.CharField(max_length=10, choices=SHIFT_CHOICES)
    scheduled_time = models.TimeField()
    actual_start_time = models.TimeField(null=True, blank=True)
    actual_end_time = models.TimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    
    # Machine assignment (will be linked later)
    machine_number = models.CharField(max_length=20, blank=True)
    
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.patient} - {self.appointment_date} {self.shift}"
    
    class Meta:
        ordering = ['appointment_date', 'scheduled_time']