import logging

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Ambulance, AmbulanceRide
from .serializers import AmbulanceSerializer, AmbulanceRideSerializer
from users.models import User

logger = logging.getLogger(__name__)


# ──── Ambulance CRUD ────

class AmbulanceListCreateView(generics.ListCreateAPIView):
    """List all ambulances or create a new one (Admin, Receptionist)"""
    serializer_class = AmbulanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ambulance.objects.all().select_related('driver')

    def perform_create(self, serializer):
        serializer.save()


class AmbulanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an ambulance"""
    serializer_class = AmbulanceSerializer
    permission_classes = [IsAuthenticated]
    queryset = Ambulance.objects.all()


# ──── Dispatch ────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dispatch_ambulance(request):
    """Dispatch an ambulance to a patient"""
    ambulance_id = request.data.get('ambulance')
    patient_id = request.data.get('patient')
    pickup_address = request.data.get('pickup_address', '')

    if not ambulance_id or not patient_id:
        return Response(
            {'detail': 'ambulance and patient are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    ambulance = get_object_or_404(Ambulance, id=ambulance_id)

    if ambulance.status != 'available':
        return Response(
            {'detail': 'Ambulance is not available'},
            status=status.HTTP_400_BAD_REQUEST
        )

    ride = AmbulanceRide.objects.create(
        ambulance=ambulance,
        patient_id=patient_id,
        pickup_address=pickup_address,
        dispatched_by=request.user,
        status='assigned'
    )

    # Mark ambulance as on_trip
    ambulance.status = 'on_trip'
    ambulance.save()
    
    try:
        from patients.models import Patient
        patient_obj = Patient.objects.get(id=patient_id)
        if hasattr(patient_obj, 'user') and patient_obj.user:
            from notifications.views import create_notification
            create_notification(
                user=patient_obj.user,
                notification_type='ambulance_dispatched',
                title='Ambulance Dispatched',
                message=f'An ambulance ({ambulance.vehicle_number}) has been dispatched to your location.'
            )
    except Exception:
        pass

    serializer = AmbulanceRideSerializer(ride)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# ──── Ride Endpoints ────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ride_list(request):
    """List all rides (Admin, Receptionist)"""
    rides = AmbulanceRide.objects.all().select_related('ambulance', 'patient', 'dispatched_by')
    serializer = AmbulanceRideSerializer(rides, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ride_detail(request, ride_id):
    """Get a single ride detail"""
    ride = get_object_or_404(AmbulanceRide, id=ride_id)
    serializer = AmbulanceRideSerializer(ride)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_ride_status(request, ride_id):
    """Update ride status (Driver)"""
    ride = get_object_or_404(AmbulanceRide, id=ride_id)
    new_status = request.data.get('status')

    valid_transitions = {
        'assigned': ['en_route', 'cancelled'],
        'en_route': ['arrived', 'cancelled'],
        'arrived': ['completed', 'cancelled'],
    }

    allowed = valid_transitions.get(ride.status, [])
    if new_status not in allowed:
        return Response(
            {'detail': f'Cannot transition from {ride.status} to {new_status}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    ride.status = new_status
    ride.save()

    if new_status in ['en_route', 'arrived']:
        if hasattr(ride.patient, 'user') and ride.patient.user:
            from notifications.views import create_notification
            status_text = "is on its way" if new_status == 'en_route' else "has arrived at your location"
            create_notification(
                user=ride.patient.user,
                notification_type='ambulance_dispatched',
                title='Ambulance Status Update',
                message=f'Your assigned ambulance {status_text}.'
            )

    # If completed or cancelled, free the ambulance
    if new_status in ('completed', 'cancelled'):
        ride.ambulance.status = 'available'
        ride.ambulance.save()

    serializer = AmbulanceRideSerializer(ride)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_rides(request):
    """Get driver's active ride(s)"""
    user = request.user
    # Find rides where the ambulance is assigned to this driver and ride is active
    rides = AmbulanceRide.objects.filter(
        ambulance__driver=user,
        status__in=['assigned', 'en_route', 'arrived']
    ).select_related('ambulance', 'patient')
    serializer = AmbulanceRideSerializer(rides, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_active_ride(request):
    """Get patient's active ride"""
    user = request.user
    try:
        from patients.models import Patient
        patient = Patient.objects.get(user=user)
        ride = AmbulanceRide.objects.filter(
            patient=patient,
            status__in=['assigned', 'en_route', 'arrived']
        ).select_related('ambulance').first()

        if ride:
            serializer = AmbulanceRideSerializer(ride)
            return Response(serializer.data)
        return Response({'detail': 'No active ride'}, status=status.HTTP_404_NOT_FOUND)
    except Exception:
        return Response({'detail': 'No active ride'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ride_location(request, ride_id):
    """Get live driver location for a ride (HTTP polling fallback)"""
    ride = get_object_or_404(AmbulanceRide, id=ride_id)
    return Response({
        'lat': float(ride.driver_lat) if ride.driver_lat else None,
        'lng': float(ride.driver_lng) if ride.driver_lng else None,
        'status': ride.status,
        'updated_at': ride.updated_at.isoformat() if ride.updated_at else None,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_ride_location(request, ride_id):
    """Update driver location via REST API (fallback when WebSocket unavailable)"""
    ride = get_object_or_404(AmbulanceRide, id=ride_id)
    lat = request.data.get('lat')
    lng = request.data.get('lng')

    if lat is None or lng is None:
        return Response({'detail': 'lat and lng are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        ride.driver_lat = float(lat)
        ride.driver_lng = float(lng)
        ride.save(update_fields=['driver_lat', 'driver_lng', 'updated_at'])
        return Response({'detail': 'Location updated'})
    except (ValueError, TypeError):
        return Response({'detail': 'Invalid coordinates'}, status=status.HTTP_400_BAD_REQUEST)


# ──── Driver CRUD ────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def driver_list(request):
    """List all driver users"""
    drivers = User.objects.filter(role='driver', is_active=True)
    data = [{
        'id': d.id,
        'first_name': d.first_name,
        'last_name': d.last_name,
        'email': d.email,
        'phone_number': d.phone_number,
        'address': d.address,
        'is_active': d.is_active,
    } for d in drivers]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_driver(request):
    """Create a new driver user (Admin/Receptionist only)"""
    if request.user.role not in ['admin', 'receptionist']:
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    password = data.get('password')
    email = data.get('email', '')

    if not password or len(password) < 8:
        return Response(
            {'detail': 'Password is required and must be at least 8 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not email:
        return Response({'detail': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Pre-check for existing email/username to give a clear error
    if User.objects.filter(email=email).exists() or User.objects.filter(username=email).exists():
        return Response(
            {'detail': f'A user with email "{email}" already exists. Use a different email.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            role='driver',
            phone_number=data.get('phone_number', ''),
            address=data.get('address', ''),
        )
        return Response({
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'phone_number': user.phone_number,
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.exception('Error creating driver')
        error_msg = str(e)
        if 'unique' in error_msg.lower() or 'duplicate' in error_msg.lower():
            return Response(
                {'detail': 'A user with this email already exists. Use a different email.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(
            {'detail': error_msg or 'Failed to create driver account.'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_driver(request, driver_id):
    """Update a driver user (Admin/Receptionist only)"""
    if request.user.role not in ['admin', 'receptionist']:
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    driver = get_object_or_404(User, id=driver_id, role='driver')
    data = request.data
    driver.first_name = data.get('first_name', driver.first_name)
    driver.last_name = data.get('last_name', driver.last_name)
    driver.email = data.get('email', driver.email)
    driver.phone_number = data.get('phone_number', driver.phone_number)
    driver.address = data.get('address', driver.address)
    driver.save()
    return Response({
        'id': driver.id,
        'first_name': driver.first_name,
        'last_name': driver.last_name,
        'email': driver.email,
        'phone_number': driver.phone_number,
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_driver(request, driver_id):
    """Deactivate a driver (Admin only)"""
    if request.user.role != 'admin':
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    driver = get_object_or_404(User, id=driver_id, role='driver')
    driver.is_active = False
    driver.save()
    return Response({'detail': 'Driver deactivated'}, status=status.HTTP_204_NO_CONTENT)
