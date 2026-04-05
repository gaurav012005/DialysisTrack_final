# Backend: Billing Module (`billing/`)

## 📁 Folder Structure

```
billing/
├── __init__.py
├── models.py              # Bill, Payment, InsuranceProvider, PatientInsurance models
├── views.py               # Billing CRUD, payment processing, QR code generation
├── serializers.py         # Billing data serialization
├── services.py            # PaymentService - multi-method payment processing
├── simple_payment.py      # Simplified cash payment endpoint
├── upi_qr.py             # UPI QR code generation
├── urls.py                # URL routing
├── apps.py                # Django app configuration
├── admin.py               # Django admin registration
├── tests.py               # Unit tests (11,400+ bytes)
└── migrations/            # Database migrations
```

---

## 🔧 How It Works

### 1. Data Models (`models.py`)

#### a) Bill Model

| Field | Type | Description |
|-------|------|-------------|
| `bill_number` | CharField (unique) | Auto-generated bill number (e.g., `DT20250315422`) |
| `patient` | ForeignKey → Patient | Patient this bill belongs to |
| `appointment` | ForeignKey → Appointment | Linked appointment (optional) |
| `dialysis_sessions` | IntegerField | Number of sessions billed |
| `session_cost` | DecimalField (default ₹2,500) | Cost per session |
| `medicine_cost` | DecimalField | Cost of medicines |
| `consultation_cost` | DecimalField (default ₹500) | Consultation fee |
| `other_charges` | DecimalField | Additional charges |
| `subtotal` | DecimalField | Auto-calculated subtotal |
| `discount` | DecimalField | Discount applied |
| `tax_amount` | DecimalField | Auto-calculated 18% GST |
| `total_amount` | DecimalField | Final total after tax & discount |
| `paid_amount` | DecimalField | Amount paid so far |
| `status` | CharField (choices) | `pending`, `paid`, `partial`, `overdue`, `cancelled` |
| `due_date` | DateField | Payment due date |

**Auto-calculation on save:**
```python
def save(self, *args, **kwargs):
    self.subtotal = (sessions * session_cost) + medicine + consultation + other
    self.tax_amount = subtotal * 0.18  # 18% GST 
    self.total_amount = subtotal + tax - discount
    if not self.bill_number:
        self.bill_number = f"DT{datetime.now().strftime('%Y%m%d')}{random_num}"
    super().save()
```

#### b) Payment Model

| Field | Type | Description |
|-------|------|-------------|
| `bill` | ForeignKey → Bill | Bill this payment is for |
| `payment_id` | CharField (unique) | Auto-generated payment ID |
| `amount` | DecimalField | Payment amount |
| `payment_method` | CharField (choices) | `cash`, `upi` |
| `status` | CharField (choices) | `pending`, `completed`, `failed`, `refunded` |
| `transaction_id` | CharField | Transaction reference |
| `reference_number` | CharField | Bank reference number |
| `bank_name` | CharField | Bank name |
| `upi_id` | CharField | UPI ID used |
| `card_last_four` | CharField | Last 4 digits of card |
| `processing_fee` | DecimalField | Payment processing fee |
| `gateway_response` | JSONField | Full gateway response JSON |
| `processed_by` | ForeignKey → User | Staff who processed payment |

#### c) InsuranceProvider Model

| Field | Type | Description |
|-------|------|-------------|
| `name` | CharField | Insurance company name |
| `policy_prefix` | CharField | Policy number prefix |
| `contact_number` | CharField | Contact phone |
| `email` | EmailField | Contact email |
| `coverage_percentage` | DecimalField (default 80%) | Coverage percentage |

#### d) PatientInsurance Model

Links patients to their insurance providers with policy details.

---

### 2. Payment Service (`services.py`)

The `PaymentService` class is a **272-line** comprehensive payment processing engine.

**Supported Payment Methods:**

| Method | Transaction ID Prefix | Fee |
|--------|----------------------|-----|
| UPI | `UPI` | Free (< ₹2,000), 0.5% max ₹15 (> ₹2,000) |
| Card | `CRD` | 1.8% |
| Net Banking | `NBK` | ₹5 (< ₹1,000) / ₹10 (≥ ₹1,000) |
| NEFT | `NFT` | ₹2.50 |
| RTGS | `RTG` | ₹25 (< ₹2,00,000) / ₹50 (≥ ₹2,00,000) |
| Cash | `CSH` | Free |
| Cheque | `CHQ` | Free |

**UPI ID Validation:**
```python
def validate_upi_id(upi_id):
    # Must contain @, valid providers: paytm, phonepe, gpay, bhim, ybl, ibl, axl
    # Username must be 3+ characters
```

**Supported UPI Providers:** PhonePe, Google Pay, Paytm, BHIM UPI

**Supported Banks (Net Banking):** SBI, HDFC, ICICI, Axis, PNB, BOB, Canara, Union Bank

**Bill Auto-Update:**
After every payment, the system recalculates bill status:
```python
def update_bill_status(bill):
    total_paid = bill.payments.filter(status='completed').aggregate(total=Sum('amount'))
    bill.paid_amount = total_paid
    if total_paid >= bill.total_amount:
        bill.status = 'paid'
    elif total_paid > 0:
        bill.status = 'partial'
    else:
        bill.status = 'pending'
```

**Receipt Generation:**
```python
def generate_receipt(payment):
    return {
        'receipt_id': f"RCP{payment.id:06d}",
        'payment_id', 'transaction_id', 'bill_number',
        'patient_name', 'amount', 'payment_method',
        'payment_date', 'processed_by', 'status', 'fee'
    }
```

---

### 3. Billing Views (`views.py`)

#### a) BillViewSet

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| List bills | GET | `/api/billing/bills/` | Filterable by status, patient |
| Create bill | POST | `/api/billing/bills/` | Create new bill |
| Dashboard stats | GET | `/api/billing/bills/dashboard_stats/` | Total pending, overdue, today/monthly collections |
| Generate receipt | POST | `/api/billing/bills/{id}/generate_receipt/` | Generate bill receipt data |

#### b) PaymentViewSet

| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Quick payment | POST | `/api/billing/payments/quick_payment/` | Walk-in: create bill + process payment |
| Process UPI | POST | `/api/billing/payments/process_upi_payment/` | Process UPI payment |
| Generate QR | POST | `/api/billing/payments/generate_qr_code/` | Generate UPI QR code (base64) |
| Process card | POST | `/api/billing/payments/process_card_payment/` | Process card payment |
| Process net banking | POST | `/api/billing/payments/process_netbanking_payment/` | Process net banking |
| Process cash | POST | `/api/billing/payments/process_cash_payment/` | Record cash payment |
| Payment receipt | GET | `/api/billing/payments/{id}/generate_receipt/` | Generate payment receipt |
| Method stats | GET | `/api/billing/payments/payment_methods_stats/` | Stats by payment method |

#### c) InsuranceProviderViewSet / PatientInsuranceViewSet

Standard CRUD for managing insurance providers and patient insurance records.

---

### 4. URL Routing (`urls.py`)

```python
router.register(r'bills', BillViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'insurance-providers', InsuranceProviderViewSet)
router.register(r'patient-insurance', PatientInsuranceViewSet)
# Extra: /api/billing/simple-cash-payment/
```

---

### 5. Key Features

- **Multi-method payment processing** (UPI, Card, Net Banking, Cash, NEFT, RTGS, Cheque)
- **Automatic bill calculations** (subtotal, 18% GST, discount, total)
- **UPI QR code generation** with base64 image response
- **Quick payment** for walk-in patients (creates bill + payment in one step)
- **Real-time bill status updates** (pending → partial → paid)
- **Payment fee calculation** per method
- **UPI ID validation**
- **Insurance management** with coverage tracking
- **Dashboard statistics** (pending, overdue, daily/monthly collections)
