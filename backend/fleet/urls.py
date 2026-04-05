from django.urls import path
from . import views

urlpatterns = [
    # Ambulances
    path('ambulances/', views.AmbulanceListCreateView.as_view(), name='ambulance-list-create'),
    path('ambulances/<int:pk>/', views.AmbulanceDetailView.as_view(), name='ambulance-detail'),

    # Dispatch
    path('dispatch/', views.dispatch_ambulance, name='dispatch-ambulance'),

    # Rides
    path('rides/', views.ride_list, name='ride-list'),
    path('rides/my/', views.my_rides, name='my-rides'),
    path('rides/patient-active/', views.patient_active_ride, name='patient-active-ride'),
    path('rides/<int:ride_id>/', views.ride_detail, name='ride-detail'),
    path('rides/<int:ride_id>/status/', views.update_ride_status, name='update-ride-status'),
    path('rides/<int:ride_id>/location/', views.ride_location, name='ride-location'),
    path('rides/<int:ride_id>/location/update/', views.update_ride_location, name='update-ride-location'),

    # Drivers
    path('drivers/', views.driver_list, name='driver-list'),
    path('drivers/create/', views.create_driver, name='create-driver'),
    path('drivers/<int:driver_id>/update/', views.update_driver, name='update-driver'),
    path('drivers/<int:driver_id>/delete/', views.delete_driver, name='delete-driver'),
]
