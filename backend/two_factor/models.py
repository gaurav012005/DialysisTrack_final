from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class BackupCode(models.Model):
    """Backup codes for 2FA recovery"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='backup_codes')
    code = models.CharField(max_length=8, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.code[:2]}****** ({'Used' if self.is_used else 'Active'})"
    
    def mark_as_used(self):
        """Mark the backup code as used"""
        self.is_used = True
        self.used_at = timezone.now()
        self.save()


class TwoFactorReminder(models.Model):
    """Track 2FA setup reminders for users"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='two_factor_reminder')
    
    # Tracking fields
    last_reminder_shown = models.DateTimeField(null=True, blank=True)
    reminder_skip_count = models.IntegerField(default=0)
    login_count = models.IntegerField(default=0)  # Track login count instead of logout
    
    # Grace period after 2FA setup (3 free logins before requiring code)
    grace_logins_remaining = models.IntegerField(default=0)
    
    # Configuration
    hours_between_reminders = models.IntegerField(default=24)
    logins_before_reminder = models.IntegerField(default=3)  # Show reminder after 3 logins
    grace_logins_allowed = models.IntegerField(default=3)  # Allow 3 logins without code after setup
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Two-Factor Reminder"
        verbose_name_plural = "Two-Factor Reminders"
    
    def __str__(self):
        return f"2FA Reminder for {self.user.email}"
    
    def should_show_reminder(self):
        """
        Check if we should show the 2FA setup reminder based on:
        1. Number of logins (3+ logins)
        2. Time elapsed since last reminder (24+ hours)
        """
        from django_otp.plugins.otp_totp.models import TOTPDevice
        
        # If user already has 2FA enabled, don't show reminder
        if TOTPDevice.objects.filter(user=self.user, confirmed=True).exists():
            return False
        
        # Check login count
        if self.login_count >= self.logins_before_reminder:
            return True
        
        # Check time elapsed
        if self.last_reminder_shown:
            hours_elapsed = (timezone.now() - self.last_reminder_shown).total_seconds() / 3600
            if hours_elapsed >= self.hours_between_reminders:
                return True
        else:
            # Never shown before, don't show until 3 logins
            return False
        
        return False
    
    def increment_login(self):
        """Increment login counter"""
        self.login_count += 1
        self.save()
    
    def reminder_shown(self):
        """Mark that reminder was shown"""
        self.last_reminder_shown = timezone.now()
        self.save()
    
    def reminder_skipped(self):
        """User skipped the reminder"""
        self.reminder_skip_count += 1
        self.last_reminder_shown = timezone.now()
        self.login_count = 0  # Reset login count
        self.save()
    
    def reset_counters(self):
        """Reset all counters (called when user enables 2FA)"""
        self.login_count = 0
        self.reminder_skip_count = 0
        self.last_reminder_shown = None
        # Set grace logins when 2FA is enabled
        self.grace_logins_remaining = self.grace_logins_allowed
        self.save()
    
    def use_grace_login(self):
        """Use one grace login (called on each login during grace period)"""
        if self.grace_logins_remaining > 0:
            self.grace_logins_remaining -= 1
            self.save()
            return True
        return False
    
    def needs_2fa_verification(self):
        """
        Check if user needs to enter 2FA code
        Returns False if still in grace period, True if grace period expired
        """
        from django_otp.plugins.otp_totp.models import TOTPDevice
        
        # If no 2FA device, don't need verification
        if not TOTPDevice.objects.filter(user=self.user, confirmed=True).exists():
            return False
        
        # If grace logins remaining, don't need verification
        if self.grace_logins_remaining > 0:
            return False
        
        # Grace period over, need verification
        return True

