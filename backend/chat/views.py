"""
DialysisTrack AI Chat — Groq Free API
Dialysis-only system prompt keeps answers on topic.
"""
import logging
import requests
from datetime import date
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

# ── Daily request counter (resets automatically each day) ─────────────────────
_counter = {'date': None, 'count': 0}
DAILY_LIMIT = 14400
WARN_AT = 11000

def _get_daily_count():
    today = date.today()
    if _counter['date'] != today:
        _counter['date'] = today
        _counter['count'] = 0
    _counter['count'] += 1
    return _counter['count']

SYSTEM_PROMPT = """
You are DialysisBot, an AI assistant embedded inside DialysisTrack — a hospital
management system for dialysis clinics.

STRICT RULES:
1. ONLY answer questions about:
   - Dialysis (hemodialysis, peritoneal dialysis, CRRT)
   - Kidney disease (CKD, ESRD, AKI)
   - Patient diet and fluid restrictions for kidney patients
   - Lab values: Kt/V, URR, creatinine, BUN, potassium, phosphorus, hemoglobin
   - Medications used in dialysis: EPO, iron, phosphate binders, antihypertensives
   - Vascular access: AV fistula, catheter, graft
   - DialysisTrack system features: How to book an appointment, billing, scheduling, queue management, patients portal, and ambulance tracking
   - Dialysis machine operation and care
   
   If the user asks how to book an appointment, tell them they can do it through the "Appointments" module in the left sidebar, where they can click "Schedule New" to select a date, time, and patient.

2. If asked ANYTHING else (sports, movies, coding, politics, weather, jokes, etc.),
   respond ONLY with:
   "I'm DialysisBot and I only help with dialysis and kidney care topics.
   Please ask me about dialysis, kidney disease, or the DialysisTrack system."

3. Keep answers clear and concise. Use bullet points.
4. Always recommend consulting a nephrologist for personal medical decisions.
5. Be professional and helpful.
"""


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dialysis_chat(request):
    """
    POST /api/chat/
    Body: { "message": "...", "history": [...] }
    """
    message = request.data.get('message', '').strip()
    history = request.data.get('history', [])

    if not message:
        return Response({'success': False, 'error': 'Message cannot be empty'}, status=400)

    if len(message) > 1000:
        return Response({'success': False, 'error': 'Message too long (max 1000 chars)'}, status=400)

    api_key = getattr(settings, 'GROQ_API_KEY', '').strip()
    if not api_key:
        return Response(
            {'success': False, 'error': 'AI not configured. Add GROQ_API_KEY to .env (free at console.groq.com)'},
            status=503
        )

    # Build messages list
    messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]
    for msg in history[-10:]:
        if msg.get('role') in ('user', 'assistant') and msg.get('content'):
            messages.append({'role': msg['role'], 'content': msg['content']})
    messages.append({'role': 'user', 'content': message})

    try:
        res = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            json={
                'model': 'llama-3.1-8b-instant',
                'messages': messages,
                'max_tokens': 512,
                'temperature': 0.7,
            },
            timeout=30
        )

        if res.status_code != 200:
            logger.error(f"Groq error: {res.status_code} — {res.text}")
            return Response({'success': False, 'error': 'AI service error. Try again.'}, status=503)

        reply = res.json()['choices'][0]['message']['content'].strip()

        # Check if approaching daily limit
        daily_count = _get_daily_count()
        warning = None
        if daily_count >= WARN_AT:
            remaining = DAILY_LIMIT - daily_count
            warning = (
                f"⚠️ Daily AI limit alert: {daily_count:,} of {DAILY_LIMIT:,} requests used today. "
                f"Only ~{max(remaining, 0):,} requests remaining. "
                f"Limit resets at midnight."
            )

        return Response({'success': True, 'reply': reply, 'warning': warning})

    except requests.Timeout:
        return Response({'success': False, 'error': 'AI timed out. Please try again.'}, status=504)
    except Exception as e:
        logger.exception("Chat error")
        return Response({'success': False, 'error': str(e)}, status=500)
