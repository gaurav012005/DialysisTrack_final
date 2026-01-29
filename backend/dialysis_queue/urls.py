from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sessions', views.DialysisSessionViewSet, basename='sessions')
router.register(r'settings', views.QueueSettingsViewSet, basename='queuesettings')

urlpatterns = [
    # Queue endpoints BEFORE router
    path('', views.QueueViewSet.as_view({'get': 'list', 'post': 'create'}), name='queue-list'),
    path('<int:pk>/', views.QueueViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='queue-detail'),
    path('current_queue/', views.QueueViewSet.as_view({'get': 'current_queue'}), name='queue-current'),
    path('dashboard_stats/', views.QueueViewSet.as_view({'get': 'dashboard_stats'}), name='queue-stats'),
    path('<int:pk>/start_treatment/', views.QueueViewSet.as_view({'post': 'start_treatment'}), name='queue-start'),
    path('<int:pk>/complete_treatment/', views.QueueViewSet.as_view({'post': 'complete_treatment'}), name='queue-complete'),
    path('<int:pk>/assign_machine/', views.QueueViewSet.as_view({'post': 'assign_machine'}), name='queue-assign'),
    path('add_emergency/', views.QueueViewSet.as_view({'post': 'add_emergency'}), name='queue-emergency'),
    # Router paths (sessions, settings)
    path('', include(router.urls)),
]