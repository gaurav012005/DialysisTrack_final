from rest_framework import serializers
from .models import BackupCode


class Setup2FASerializer(serializers.Serializer):
    """Initiate 2FA setup - no input required"""
    pass


class Verify2FASetupSerializer(serializers.Serializer):
    """Verify TOTP token during setup"""
    token = serializers.CharField(
        max_length=6, 
        min_length=6,
        help_text="6-digit code from authenticator app"
    )


class Verify2FALoginSerializer(serializers.Serializer):
    """Verify 2FA token during login"""
    token = serializers.CharField(
        max_length=8,
        min_length=6,
        help_text="6-digit TOTP code or 8-character backup code"
    )


class BackupCodeSerializer(serializers.ModelSerializer):
    """Backup code data"""
    class Meta:
        model = BackupCode
        fields = ['code', 'is_used', 'created_at', 'used_at']
        read_only_fields = ['is_used', 'created_at', 'used_at']


class Disable2FASerializer(serializers.Serializer):
    """Disable 2FA - requires password confirmation"""
    password = serializers.CharField(
        write_only=True,
        help_text="Current password for verification"
    )


class TwoFactorStatusSerializer(serializers.Serializer):
    """2FA status response"""
    enabled = serializers.BooleanField(read_only=True)
    backup_codes_remaining = serializers.IntegerField(read_only=True)
    qr_code = serializers.CharField(read_only=True, required=False)
    secret = serializers.CharField(read_only=True, required=False)
