from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.views.generic import RedirectView

# Import the simple test views
from . import test_views

urlpatterns = [
    # Favicon
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.ico', permanent=True)),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # Simple Test Endpoints
    path('', test_views.simple_test, name='api-root'),
    path('api/', test_views.simple_test, name='api-base'),
    path('api/health/', test_views.simple_health, name='health-check'),
    
    # App-specific APIs
    path('api/auth/', include('users.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/queue/', include('dialysis_queue.urls')),
    path('api/machines/', include('machines.urls')),
    path('api/staff/', include('staff.urls')),
    path('api/reports/', include( 'reports.urls')),
    path('api/billing/', include('billing.urls')),
    # path('api/notifications/', include('notifications.urls')),  # Already added elsewhere
    path('api/two-factor/', include('two_factor.urls')),
    
    # API Documentation
    path('swagger/', test_views.api_docs, name='api-docs'),
]

# Error handlers temporarily disabled