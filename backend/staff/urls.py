from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'schedules', views.StaffScheduleViewSet, basename='schedule')
router.register(r'attendance', views.StaffAttendanceViewSet, basename='attendance')
router.register(r'leaves', views.LeaveRequestViewSet, basename='leave')
router.register(r'', views.StaffViewSet, basename='staff')

urlpatterns = [
    path('', include(router.urls)),
]