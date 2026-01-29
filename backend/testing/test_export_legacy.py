import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from reports.views import export_report

factory = RequestFactory()
request = factory.get('/api/reports/export/?type=patients&format=csv')

# Mock user
from django.contrib.auth import get_user_model
User = get_user_model()
request.user = User.objects.first()

try:
    response = export_report(request)
    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.get('Content-Type', 'N/A')}")
    print("Success!")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
