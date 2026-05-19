from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model

User = get_user_model()

class Patient(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )
    
    BLOOD_TYPE_CHOICES = (
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    )
    
    INFECTION_STATUS_CHOICES = (
        ('negative', 'Negative'),
        ('positive', 'Positive'),
        ('unknown', 'Unknown/Not Tested'),
    )
    
    VASCULAR_ACCESS_CHOICES = (
        ('av_fistula', 'AV Fistula'),
        ('av_graft', 'AV Graft'),
        ('tunneled_catheter', 'Tunneled Catheter (Permcath)'),
        ('temporary_catheter', 'Temporary Catheter'),
        ('other', 'Other'),
    )
    
    patient_id = models.CharField(max_length=20, unique=True)
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='patient_profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    blood_type = models.CharField(max_length=3, choices=BLOOD_TYPE_CHOICES, blank=True)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField()
    emergency_contact_name = models.CharField(max_length=100)
    emergency_contact_phone = models.CharField(max_length=15)
    
    # Medical Information
    primary_diagnosis = models.TextField()
    comorbidities = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    current_medications = models.TextField(blank=True)
    
    # Dialysis Specific
    dialysis_type = models.CharField(max_length=50, blank=True)
    vascular_access = models.CharField(max_length=100, choices=VASCULAR_ACCESS_CHOICES, blank=True)
    dry_weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    target_weight_loss = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    
    # === DIALYSIS HEAD: Infection Status (CRITICAL for machine segregation) ===
    hepatitis_b_status = models.CharField(max_length=20, choices=INFECTION_STATUS_CHOICES, default='unknown',
                                           help_text='HBsAg status - Hep B+ patients MUST use dedicated machines')
    hepatitis_c_status = models.CharField(max_length=20, choices=INFECTION_STATUS_CHOICES, default='unknown',
                                           help_text='Anti-HCV status')
    hiv_status = models.CharField(max_length=20, choices=INFECTION_STATUS_CHOICES, default='unknown',
                                   help_text='HIV status')
    last_infection_screening_date = models.DateField(null=True, blank=True,
                                                       help_text='Date of last Hep B/C/HIV screening')
    hepatitis_b_vaccinated = models.BooleanField(default=False, help_text='Is patient Hep B vaccinated?')
    
    # Consent
    consent_given = models.BooleanField(default=False, help_text='Has patient signed dialysis consent form?')
    consent_date = models.DateField(null=True, blank=True)
    consent_expiry_date = models.DateField(null=True, blank=True, help_text='Consent valid for 1 year typically')
    
    is_emergency = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.patient_id} - {self.first_name} {self.last_name}"
    
    @property
    def name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_infection_positive(self):
        """Check if patient has any positive infection status"""
        return self.hepatitis_b_status == 'positive' or self.hepatitis_c_status == 'positive' or self.hiv_status == 'positive'
    
    @property
    def requires_isolated_machine(self):
        """Hep B+ patients MUST use dedicated/isolated machines"""
        return self.hepatitis_b_status == 'positive'
    
    @property
    def is_consent_valid(self):
        """Check if patient has a valid, non-expired consent"""
        if not self.consent_given or not self.consent_date:
            return False
        if self.consent_expiry_date:
            from datetime import date
            return date.today() <= self.consent_expiry_date
        return True
    
    class Meta:
        ordering = ['-created_at']


class DialysisPrescription(models.Model):
    """Doctor-defined prescription for each patient's dialysis sessions.
    
    DIALYSIS HEAD RULE: Every patient MUST have an active prescription before
    they can receive dialysis. This defines the treatment parameters.
    """
    FREQUENCY_CHOICES = (
        ('2_per_week', '2 times per week'),
        ('3_per_week', '3 times per week'),
        ('4_per_week', '4 times per week'),
        ('daily', 'Daily'),
        ('as_needed', 'As needed'),
    )
    
    DIALYZER_CHOICES = (
        ('low_flux', 'Low Flux'),
        ('high_flux', 'High Flux'),
        ('super_flux', 'Super High Flux'),
    )
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    prescribed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='prescriptions_written')
    
    # Session Parameters
    session_duration_minutes = models.IntegerField(default=240, help_text='Target session duration in minutes (typically 180-300)')
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='3_per_week')
    target_blood_flow_rate = models.IntegerField(default=300, help_text='Target blood flow rate ml/min (200-500)')
    target_dialysate_flow_rate = models.IntegerField(default=500, help_text='Target dialysate flow rate ml/min (300-800)')
    
    # Dialyzer
    dialyzer_type = models.CharField(max_length=50, choices=DIALYZER_CHOICES, default='high_flux')
    dialyzer_model = models.CharField(max_length=100, blank=True, help_text='Specific dialyzer model e.g. FX80, Polyflux 170H')
    
    # Anticoagulation
    heparin_dose = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text='Heparin dose in Units')
    heparin_frequency = models.CharField(max_length=100, blank=True, default='Loading + maintenance')
    
    # Targets
    target_dry_weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text='Target dry weight in kg')
    target_uf_volume = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True, help_text='Target UF volume in liters')
    target_ktv = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True, help_text='Target Kt/V (should be >=1.2)')
    
    # Dialysate Composition
    dialysate_sodium = models.IntegerField(default=140, help_text='Sodium mEq/L (135-145)')
    dialysate_potassium = models.DecimalField(max_digits=3, decimal_places=1, default=2.0, help_text='Potassium mEq/L (1-4)')
    dialysate_calcium = models.DecimalField(max_digits=3, decimal_places=1, default=2.5, help_text='Calcium mEq/L (2.5-3.5)')
    dialysate_bicarbonate = models.IntegerField(default=35, help_text='Bicarbonate mEq/L (32-40)')
    
    # Additional Orders
    epo_dose = models.CharField(max_length=100, blank=True, help_text='EPO/ESA dose if prescribed')
    iron_dose = models.CharField(max_length=100, blank=True, help_text='IV Iron dose if prescribed')
    additional_medications = models.TextField(blank=True, help_text='Other medications to give during session')
    special_instructions = models.TextField(blank=True, help_text='Any special instructions for nursing staff')
    
    # Status
    is_active = models.BooleanField(default=True, help_text='Only one active prescription per patient')
    effective_date = models.DateField(help_text='Date this prescription becomes effective')
    expiry_date = models.DateField(null=True, blank=True, help_text='Review/expiry date')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Rx: {self.patient} - {self.frequency} - {self.session_duration_minutes}min"
    
    def save(self, *args, **kwargs):
        # Deactivate previous prescriptions when a new one is created
        if self.is_active:
            DialysisPrescription.objects.filter(
                patient=self.patient, is_active=True
            ).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-created_at']


class LabResult(models.Model):
    """Laboratory test results for dialysis patients.
    
    DIALYSIS HEAD RULE: Every patient must have monthly labs at minimum.
    Kt/V and URR are THE most important dialysis adequacy metrics.
    """
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='lab_results')
    test_date = models.DateField()
    ordered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='lab_orders')
    
    # Kidney Function Tests (KFT)
    blood_urea_nitrogen = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, 
                                                help_text='BUN mg/dL (normal: 7-20)')
    serum_creatinine = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
                                            help_text='mg/dL (normal: 0.6-1.2)')
    
    # Dialysis Adequacy — THE MOST IMPORTANT METRICS
    pre_dialysis_bun = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True,
                                            help_text='BUN before dialysis session mg/dL')
    post_dialysis_bun = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True,
                                             help_text='BUN after dialysis session mg/dL')
    
    # Complete Blood Count (CBC)
    hemoglobin = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True,
                                      help_text='Hb g/dL (target: 10-12 for dialysis patients)')
    hematocrit = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text='%')
    wbc_count = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text='x10^3/uL')
    platelet_count = models.DecimalField(max_digits=6, decimal_places=0, null=True, blank=True, help_text='x10^3/uL')
    
    # Electrolytes
    serum_sodium = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, help_text='mEq/L (135-145)')
    serum_potassium = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, 
                                           help_text='mEq/L (3.5-5.0, CRITICAL if >6.0)')
    serum_calcium = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text='mg/dL')
    serum_phosphorus = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text='mg/dL')
    serum_bicarbonate = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text='mEq/L')
    
    # Iron Studies (for anemia management)
    serum_ferritin = models.DecimalField(max_digits=7, decimal_places=1, null=True, blank=True,
                                          help_text='ng/mL (target: 200-500 for dialysis)')
    transferrin_saturation = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True,
                                                  help_text='TSAT percent (target: 20-50%)')
    
    # Other
    serum_albumin = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True,
                                         help_text='g/dL (target: >=3.5)')
    pth = models.DecimalField(max_digits=7, decimal_places=1, null=True, blank=True,
                               help_text='Parathyroid Hormone pg/mL')
    
    # Infection Screening
    hbsag = models.CharField(max_length=20, blank=True, help_text='Hepatitis B surface antigen')
    anti_hcv = models.CharField(max_length=20, blank=True, help_text='Hepatitis C antibody')
    hiv = models.CharField(max_length=20, blank=True, help_text='HIV test result')
    
    notes = models.TextField(blank=True)
    is_critical = models.BooleanField(default=False, help_text='Flag if any value is critically abnormal')
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def urr(self):
        """Urea Reduction Ratio - measures dialysis adequacy.
        URR = (Pre BUN - Post BUN) / Pre BUN x 100
        Target: >=65%
        """
        if self.pre_dialysis_bun and self.post_dialysis_bun and self.pre_dialysis_bun > 0:
            return round(
                float((self.pre_dialysis_bun - self.post_dialysis_bun) / self.pre_dialysis_bun * 100), 1
            )
        return None
    
    @property
    def ktv_estimated(self):
        """Estimated Kt/V using simplified Daugirdas formula.
        Target: >=1.2
        """
        if self.pre_dialysis_bun and self.post_dialysis_bun and self.pre_dialysis_bun > 0:
            import math
            r = float(self.post_dialysis_bun / self.pre_dialysis_bun)
            if r > 0 and r < 1:
                ktv = -math.log(r - 0.008 * 4)  # Assuming 4-hour session
                return round(ktv, 2)
        return None
    
    @property
    def is_potassium_critical(self):
        """Potassium >6.0 is life-threatening for dialysis patients"""
        return self.serum_potassium and float(self.serum_potassium) > 6.0
    
    @property
    def is_hemoglobin_low(self):
        """Hb <8 needs urgent attention"""
        return self.hemoglobin and float(self.hemoglobin) < 8.0
    
    def save(self, *args, **kwargs):
        # Auto-flag critical results
        if self.is_potassium_critical or self.is_hemoglobin_low:
            self.is_critical = True
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Lab: {self.patient} - {self.test_date}"
    
    class Meta:
        ordering = ['-test_date']