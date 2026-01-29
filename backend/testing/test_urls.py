import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.urls import get_resolver

resolver = get_resolver()
for pattern in resolver.url_patterns:
    if hasattr(pattern, 'url_patterns'):
        for sub_pattern in pattern.url_patterns:
            print(f"{pattern.pattern}{sub_pattern.pattern}")
