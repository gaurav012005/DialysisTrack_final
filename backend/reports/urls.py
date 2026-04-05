from django.urls import path
from . import views

urlpatterns = [
    path('export/', views.export_report, name='export-report'),
    path('test-export/', views.test_export, name='test-export'),
    path('', views.reports_list, name='reports-list'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
    path('chart-data/', views.chart_data, name='chart-data'),
    path('patients/', views.patient_reports, name='patient-reports'),
    path('queue/', views.queue_reports, name='queue-reports'),
    path('machines/', views.machine_utilization, name='machine-reports'),
    path('staff/', views.staff_performance, name='staff-reports'),
]