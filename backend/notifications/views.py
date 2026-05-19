import logging
import secrets
from datetime import timedelta

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

from .models import Notification, AuditLog, PasswordResetToken
from .serializers import NotificationSerializer, AuditLogSerializer

logger = logging.getLogger(__name__)


# ──────────── Helper: Create Audit Log ────────────

def create_audit_log(user, action, module, description, request=None):
    """Utility to create an audit log entry from anywhere."""
    ip = None
    if request:
        ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))
        if ip and ',' in ip:
            ip = ip.split(',')[0].strip()
    AuditLog.objects.create(
        user=user,
        action=action,
        module=module,
        description=description,
        ip_address=ip
    )


# ──────────── Helper: Create & Send Notification ────────────

def create_notification(user, notification_type, title, message, send_email=False):
    """Create a notification and optionally send email."""
    notif = Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message
    )

    if send_email and user.email:
        try:
            send_mail(
                subject=f'[DialysisTrack] {title}',
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@dialysistrack.com'),
                recipient_list=[user.email],
                fail_silently=True,
            )
            notif.email_sent = True
            notif.save(update_fields=['email_sent'])
        except Exception as e:
            logger.error(f'Failed to send email to {user.email}: {e}')

    return notif


# ──────────── Notification Endpoints ────────────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_notifications(request):
    """Get current user's notifications."""
    notifications = Notification.objects.filter(
        user=request.user
    ).order_by('-created_at')[:50]
    serializer = NotificationSerializer(notifications, many=True)
    unread_count = Notification.objects.filter(
        user=request.user, is_read=False
    ).count()
    return Response({
        'notifications': serializer.data,
        'unread_count': unread_count,
        'total': notifications.count(),
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def test_notification(request):
    """Create a test notification for the current user (debug helper)."""
    notif = create_notification(
        user=request.user,
        notification_type='general',
        title='Test Notification',
        message='This is a test notification to verify the system is working correctly.',
    )
    return Response({'detail': 'Test notification created', 'id': notif.id})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_read(request, notification_id):
    """Mark a notification as read."""
    try:
        notif = Notification.objects.get(id=notification_id, user=request.user)
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response({'detail': 'Marked as read'})
    except Notification.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    """Mark all notifications as read."""
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'detail': 'All marked as read'})


# ──────────── Audit Log Endpoints ────────────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def audit_logs(request):
    """Get audit logs (admin only)."""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    module_filter = request.GET.get('module')
    action_filter = request.GET.get('action')
    limit = int(request.GET.get('limit', 100))

    logs = AuditLog.objects.all()
    if module_filter:
        logs = logs.filter(module=module_filter)
    if action_filter:
        logs = logs.filter(action=action_filter)

    logs = logs[:limit]
    serializer = AuditLogSerializer(logs, many=True)
    return Response({'logs': serializer.data, 'total': AuditLog.objects.count()})


# ──────────── Password Reset Endpoints ────────────

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    """Request a password reset. Generates token and sends email."""
    email = request.data.get('email')
    if not email:
        return Response({'detail': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    from users.models import User
    try:
        user = User.objects.get(email=email, is_active=True)
    except User.DoesNotExist:
        # Don't reveal if email exists
        return Response({'detail': 'If this email is registered, a reset link has been sent.'})

    # Generate token
    token = secrets.token_urlsafe(48)
    PasswordResetToken.objects.create(
        user=user,
        token=token,
        expires_at=timezone.now() + timedelta(hours=1)
    )

    # Build reset URL (frontend)
    reset_url = f"http://localhost:5173/reset-password?token={token}"
    message = (
        f"Hi {user.first_name},\n\n"
        f"You requested a password reset for DialysisTrack.\n\n"
        f"Use this token to reset your password: {token}\n\n"
        f"Or open this link: {reset_url}\n\n"
        f"This token expires in 1 hour.\n\n"
        f"If you didn't request this, ignore this email."
    )

    # Send email (will silently fail if no email backend configured)
    try:
        send_mail(
            subject='[DialysisTrack] Password Reset Request',
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@dialysistrack.com'),
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception:
        pass

    # Also create notification
    create_notification(user, 'password_reset', 'Password Reset Requested', message)
    create_audit_log(None, 'update', 'auth', f'Password reset requested for {email}', request)

    return Response({
        'detail': 'If this email is registered, a reset link has been sent.',
        'token': token  # Include in dev mode for testing — remove in production
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Reset password using token."""
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    if not token or not new_password:
        return Response({'detail': 'Token and new_password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({'detail': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        reset_token = PasswordResetToken.objects.get(token=token)
    except PasswordResetToken.DoesNotExist:
        return Response({'detail': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)

    if not reset_token.is_valid():
        return Response({'detail': 'Token has expired or already been used'}, status=status.HTTP_400_BAD_REQUEST)

    user = reset_token.user
    user.set_password(new_password)
    user.save()

    reset_token.is_used = True
    reset_token.save(update_fields=['is_used'])

    create_audit_log(user, 'update', 'auth', 'Password reset completed', request)
    create_notification(user, 'general', 'Password Changed', 'Your password has been successfully reset.')

    return Response({'detail': 'Password has been reset successfully'})
