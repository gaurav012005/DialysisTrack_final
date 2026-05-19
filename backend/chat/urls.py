from django.urls import path
from .views import dialysis_chat

urlpatterns = [
    path('', dialysis_chat, name='dialysis-chat'),
]
