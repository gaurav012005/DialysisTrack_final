import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model

# Test direct function call
from reports.views import export_patients_report

try:
    response = export_patients_report('pdf')
    print(f"Status: {response.status_code if hasattr(response, 'status_code') else 'HttpResponse'}")
    print(f"Content-Type: {response.get('Content-Type', 'N/A')}")
    print(f"Content-Length: {len(response.content)}")
    
    # Save to file
    with open('test_direct.pdf', 'wb') as f:
        f.write(response.content)
    print("PDF saved successfully!")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
