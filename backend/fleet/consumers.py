import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import AmbulanceRide

logger = logging.getLogger(__name__)


class LocationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time GPS location broadcasting."""

    async def connect(self):
        self.ride_id = self.scope['url_route']['kwargs']['ride_id']
        self.room_group_name = f'ride_{self.ride_id}'

        # Join ride group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            # Leave ride group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Receive location data from driver and broadcast to all watchers."""
        try:
            data = json.loads(text_data)
            lat = data.get('lat')
            lng = data.get('lng')
            ride_status = data.get('status')

            # Validate lat/lng
            if lat is not None and lng is not None:
                try:
                    lat = float(lat)
                    lng = float(lng)
                except (ValueError, TypeError):
                    await self.send(text_data=json.dumps({'error': 'Invalid coordinate format'}))
                    return

                if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
                    await self.send(text_data=json.dumps({'error': 'Coordinates out of range'}))
                    return

                # Save to database
                await self.save_location(lat, lng)

            # Broadcast to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'location_update',
                    'lat': lat,
                    'lng': lng,
                    'status': ride_status,
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON'}))
        except Exception:
            logger.exception('WebSocket receive error for ride %s', getattr(self, 'ride_id', 'unknown'))
            await self.send(text_data=json.dumps({'error': 'An error occurred'}))

    async def location_update(self, event):
        """Send location update to WebSocket client."""
        await self.send(text_data=json.dumps({
            'lat': event['lat'],
            'lng': event['lng'],
            'status': event.get('status'),
        }))

    @database_sync_to_async
    def save_location(self, lat, lng):
        """Persist latest driver coordinates to the database."""
        try:
            ride = AmbulanceRide.objects.get(id=self.ride_id)
            ride.driver_lat = lat
            ride.driver_lng = lng
            ride.save(update_fields=['driver_lat', 'driver_lng', 'updated_at'])
        except AmbulanceRide.DoesNotExist:
            pass

