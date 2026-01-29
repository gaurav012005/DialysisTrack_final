from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from datetime import datetime

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def simple_test(request):
    """
    Simple test endpoint to verify Django REST framework is working
    Returns exactly the format specified in the requirement
    """
    response_data = {
        "status": "success",
        "message": "Django server is working!",
        "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    
    return Response(response_data, status=status.HTTP_200_OK)

@api_view(['GET', 'OPTIONS'])
@permission_classes([permissions.AllowAny])
def api_root_simple(request):
    """
    API root endpoint with simple response
    """
    if request.method == 'GET':
        response_data = {
            "status": "success", 
            "message": "Django REST Framework API is running!",
            "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "endpoints": {
                "simple_test": "/api/simple-test/",
                "health_check": "/api/health/",
                "documentation": "/swagger/"
            }
        }
        return Response(response_data, status=status.HTTP_200_OK)
    
    elif request.method == 'OPTIONS':
        # Handle OPTIONS request
        response = Response(status=status.HTTP_200_OK)
        response['Allow'] = 'GET, OPTIONS'
        response['Content-Type'] = 'application/json'
        response['Vary'] = 'Accept'
        return response