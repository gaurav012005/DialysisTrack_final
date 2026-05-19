"""
Razorpay Payment Gateway Service — Test Mode Integration
=========================================================
Wraps the official razorpay Python SDK for:
  • Creating orders (server-side, required before checkout)
  • Verifying payment signatures (HMAC SHA-256)
  • Fetching payment details from Razorpay API

Test keys (rzp_test_*) ensure NO real money is charged.
"""

import logging
import razorpay
from django.conf import settings

logger = logging.getLogger(__name__)

# ── Initialise Razorpay client ────────────────────────────────────────────────
_client = None


def _get_client():
    """Lazy-initialise and cache the Razorpay client."""
    global _client
    if _client is None:
        key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')
        if not key_id or not key_secret:
            raise RuntimeError(
                'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in settings / .env'
            )
        _client = razorpay.Client(auth=(key_id, key_secret))
        _client.set_app_details({"title": "DialysisTrack", "version": "1.0"})
        logger.info("Razorpay client initialised (test_mode=%s)", settings.RAZORPAY_TEST_MODE)
    return _client


# ── Create Order ──────────────────────────────────────────────────────────────

def create_razorpay_order(amount_inr, bill_number='', patient_name='', notes=''):
    """
    Create a Razorpay order.

    Parameters
    ----------
    amount_inr : float
        Amount in Indian Rupees (e.g. 2500.00).
    bill_number : str
        Receipt reference shown on Razorpay dashboard.
    patient_name : str
        For Razorpay order notes.
    notes : str
        Extra description.

    Returns
    -------
    dict  –  { success, order_id, amount (paise), currency, key_id }
    """
    try:
        client = _get_client()
        amount_paise = int(round(float(amount_inr) * 100))

        order_data = {
            'amount': amount_paise,
            'currency': 'INR',
            'receipt': (bill_number or 'receipt')[:40],
            'notes': {
                'bill_number': bill_number or '',
                'patient_name': patient_name or '',
                'description': notes or 'DialysisTrack Bill Payment',
            },
        }

        order = client.order.create(data=order_data)
        logger.info("Razorpay order created: %s for ₹%.2f", order['id'], amount_inr)

        return {
            'success': True,
            'order_id': order['id'],
            'amount': amount_paise,
            'currency': 'INR',
            'key_id': settings.RAZORPAY_KEY_ID,
        }

    except Exception as e:
        logger.exception("Failed to create Razorpay order")
        return {'success': False, 'error': str(e)}


# ── Verify Payment Signature ─────────────────────────────────────────────────

def verify_razorpay_payment(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    """
    Verify payment using HMAC-SHA256 signature.

    Razorpay signs  ``order_id + "|" + payment_id``  with your secret key.
    This function checks the client-provided signature matches.

    Returns
    -------
    dict  –  { success: bool, verified: bool | error: str }
    """
    try:
        client = _get_client()
        params = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature,
        }
        # Raises SignatureVerificationError on failure
        client.utility.verify_payment_signature(params)
        logger.info("Razorpay payment verified: %s", razorpay_payment_id)
        return {'success': True, 'verified': True}

    except razorpay.errors.SignatureVerificationError:
        logger.warning("Signature verification FAILED for payment %s", razorpay_payment_id)
        return {'success': False, 'error': 'Payment signature verification failed'}

    except Exception as e:
        logger.exception("Razorpay verification error")
        return {'success': False, 'error': str(e)}


# ── Fetch Payment Details ─────────────────────────────────────────────────────

def fetch_payment_details(razorpay_payment_id):
    """
    Fetch payment details from Razorpay API (optional, for receipts / admin).
    """
    try:
        client = _get_client()
        payment = client.payment.fetch(razorpay_payment_id)
        return {'success': True, 'payment': payment}
    except Exception as e:
        logger.exception("Failed to fetch Razorpay payment details")
        return {'success': False, 'error': str(e)}
