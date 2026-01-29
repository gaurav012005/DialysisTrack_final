#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import json

def debug_authentication():
    """Debug authentication issues"""
    
    print("=== Authentication Debug ===")
    
    # Check if admin user exists
    try:
        user = User.objects.get(email='admin@test.com')
        print(f"[OK] Admin user found: {user.email}")
        print(f"   - Username: {user.username}")
        print(f"   - Is active: {user.is_active}")
        print(f"   - Is staff: {user.is_staff}")
        print(f"   - Role: {user.role}")
        
        # Generate token for testing
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        print(f"\n[OK] Generated tokens:")
        print(f"   - Access token: {access_token[:50]}...")
        print(f"   - Refresh token: {str(refresh)[:50]}...")
        
        # Test token validation
        from rest_framework_simplejwt.authentication import JWTAuthentication
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        
        try:
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(access_token)
            print(f"[OK] Token validation successful")
            print(f"   - Token type: {validated_token.token_type}")
            print(f"   - User ID: {validated_token['user_id']}")
            
        except (InvalidToken, TokenError) as e:
            print(f"[ERROR] Token validation failed: {e}")
            
    except User.DoesNotExist:
        print("[ERROR] Admin user not found")
        
    # Check JWT settings
    from django.conf import settings
    print(f"\n=== JWT Settings ===")
    print(f"ACCESS_TOKEN_LIFETIME: {settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']}")
    print(f"REFRESH_TOKEN_LIFETIME: {settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']}")
    print(f"ROTATE_REFRESH_TOKENS: {settings.SIMPLE_JWT['ROTATE_REFRESH_TOKENS']}")
    
    # Check REST framework settings
    print(f"\n=== REST Framework Settings ===")
    print(f"DEFAULT_AUTHENTICATION_CLASSES: {settings.REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES']}")
    print(f"DEFAULT_PERMISSION_CLASSES: {settings.REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES']}")

if __name__ == '__main__':
    debug_authentication()