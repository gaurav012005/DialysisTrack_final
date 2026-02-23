from django.urls import re_path
from fleet.consumers import LocationConsumer

websocket_urlpatterns = [
    re_path(r'ws/location/(?P<ride_id>\d+)/$', LocationConsumer.as_asgi()),
]
