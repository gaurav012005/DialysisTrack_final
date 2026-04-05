# Frontend: Billing & Payments (`BillingPage.jsx`, `BillingDashboard.jsx`, `PaymentForm.jsx`, `RealPaymentForm.jsx`)

## 📁 Related Files

```
src/
├── pages/
│   ├── BillingPage.jsx            # Billing management page (10.2KB)
│   ├── BillingDashboard.jsx       # Billing statistics dashboard (8.3KB)
│   └── TestBilling.jsx            # Test billing component (519B)
└── components/
    ├── PaymentForm.jsx            # Standard payment form (9.3KB)
    └── RealPaymentForm.jsx        # Full payment form with UPI/Card/Cash (18.5KB)
```

---

## 🔧 How It Works

### 1. Billing Page (`pages/BillingPage.jsx`)

Full billing management interface for creating and managing bills.

**What It Shows:**
- **Bills list** with patient name, bill number, amounts, status
- **Filter** by status (pending, paid, partial, overdue)
- **Create new bill** form
- **Payment actions** per bill
- **Color-coded statuses:**
  - Pending (yellow)
  - Partial (orange)
  - Paid (green)
  - Overdue (red)

**Bill Creation Form:**
- Patient selector
- Number of dialysis sessions
- Session cost (default ₹2,500)
- Medicine cost
- Consultation fee (default ₹500)
- Other charges
- Discount
- Due date
- Auto-calculates: Subtotal, GST (18%), Total

### 2. Billing Dashboard (`pages/BillingDashboard.jsx`)

Financial overview with statistics.

**What It Shows:**
- **Total pending** amount
- **Total overdue** amount
- **Today's collections**
- **Monthly collections**
- **Recent bills** list
- **Payment method distribution** (pie chart / stats)

**API Calls:**
```javascript
GET /api/billing/bills/dashboard_stats/              → Dashboard stats
GET /api/billing/payments/payment_methods_stats/     → Payment method stats
GET /api/billing/bills/                              → Bills list
```

### 3. Payment Form (`components/PaymentForm.jsx`)

Standard payment form for recording payments:

| Field | Description |
|-------|-------------|
| Bill | Select bill to pay |
| Amount | Payment amount |
| Payment Method | Cash / UPI |
| UPI ID | Required for UPI payments |
| Notes | Payment notes |

### 4. Real Payment Form (`components/RealPaymentForm.jsx`)

A comprehensive **18.5KB** payment form supporting all payment methods.

**Payment Method Tabs:**

#### 💰 Cash Payment
- Amount field
- Processed by (auto-set to current user)
- Notes
- API: `POST /api/billing/payments/process_cash_payment/`

#### 📱 UPI Payment
- Amount field
- UPI ID field (e.g., `user@paytm`)
- **QR Code generation** — calls API to generate UPI QR code
- Displays QR code image for scanning
- Hospital UPI ID display
- API: `POST /api/billing/payments/process_upi_payment/`
- QR API: `POST /api/billing/payments/generate_qr_code/`

#### 💳 Card Payment
- Amount field
- Card last four digits
- Bank name
- Card type (Debit/Credit)
- API: `POST /api/billing/payments/process_card_payment/`

#### 🏦 Net Banking
- Amount field
- Bank selection (SBI, HDFC, ICICI, Axis, PNB, BOB, Canara, Union Bank)
- API: `POST /api/billing/payments/process_netbanking_payment/`

**Quick Payment (Walk-in):**
- Creates bill + processes payment in one step
- API: `POST /api/billing/payments/quick_payment/`

**Post-Payment Display:**
- Transaction ID
- Payment ID
- Processing fee (if any)
- Success/failure status
- Receipt download option

---

## 🔑 Key Features

- **Multi-method payments** (Cash, UPI, Card, Net Banking)
- **UPI QR code generation** inline
- **Auto-calculation** of subtotal, GST, total
- **Quick payment** for walk-in patients
- **Real-time status tracking** (pending → partial → paid)
- **Financial dashboard** with collection statistics
- **Receipt generation** per payment
- **Payment method analytics** (stats by method)
