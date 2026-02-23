from django.db import models
from django.conf import settings
from patients.models import Patient


class Ambulance(models.Model):
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('maintenance', 'Maintenance'),
    )

    vehicle_number = models.CharField(max_length=20, unique=True)
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'driver'},
        related_name='assigned_ambulance'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.vehicle_number} ({self.get_status_display()})"


class AmbulanceRide(models.Model):
    RIDE_STATUS_CHOICES = (
        ('assigned', 'Assigned'),
        ('en_route', 'En Route'),
        ('arrived', 'Arrived'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    ambulance = models.ForeignKey(Ambulance, on_delete=models.CASCADE, related_name='rides')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='ambulance_rides')
    pickup_address = models.TextField()
    status = models.CharField(max_length=20, choices=RIDE_STATUS_CHOICES, default='assigned')
    dispatched_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='dispatched_rides'
    )
    driver_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    driver_lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Ride #{self.id} - {self.ambulance.vehicle_number} ({self.get_status_display()})"
