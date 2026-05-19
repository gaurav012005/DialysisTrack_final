# QR Code Payment Gateway Setup

## Installation

### Backend:
```bash
cd backend
pip install qrcode==7.4.2
```

### Configuration:

Edit `backend/billing/upi_qr.py` and update:
```python
HOSPITAL_UPI_ID = "yourhospital@paytm"  # Your hospital's UPI ID
HOSPITAL_NAME = "Your Hospital Name"
```

## Features Added:

✅ **QR Code Generation** - Generate UPI QR codes for payments
✅ **Scan & Pay** - Patients can scan QR code with any UPI app
✅ **Manual UPI** - Option to enter UPI ID manually
✅ **Real-time QR** - QR code generated with bill details

## How to Use:

1. **For Staff:**
   - Go to Billing page
   - Select patient bill
   - Click "Pay Now"
   - Choose "UPI/Scanner"
   - Click "Generate QR Code to Scan"
   - Show QR code to patient
   - Patient scans with PhonePe/GPay/Paytm
   - Confirm payment received

2. **For Patients:**
   - Open any UPI app (PhonePe, GPay, Paytm, BHIM)
   - Scan the QR code shown on screen
   - Verify amount and hospital name
   - Enter UPI PIN
   - Payment done!

## Supported UPI Apps:
- PhonePe
- Google Pay (GPay)
- Paytm
- BHIM
- Amazon Pay
- WhatsApp Pay
- Any UPI-enabled app

## Configuration:

Update your hospital's UPI ID in:
`backend/billing/upi_qr.py`

```python
HOSPITAL_UPI_ID = "hospital@paytm"  # Change this
HOSPITAL_NAME = "DialysisTrack Hospital"  # Change this
```

## API Endpoint:

**Generate QR Code:**
```
POST /api/billing/payments/generate_qr_code/
{
  "amount": 2500,
  "bill_number": "DT20250107001"
}
```

**Response:**
```json
{
  "success": true,
  "qr_code": "data:image/png;base64,...",
  "upi_id": "hospital@paytm",
  "amount": 2500,
  "hospital_name": "DialysisTrack Hospital"
}
```

## Benefits:

✅ **Fast** - Instant payment confirmation
✅ **Secure** - UPI encrypted transactions
✅ **Easy** - Just scan and pay
✅ **No Cash** - Contactless payment
✅ **Track** - All payments recorded
✅ **Receipt** - Auto-generated receipts

Done! 🎉
