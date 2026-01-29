from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def simple_test(request):
    return Response({
        'status': 'success',
        'message': 'Django server is working!',
        'timestamp': '2024-01-01T00:00:00Z'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def simple_health(request):
    return JsonResponse({
        'status': 'healthy',
        'server': 'running'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def api_docs(request):
    """Simple API documentation"""
    base_url = request.build_absolute_uri('/')
    
    docs = {
        'title': 'Dialysis Queue Management API',
        'version': '1.0.0',
        'description': 'API for managing dialysis queue and patient management',
        'base_url': base_url,
        'endpoints': {
            'Authentication': {
                'login': f'{base_url}api/auth/login/',
                'register': f'{base_url}api/auth/register/',
                'profile': f'{base_url}api/auth/profile/',
                'logout': f'{base_url}api/auth/logout/'
            },
            'Patients': {
                'list': f'{base_url}api/patients/',
                'emergency': f'{base_url}api/patients/emergency_cases/'
            },
            'Queue': {
                'list': f'{base_url}api/queue/',
                'current': f'{base_url}api/queue/current_queue/',
                'stats': f'{base_url}api/queue/dashboard_stats/'
            },
            'Machines': {
                'list': f'{base_url}api/machines/',
                'available': f'{base_url}api/machines/available_machines/'
            },
            'Staff': {
                'list': f'{base_url}api/staff/',
                'schedules': f'{base_url}api/staff/schedules/'
            },
            'Reports': {
                'dashboard': f'{base_url}api/reports/dashboard-stats/',
                'patients': f'{base_url}api/reports/patients/',
                'export': f'{base_url}api/reports/export/'
            }
        }
    }
    
    return Response(docs)