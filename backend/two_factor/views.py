from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.util import random_hex
from django.contrib.auth import get_user_model
import qrcode
import io
import base64
from .models import BackupCode
from .serializers import (
    Verify2FASetupSerializer,
    Verify2FALoginSerializer,
    Disable2FASerializer,
    BackupCodeSerializer
)

User = get_user_model()


class TwoFactorViewSet(viewsets.ViewSet):
    """
    ViewSet for Two-Factor Authentication management
    
    Provides endpoints for:
    - Setting up 2FA with QR code
    - Verifying 2FA during setup
    - Checking 2FA status
    - Disabling 2FA
    - Verifying 2FA tokens during login
    """
    permission_classes = [IsAuthenticated]
    
    def _is_staff_user(self, user):
        """Check if user is a staff member"""
        return user.role in ['admin', 'doctor', 'nurse', 'receptionist', 'technician']
    
    @action(detail=False, methods=['post'])
    def setup(self, request):
        """
        Generate QR code for 2FA setup
        
        Creates a new TOTP device and returns QR code for scanning
        with authenticator apps like Google Authenticator or Authy
        """
        user = request.user
        
        # Only allow staff roles
        if not self._is_staff_user(user):
            return Response(
                {'error': '2FA is only available for staff members'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already enabled
        if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
            return Response(
                {'error': '2FA is already enabled for this account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete existing unconfirmed devices
        TOTPDevice.objects.filter(user=user, confirmed=False).delete()
        
        # Create new device
        device = TOTPDevice.objects.create(
            user=user,
            name='default',
            confirmed=False
        )
        
        # Get the secret in base32 format (required for authenticator apps)
        # device.key is hex, we need to convert to base32
        import base64
        secret_base32 = base64.b32encode(bytes.fromhex(device.key)).decode('utf-8').rstrip('=')
        
        # Generate QR code
        url = device.config_url
        qr = qrcode.QRCode(
            version=1,
            box_size=10,
            border=5
        )
        qr.add_data(url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return Response({
            'qr_code': f'data:image/png;base64,{img_str}',
            'secret': secret_base32,
            'user': user.email,
            'message': 'Scan QR code with your authenticator app'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def verify_setup(self, request):
        """
        Verify and confirm 2FA setup
        
        Validates the TOTP token and enables 2FA if correct.
        Generates backup codes for account recovery.
        """
        user = request.user
        serializer = Verify2FASetupSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        token = serializer.validated_data['token']
        
        # Ensure token is a string and exactly 6 digits
        token = str(token).strip()
        if not token.isdigit() or len(token) != 6:
            return Response(
                {'error': 'Token must be exactly 6 digits'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get unconfirmed device
        device = TOTPDevice.objects.filter(
            user=user,
            confirmed=False
        ).first()
        
        if not device:
            return Response(
                {'error': 'No 2FA setup in progress. Please start setup first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set tolerance for time drift (allows ±2 time windows = ±60 seconds)
        device.tolerance = 2
        
        # Verify token
        if device.verify_token(token):
            device.confirmed = True
            device.save()
            
            # Delete old backup codes if any
            BackupCode.objects.filter(user=user).delete()
            
            # Generate 10 new backup codes
            backup_codes = []
            for _ in range(10):
                code = random_hex(4).upper()  # 8-character code
                BackupCode.objects.create(user=user, code=code)
                backup_codes.append(code)
            
            # Reset reminder counters since 2FA is now enabled
            from .models import TwoFactorReminder
            reminder = TwoFactorReminder.objects.filter(user=user).first()
            if reminder:
                reminder.reset_counters()
            
            return Response({
                'success': True,
                'message': '2FA enabled successfully!',
                'backup_codes': backup_codes,
                'warning': 'Save these backup codes in a safe place. They can only be used once.'
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'detail': 'Invalid verification code. Please ensure your device time is synchronized and try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def verify_login(self, request):
        """
        Verify 2FA token during login
        
        Accepts either:
        - 6-digit TOTP code from authenticator app
        - 8-character backup code
        
        Returns JWT tokens after successful verification
        """
        from rest_framework_simplejwt.tokens import RefreshToken
        from users.serializers import UserSerializer
        
        serializer = Verify2FALoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        token = str(serializer.validated_data['token']).strip()
        user = request.user
        
        verified = False
        backup_used = False
        backup_remaining = 0
        
        # Check TOTP device first (6 digits)
        if len(token) == 6 and token.isdigit():
            device = TOTPDevice.objects.filter(
                user=user,
                confirmed=True
            ).first()
            
            if device:
                # Set tolerance for time drift
                device.tolerance = 2
                
                if device.verify_token(token):
                    verified = True
        
        # Check backup code (8 characters)
        if not verified and len(token) == 8:
            backup = BackupCode.objects.filter(
                user=user,
                code=token.upper(),
                is_used=False
            ).first()
            
            if backup:
                backup.mark_as_used()
                backup_remaining = BackupCode.objects.filter(
                    user=user,
                    is_used=False
                ).count()
                verified = True
                backup_used = True
        
        if verified:
            # Reset grace period after successful 2FA verification
            from .models import TwoFactorReminder
            reminder, created = TwoFactorReminder.objects.get_or_create(user=user)
            reminder.reset_counters()  # Reset to 3 free logins and update timestamp
            
            # Generate new JWT tokens for complete authentication
            refresh = RefreshToken.for_user(user)
            
            response_data = {
                'success': True,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
                'message': '2FA verification successful',
                'grace_logins_remaining': 3  # User now has 3 free logins
            }
            
            if backup_used:
                response_data['backup_code_used'] = True
                response_data['backup_codes_remaining'] = backup_remaining
                response_data['warning'] = 'Consider regenerating backup codes if running low.'
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        return Response(
            {'detail': 'Invalid 2FA code or backup code. Please ensure your device time is synchronized.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """
        Check if user has 2FA enabled
        
        Returns 2FA status and remaining backup codes count
        """
        user = request.user
        
        # Check if staff user
        if not self._is_staff_user(user):
            return Response({
                'enabled': False,
                'available': False,
                'message': '2FA is only available for staff members'
            })
        
        has_2fa = TOTPDevice.objects.filter(
            user=user,
            confirmed=True
        ).exists()
        
        backup_codes_remaining = BackupCode.objects.filter(
            user=user,
            is_used=False
        ).count()
        
        return Response({
            'enabled': has_2fa,
            'available': True,
            'backup_codes_remaining': backup_codes_remaining
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def skip_reminder(self, request):
        """
        Skip reminder endpoint is disabled - 2FA is now mandatory for all staff
        
        This endpoint is kept for backward compatibility but returns an error
        """
        return Response(
            {'error': '2FA setup is mandatory for all staff members and cannot be skipped.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    @action(detail=False, methods=['post'])
    def disable(self, request):
        """
        Disable 2FA for user
        
        Note: Staff members cannot disable 2FA as it is mandatory
        Only non-staff users (patients) can disable 2FA
        """
        user = request.user
        
        # Check if user is staff - staff cannot disable 2FA
        if self._is_staff_user(user):
            return Response(
                {'error': '2FA is mandatory for all staff members and cannot be disabled. Contact your administrator if you need assistance.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = Disable2FASerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        password = serializer.validated_data['password']
        
        # Verify password before disabling
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if 2FA is enabled
        if not TOTPDevice.objects.filter(user=user, confirmed=True).exists():
            return Response(
                {'error': '2FA is not enabled for this account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete devices and backup codes (only for non-staff users)
        TOTPDevice.objects.filter(user=user).delete()
        BackupCode.objects.filter(user=user).delete()
        
        return Response({
            'success': True,
            'message': '2FA has been disabled for your account'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def backup_codes(self, request):
        """
        Get list of backup codes (masked for security)
        """
        user = request.user
        
        codes = BackupCode.objects.filter(user=user)
        
        # Mask codes for security (show first 2 chars)
        masked_codes = [
            {
                'code': f"{code.code[:2]}******" if not code.is_used else f"{code.code[:2]}****** (Used)",
                'is_used': code.is_used,
                'created_at': code.created_at
            }
            for code in codes
        ]
        
        return Response({
            'codes': masked_codes,
            'total': codes.count(),
            'remaining': codes.filter(is_used=False).count()
        })
    
    @action(detail=False, methods=['post'])
    def regenerate_backup_codes(self, request):
        """
        Regenerate all backup codes
        
        Requires password confirmation
        """
        user = request.user
        serializer = Disable2FASerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        password = serializer.validated_data['password']
        
        # Verify password
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if 2FA is enabled
        if not TOTPDevice.objects.filter(user=user, confirmed=True).exists():
            return Response(
                {'error': '2FA must be enabled to regenerate backup codes'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete old codes
        BackupCode.objects.filter(user=user).delete()
        
        # Generate new codes
        backup_codes = []
        for _ in range(10):
            code = random_hex(4).upper()
            BackupCode.objects.create(user=user, code=code)
            backup_codes.append(code)
        
        return Response({
            'success': True,
            'backup_codes': backup_codes,
            'message': 'New backup codes generated. Save them securely!'
        }, status=status.HTTP_200_OK)
