from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class StaffSchedule(models.Model):
    SHIFT_CHOICES = (
        ('morning', 'Morning (6:00 AM - 2:00 PM)'),
        ('evening', 'Evening (2:00 PM - 10:00 PM)'),
        ('night', 'Night (10:00 PM - 6:00 AM)'),
    )
    
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='schedules')
    shift_date = models.DateField()
    shift_type = models.CharField(max_length=20, choices=SHIFT_CHOICES)
    
    # Shift details
    start_time = models.TimeField()
    end_time = models.TimeField()
    break_duration = models.IntegerField(default=30, help_text="Break duration in minutes")
    
    # Assignment
    assigned_zone = models.CharField(max_length=100, blank=True)
    assigned_machines = models.TextField(blank=True, help_text="Comma-separated machine IDs")
    
    # Status
    is_present = models.BooleanField(default=False)
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.staff.get_full_name()} - {self.shift_date} {self.shift_type}"
    
    class Meta:
        ordering = ['shift_date', 'start_time']
        unique_together = ['staff', 'shift_date']

class StaffAttendance(models.Model):
    ATTENDANCE_STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('half_day', 'Half Day'),
        ('leave', 'Leave'),
    )
    
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS_CHOICES, default='present')
    
    # Time tracking
    scheduled_start = models.TimeField()
    scheduled_end = models.TimeField()
    actual_start = models.TimeField(null=True, blank=True)
    actual_end = models.TimeField(null=True, blank=True)
    
    # Work details
    patients_handled = models.IntegerField(default=0)
    overtime_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.staff.get_full_name()} - {self.date} ({self.status})"
    
    class Meta:
        ordering = ['-date']
        unique_together = ['staff', 'date']

class LeaveRequest(models.Model):
    LEAVE_TYPE_CHOICES = (
        ('sick', 'Sick Leave'),
        ('vacation', 'Vacation Leave'),
        ('emergency', 'Emergency Leave'),
        ('personal', 'Personal Leave'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    )
    
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    total_days = models.IntegerField()
    
    reason = models.TextField()
    emergency_contact = models.CharField(max_length=100, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    approved_date = models.DateTimeField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.staff.get_full_name()} - {self.leave_type} ({self.start_date} to {self.end_date})"
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        # Calculate total days
        if self.start_date and self.end_date:
            self.total_days = (self.end_date - self.start_date).days + 1
        super().save(*args, **kwargs)