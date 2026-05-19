import logging

from rest_framework import status, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, UserRegisterSerializer, LoginSerializer

logger = logging.getLogger(__name__)


class LoginRateThrottle(AnonRateThrottle):
    rate = '5/min'

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def auth_endpoints(request):
    """List available authentication endpoints"""
    base_url = request.build_absolute_uri('/api/auth/')
    
    endpoints = {
        'message': 'Authentication Endpoints',
        'endpoints': {
            'login': f'{base_url}login/',
            'register': f'{base_url}register/',
            'profile': f'{base_url}profile/',
            'logout': f'{base_url}logout/'
        }
    }
    
    return Response(endpoints)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([LoginRateThrottle])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'detail': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Use filter().first() to handle duplicate users gracefully
        # In case of duplicates, get the most recently created active user
        users = User.objects.filter(email=email, is_active=True).order_by('-date_joined')
        
        if not users.exists():
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = users.first()
        
        if user.check_password(password):
            # Check if user has 2FA enabled
            from django_otp.plugins.otp_totp.models import TOTPDevice
            from two_factor.models import TwoFactorReminder
            
            has_2fa = TOTPDevice.objects.filter(user=user, confirmed=True).exists()
            is_staff = user.role in ['admin', 'doctor', 'nurse', 'receptionist', 'technician']
            
            # MANDATORY 2FA SETUP FOR ALL STAFF MEMBERS
            if is_staff:
                if not has_2fa:
                    # Staff user without 2FA - MUST set it up (no skip allowed)
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'requires_2fa_setup': True,
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                        'user': UserSerializer(user).data,
                        'message': '2FA setup is mandatory for all staff members. Please complete setup to continue.'
                    })
                else:
                    # Staff user with 2FA enabled - ALWAYS require verification (no grace period)
                    refresh = RefreshToken.for_user(user)
                    temp_token = str(refresh.access_token)
                    
                    return Response({
                        'requires_2fa': True,
                        'temp_token': temp_token,
                        'message': 'Please enter your 2FA code'
                    })
            
            # Non-staff users can login normally without 2FA
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data,
                'requires_2fa': False
            })
        else:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        logger.exception('Login error for email=%s', request.data.get('email', 'unknown'))
        return Response({'detail': 'An unexpected server error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
def logout_view(request):
    try:
        # Blacklist refresh token
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegisterSerializer
        return UserSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)