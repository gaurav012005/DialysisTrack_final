from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Queue(models.Model):
    PRIORITY_CHOICES = (
        ('emergency', 'Emergency'),
        ('scheduled', 'Scheduled'),
        ('walk_in', 'Walk-in'),
    )
    
    STATUS_CHOICES = (
        ('waiting', '🟡 Waiting'),
        ('in_progress', '🟢 In Progress'),
        ('completed', '✅ Completed'),
        ('cancelled', '❌ Cancelled'),
    )
    
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='queue_entries')
    appointment = models.ForeignKey('appointments.Appointment', on_delete=models.CASCADE, null=True, blank=True)
    
    # Queue information
    queue_number = models.CharField(max_length=10, unique=True, blank=True, null=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='scheduled')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    
    # Timing information
    check_in_time = models.DateTimeField(auto_now_add=True)
    estimated_wait_time = models.IntegerField(default=0, help_text="Estimated wait time in minutes")
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    
    # Assignment
    assigned_machine = models.CharField(max_length=50, blank=True)
    assigned_staff = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Medical notes for this session
    blood_pressure = models.CharField(max_length=20, blank=True)
    weight_before = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight_after = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Queue {self.queue_number} - {self.patient} ({self.status})"
    
    class Meta:
        ordering = ['-priority', 'check_in_time']
    

    
    @property
    def total_session_time(self):
        if self.actual_start_time and self.actual_end_time:
            duration = self.actual_end_time - self.actual_start_time
            return duration.total_seconds() / 60  # Convert to minutes
        return None

class DialysisSession(models.Model):
    """Comprehensive dialysis session details"""
    queue = models.OneToOneField(Queue, on_delete=models.CASCADE, related_name='session_details')
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='dialysis_sessions')
    
    # Vital Signs - Pre Dialysis
    pre_bp_systolic = models.IntegerField(null=True, blank=True)
    pre_bp_diastolic = models.IntegerField(null=True, blank=True)
    pre_heart_rate = models.IntegerField(null=True, blank=True)
    pre_temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    pre_oxygen_saturation = models.IntegerField(null=True, blank=True)
    
    # Vital Signs - Post Dialysis
    post_bp_systolic = models.IntegerField(null=True, blank=True)
    post_bp_diastolic = models.IntegerField(null=True, blank=True)
    post_heart_rate = models.IntegerField(null=True, blank=True)
    post_temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    post_oxygen_saturation = models.IntegerField(null=True, blank=True)
    
    # Dialysis Parameters
    blood_flow_rate = models.IntegerField(null=True, blank=True, help_text="ml/min")
    dialysate_flow_rate = models.IntegerField(null=True, blank=True, help_text="ml/min")
    ultrafiltration_volume = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Liters")
    heparin_dose = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Units")
    
    # Medications Administered
    medications = models.TextField(blank=True, help_text="List medications given during session")
    
    # Complications & Adverse Events
    complications = models.TextField(blank=True, help_text="Any complications during session")
    adverse_events = models.TextField(blank=True, help_text="Adverse events if any")
    
    # Staff Notes
    nurse_notes = models.TextField(blank=True)
    doctor_notes = models.TextField(blank=True)
    
    # Session Staff
    attending_doctor = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='doctor_sessions')
    attending_nurse = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='nurse_sessions')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='created_sessions')
    
    def __str__(self):
        return f"Session - {self.patient} - {self.queue.check_in_time.date()}"
    
    class Meta:
        ordering = ['-created_at']

class QueueSettings(models.Model):
    """Settings for queue management"""
    max_emergency_cases = models.IntegerField(default=3)
    max_wait_time_emergency = models.IntegerField(default=10)  # minutes
    max_wait_time_scheduled = models.IntegerField(default=45)  # minutes
    max_wait_time_walk_in = models.IntegerField(default=90)    # minutes
    auto_assign_machines = models.BooleanField(default=True)
    notify_long_waits = models.BooleanField(default=True)
    
    # === DIALYSIS HEAD: Shift Capacity Management ===
    total_machines = models.IntegerField(default=6, help_text='Total dialysis machines in center')
    max_patients_per_shift = models.IntegerField(default=6, help_text='Max patients per shift (usually = total machines)')
    session_duration_hours = models.IntegerField(default=4, help_text='Standard session duration in hours')
    
    # Shift Definitions
    morning_shift_start = models.TimeField(default='06:00', help_text='Morning shift start time')
    morning_shift_end = models.TimeField(default='12:00', help_text='Morning shift end time')
    afternoon_shift_start = models.TimeField(default='12:00', help_text='Afternoon shift start time')
    afternoon_shift_end = models.TimeField(default='18:00', help_text='Afternoon shift end time')
    evening_shift_start = models.TimeField(default='18:00', help_text='Evening shift start time')
    evening_shift_end = models.TimeField(default='22:00', help_text='Evening shift end time')
    
    # Session Safety
    max_session_duration_minutes = models.IntegerField(default=300, help_text='Alert if session exceeds this (in minutes)')
    min_session_duration_minutes = models.IntegerField(default=60, help_text='Alert if session is shorter than this')
    
    def __str__(self):
        return "Queue Settings"
    
    class Meta:
        verbose_name_plural = "Queue Settings"