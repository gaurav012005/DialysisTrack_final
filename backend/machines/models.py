from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class DialysisMachine(models.Model):
    MACHINE_TYPE_CHOICES = (
        ('hemodialysis', 'Hemodialysis'),
        ('peritoneal', 'Peritoneal'),
        ('hdf', 'HDF'),
    )
    
    STATUS_CHOICES = (
        ('available', '🟢 Available'),
        ('in_use', '🔵 In Use'),
        ('maintenance', '🟠 Maintenance'),
        ('cleaning', '🟡 Cleaning'),
        ('out_of_service', '🔴 Out of Service'),
    )
    
    # Basic Information
    machine_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    machine_type = models.CharField(max_length=20, choices=MACHINE_TYPE_CHOICES, default='hemodialysis')
    manufacturer = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, unique=True)
    
    # Status and Usage
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    current_patient = models.ForeignKey('patients.Patient', on_delete=models.SET_NULL, null=True, blank=True)
    current_session_start = models.DateTimeField(null=True, blank=True)
    
    # Maintenance Information
    purchase_date = models.DateField()
    warranty_expiry = models.DateField(null=True, blank=True)
    last_maintenance_date = models.DateField(null=True, blank=True)
    next_maintenance_date = models.DateField(null=True, blank=True)
    maintenance_interval_days = models.IntegerField(default=90)
    
    # Usage Statistics
    total_sessions = models.IntegerField(default=0)
    total_operating_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    # Technical Specifications
    water_quality_required = models.BooleanField(default=True)
    power_requirements = models.CharField(max_length=100, blank=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    dimensions = models.CharField(max_length=100, blank=True)
    
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.machine_id} - {self.name} ({self.status})"
    
    class Meta:
        ordering = ['machine_id']
    
    @property
    def needs_maintenance(self):
        if self.next_maintenance_date:
            from datetime import date
            return date.today() >= self.next_maintenance_date
        return False
    
    @property
    def days_since_maintenance(self):
        if self.last_maintenance_date:
            from datetime import date
            return (date.today() - self.last_maintenance_date).days
        return None

class MaintenanceLog(models.Model):
    MAINTENANCE_TYPE_CHOICES = (
        ('routine', 'Routine Maintenance'),
        ('repair', 'Repair'),
        ('calibration', 'Calibration'),
        ('inspection', 'Inspection'),
    )
    
    machine = models.ForeignKey(DialysisMachine, on_delete=models.CASCADE, related_name='maintenance_logs')
    maintenance_type = models.CharField(max_length=20, choices=MAINTENANCE_TYPE_CHOICES)
    maintenance_date = models.DateField()
    next_maintenance_date = models.DateField()
    
    # Maintenance Details
    performed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    description = models.TextField()
    parts_replaced = models.TextField(blank=True)
    cost = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    # Technical Details
    blood_leak_test = models.BooleanField(default=True)
    pressure_test = models.BooleanField(default=True)
    conductivity_test = models.BooleanField(default=True)
    temperature_test = models.BooleanField(default=True)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Maintenance {self.maintenance_type} - {self.machine} on {self.maintenance_date}"
    
    class Meta:
        ordering = ['-maintenance_date']

class CleaningLog(models.Model):
    CLEANING_TYPE_CHOICES = (
        ('disinfection', 'Disinfection'),
        ('sterilization', 'Sterilization'),
        ('sanitization', 'Sanitization'),
    )
    
    machine = models.ForeignKey(DialysisMachine, on_delete=models.CASCADE, related_name='cleaning_logs')
    cleaning_type = models.CharField(max_length=20, choices=CLEANING_TYPE_CHOICES)
    cleaning_date = models.DateTimeField(auto_now_add=True)
    cleaned_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    
    # Cleaning Details
    cleaning_agent = models.CharField(max_length=100)
    concentration = models.CharField(max_length=50, blank=True)
    contact_time = models.IntegerField(help_text="Contact time in minutes")
    
    # Test Results
    bacterial_count_before = models.IntegerField(null=True, blank=True)
    bacterial_count_after = models.IntegerField(null=True, blank=True)
    endotoxin_level = models.DecimalField(max_digits=6, decimal_places=3, null=True, blank=True)
    
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Cleaning {self.cleaning_type} - {self.machine} on {self.cleaning_date}"
    
    class Meta:
        ordering = ['-cleaning_date']