from django.urls import path
from . import views

urlpatterns = [
    # Notifications
    path('', views.my_notifications, name='my-notifications'),
    path('<int:notification_id>/read/', views.mark_read, name='mark-notification-read'),
    path('mark-all-read/', views.mark_all_read, name='mark-all-read'),
    path('test/', views.test_notification, name='test-notification'),

    # Audit Logs (admin only)
    path('audit-logs/', views.audit_logs, name='audit-logs'),

    # Password Reset
    path('forgot-password/', views.forgot_password, name='forgot-password'),
    path('reset-password/', views.reset_password, name='reset-password'),
]
