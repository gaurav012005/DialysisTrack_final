# DialysisTrack — Complete Project Flow & Process

This document covers every flow and process in DialysisTrack from start to finish — how the entire system works together.

---

## TABLE OF CONTENTS

1. [Master System Flow (End-to-End)](#1-master-system-flow-end-to-end)
2. [User Authentication Flow](#2-user-authentication-flow)
3. [Patient Lifecycle Flow](#3-patient-lifecycle-flow)
4. [Queue & Dialysis Session Flow](#4-queue--dialysis-session-flow)
5. [Billing & Payment Flow](#5-billing--payment-flow)
6. [Ambulance & Fleet Flow](#6-ambulance--fleet-flow)
7. [Machine Lifecycle Flow](#7-machine-lifecycle-flow)
8. [Staff Management Flow](#8-staff-management-flow)
9. [Reports & Export Flow](#9-reports--export-flow)
10. [PWA & Offline Flow](#10-pwa--offline-flow)
11. [Role-Based Access Flow](#11-role-based-access-flow)
12. [Data Flow Between Modules](#12-data-flow-between-modules)

---

## 1. Master System Flow (End-to-End)

This is the complete journey of a patient through the DialysisTrack system — from emergency call to final checkout.

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                    COMPLETE DIALYSISTRACK WORKFLOW                          │
 │                                                                             │
 │  PHASE 1: ARRIVAL                                                          │
 │  ┌──────────┐    ┌─────────────┐    ┌──────────────┐    ┌──────────────┐  │
 │  │ Patient  │───►│ Ambulance   │───►│  Reception   │───►│   Patient    │  │
 │  │ Calls /  │    │ Dispatch    │    │  Check-in    │    │ Registration │  │
 │  │ Walks in │    │ (if needed) │    │              │    │  (if new)    │  │
 │  └──────────┘    └─────────────┘    └──────────────┘    └──────┬───────┘  │
 │                                                                 │          │
 │  PHASE 2: QUEUE & SESSION                                       │          │
 │  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │          │
 │  │  Add to      │◄───┤  Appointment │◄───┤  or Direct       │◄─┘          │
 │  │  Queue       │    │  Check-in    │    │  Walk-in/Emerg.  │             │
 │  └──────┬───────┘    └──────────────┘    └──────────────────┘             │
 │         │                                                                  │
 │         ▼                                                                  │
 │  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐             │
 │  │ Wait in      │───►│ Machine      │───►│ Dialysis Session │             │
 │  │ Queue        │    │ Assigned     │    │ Starts           │             │
 │  │ (Priority)   │    │ (Available)  │    │ (Record Vitals)  │             │
 │  └──────────────┘    └──────────────┘    └──────┬───────────┘             │
 │                                                  │                         │
 │  PHASE 3: COMPLETION & BILLING                   │                         │
 │  ┌──────────────┐    ┌──────────────┐    ┌──────▼───────────┐             │
 │  │ Patient      │◄───┤  Payment     │◄───┤ Session Complete │             │
 │  │ Leaves       │    │  (Cash/UPI)  │    │ (Post-Vitals)    │             │
 │  └──────────────┘    └──────────────┘    │ → Auto Bill      │             │
 │                                           └──────────────────┘             │
 └─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 1 — Arrival
1. **Patient contacts hospital** (phone call, walk-in, or emergency)
2. **If ambulance needed** → Receptionist dispatches ambulance → Driver picks up patient → GPS tracked live
3. **Patient arrives** → Receptionist checks them in
4. **New patient?** → Receptionist fills registration form (personal info, medical history, emergency contact)
5. **Existing patient?** → Found by name/ID/phone search

### Phase 2 — Queue & Dialysis
6. **Added to queue** with priority: Emergency (top) > Scheduled > Walk-in
7. **Waits for turn** → Queue shows position and estimated wait time
8. **Machine becomes free** → Nurse assigns patient to machine (e.g., M-001)
9. **Session starts** → Pre-dialysis vitals recorded (BP, heart rate, weight, temperature, SpO2)
10. **During session** → Nurse monitors vitals, records medications, notes complications
11. **Session ends** → Post-dialysis vitals recorded, machine released for cleaning

### Phase 3 — Checkout
12. **Bill auto-generated** → Session cost + Medicine + Consultation + GST (18%)
13. **Payment collected** → Cash at counter OR UPI QR scan OR Card
14. **Receipt generated** → PDF download available
15. **Patient leaves** → Machine marked as cleaning → then available
16. **Audit log** records every action that happened

---

## 2. User Authentication Flow

### 2.1 First-Time Staff Login (with mandatory 2FA setup)

```
User (Staff)                    Frontend (React)                  Backend (Django)
    │                                │                                │
    │  Enter email + password        │                                │
    │ ─────────────────────────────► │                                │
    │                                │  POST /api/auth/login/         │
    │                                │ ─────────────────────────────► │
    │                                │                                │ Verify credentials
    │                                │                                │ Check: is staff?
    │                                │                                │ Check: has 2FA?
    │                                │  {requires_2fa_setup: true}    │ → NO → must setup
    │                                │ ◄───────────────────────────── │
    │  Redirect to 2FA Setup page    │                                │
    │ ◄───────────────────────────── │                                │
    │                                │  POST /api/two-factor/setup/   │
    │  Scan QR code with             │ ─────────────────────────────► │
    │  Google Authenticator          │                                │ Generate TOTP secret
    │                                │  {qr_code: base64, secret}     │ Generate QR as base64
    │                                │ ◄───────────────────────────── │
    │  QR code displayed             │                                │
    │ ◄───────────────────────────── │                                │
    │                                │                                │
    │  Enter 6-digit code from app   │                                │
    │ ─────────────────────────────► │                                │
    │                                │  POST /api/two-factor/         │
    │                                │       verify_setup/            │
    │                                │ ─────────────────────────────► │
    │                                │                                │ Verify TOTP code
    │                                │                                │ Confirm device
    │                                │                                │ Generate 10 backup codes
    │                                │                                │ Set 3 grace logins
    │                                │  {JWT tokens + backup codes}   │
    │                                │ ◄───────────────────────────── │
    │  Login successful!             │                                │
    │  Save backup codes             │                                │
    │ ◄───────────────────────────── │                                │
    │  Redirect to Dashboard         │                                │
```

### 2.2 Regular Staff Login (with 2FA)

```
Login attempt
     │
     ▼
Enter email + password ──► Backend validates credentials
     │                          │
     │                     Is staff? ── NO ──► Return JWT tokens (done)
     │                          │
     │                        YES
     │                          │
     │                     Has 2FA enabled? ── NO ──► Force 2FA setup
     │                          │
     │                        YES
     │                          │
     │                     Grace period active? ── YES ──► Return JWT tokens
     │                          │                          (use 1 grace login)
     │                        NO
     │                          │
     │                     Return: requires_2fa = true
     │                          │
     ▼                          ▼
Enter 6-digit code ─────► Verify TOTP code
     │                          │
     │                     Valid? ── NO ──► Try backup code
     │                          │               │
     │                        YES          Valid? ── NO ──► Error
     │                          │               │
     │                          │             YES
     │                          │               │
     │                     Reset grace to 3 logins
     │                          │
     ▼                          ▼
Dashboard loaded ◄─────── Return JWT tokens + user data
```

### 2.3 Patient Login (No 2FA)

```
Patient enters email + password
     │
     ▼
Backend validates → Not staff → Return JWT tokens directly
     │
     ▼
Redirect to Patient Dashboard (own data only)
```

### 2.4 Token Refresh Flow

```
Frontend makes API call
     │
     ▼
Axios sends request with Access Token
     │
     ▼
Backend returns 401 (token expired)
     │
     ▼
Axios interceptor catches 401
     │
     ▼
Auto-sends Refresh Token to /api/auth/token/refresh/
     │
     ▼
Backend returns new Access Token
     │
     ▼
Original request retried with new token
     │
     ▼
If Refresh Token also expired → Logout user
```

---

## 3. Patient Lifecycle Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  New Patient │────►│ Registration │────►│ Account      │────►│ Active   │
│  Arrives     │     │ Form Filled  │     │ Created      │     │ Patient  │
│              │     │ by Reception │     │ (Optional)   │     │          │
└─────────────┘     └──────────────┘     └──────────────┘     └────┬─────┘
                                                                    │
                    ┌───────────────────────────────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────────────────────────────────┐
    │                     PATIENT ACTIVITIES                           │
    │                                                                  │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
    │  │ Book         │  │ Arrive for   │  │ View Own Records     │  │
    │  │ Appointments │  │ Dialysis     │  │ via Patient Portal   │  │
    │  │ (3 shifts)   │  │ Session      │  │ (Dashboard, Bills,   │  │
    │  │              │  │              │  │  Sessions, Appts)    │  │
    │  └──────────────┘  └──────────────┘  └──────────────────────┘  │
    │                                                                  │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
    │  │ Download PDF │  │ Pay Bills    │  │ Track Ambulance      │  │
    │  │ Reports      │  │ (Cash/UPI)   │  │ (Live GPS)           │  │
    │  └──────────────┘  └──────────────┘  └──────────────────────┘  │
    └──────────────────────────────────────────────────────────────────┘
```

### Patient Registration Data Captured:
- **Personal**: Name, email, phone, DOB, gender, address
- **Medical**: Blood group, diagnosis, allergies, medications, medical history
- **Dialysis**: Dry weight, vascular access type
- **Emergency**: Contact name and phone number
- **Account**: Optional login account created using patient's email

---

## 4. Queue & Dialysis Session Flow

### 4.1 Queue Management Flow

```
┌──────────────┐
│ Patient      │
│ Arrives      │
└──────┬───────┘
       │
       ▼
┌──────────────┐     Priority Assignment:
│ Add to Queue │     🔴 Emergency → Position 1 (top of queue)
│              │     🟡 Scheduled → After emergencies
└──────┬───────┘     🟢 Walk-in   → End of queue
       │
       ▼
┌──────────────┐
│   WAITING    │◄─── Queue Position: #1, #2, #3...
│   Status     │     Wait time displayed
└──────┬───────┘
       │ (Machine becomes available)
       ▼
┌──────────────┐
│ Machine      │     Nurse assigns patient to specific machine
│ Assigned     │     Machine status: Available → In Use
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ IN PROGRESS  │     Timer starts counting
│ Status       │     Pre-dialysis vitals recorded
└──────┬───────┘     Nurse monitors throughout
       │
       │ (Session duration: typically 3-4 hours)
       ▼
┌──────────────┐
│  COMPLETED   │     Post-dialysis vitals recorded
│  Status      │     Machine released → Cleaning
└──────┬───────┘     Bill auto-generated
       │
       ▼
┌──────────────┐
│ Patient      │
│ Checkout     │
└──────────────┘
```

### 4.2 Dialysis Session Recording

```
Session Start                          Session End
─────────────                          ───────────
Pre-Dialysis Vitals:                   Post-Dialysis Vitals:
├── Blood Pressure (systolic/dia)      ├── Blood Pressure
├── Heart Rate (BPM)                   ├── Heart Rate
├── Temperature (°C)                   ├── Temperature
├── SpO2 (%)                           ├── SpO2
├── Pre-Weight (kg)                    ├── Post-Weight (kg)
│                                      │
Dialysis Parameters:                   Completion:
├── Blood Flow Rate (mL/min)           ├── Total Duration (auto-calc)
├── Dialysate Flow Rate                ├── Complications (if any)
├── Heparin Dose (units)               ├── Doctor Notes
├── UF Goal (mL)                       └── Nurse Notes
├── Actual UF Volume (mL)
├── Access Type
└── Medications Administered
```

---

## 5. Billing & Payment Flow

### 5.1 Bill Generation

```
Session Completed
       │
       ▼
┌──────────────────────────────────────────┐
│           AUTO BILL GENERATION            │
│                                          │
│  Session Cost:    ₹2,500  (per session)  │
│  Medicine Cost:   ₹XXX    (variable)     │
│  Consultation:    ₹500    (doctor fee)   │
│  Other Charges:   ₹XXX    (if any)       │
│  ─────────────────────────────────       │
│  Subtotal:        ₹X,XXX                 │
│  GST (18%):       ₹X,XXX                 │
│  Discount:       -₹XXX    (if any)       │
│  ═══════════════════════════════         │
│  TOTAL:           ₹X,XXX                 │
│                                          │
│  Bill Number: DT20260419001 (auto)       │
│  Status: PENDING                         │
└──────────────────┬───────────────────────┘
                   │
                   ▼
         Payment Collection
```

### 5.2 Payment Methods

```
┌──────────────────────────────────────────────────────────────────┐
│                     PAYMENT OPTIONS                               │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │   💵 CASH   │  │   📱 UPI    │  │   💳 CARD   │  │  🏦 NEFT   │ │
│  │            │  │            │  │            │  │            │ │
│  │ Receptionist│ │ QR Code    │  │ Last 4     │  │ Bank       │ │
│  │ collects   │  │ generated  │  │ digits +   │  │ dropdown   │ │
│  │ cash       │  │ Patient    │  │ Bank name  │  │ + NEFT ID  │ │
│  │ Amount     │  │ scans with │  │ 1.8% fee   │  │            │ │
│  │ logged     │  │ GPay/      │  │            │  │            │ │
│  │            │  │ PhonePe    │  │            │  │            │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
│                                                                   │
│  UPI QR Code Generation Flow:                                    │
│  Backend builds: upi://pay?pa=hospital@upi&pn=DialysisTrack     │
│                  &am=3500                                        │
│  Converts to Base64 PNG → Frontend shows as <img> tag            │
│  Patient scans → Amount auto-filled → Payment confirmed          │
└──────────────────────────────────────────────────────────────────┘
```

### 5.3 Bill Status Flow

```
PENDING ──────► PARTIAL ──────► PAID
   │               │
   │               └──────► OVERDUE (after due date)
   │
   └──────────────────────► CANCELLED
```

- **Partial**: Some amount paid, balance remaining
- **Overdue**: Past due date and still unpaid
- **Paid**: Total amount received
- **Cancelled**: Bill voided

---

## 6. Ambulance & Fleet Flow

### 6.1 Dispatch & Tracking Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Emergency│     │ Receptionist │     │  Ambulance   │     │   Driver     │
│ Call     │────►│ Dispatches   │────►│ Status:      │────►│ Gets         │
│ Received │     │ Ambulance    │     │ Available →  │     │ Notification │
└──────────┘     └──────────────┘     │ On Trip      │     └──────┬───────┘
                                      └──────────────┘            │
                                                                   │
    ┌──────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│                    REAL-TIME GPS TRACKING                         │
│                                                                   │
│  Driver Phone                    Hospital Screens                 │
│  ┌──────────┐                    ┌──────────────┐                │
│  │ GPS chip │──► WebSocket ──►   │ Live Map     │                │
│  │ every    │    (ws://host/     │ Marker moves │                │
│  │ 3 sec    │     ws/ride/1/)    │ in real-time │                │
│  └──────────┘         │          └──────────────┘                │
│                       │                                           │
│                  ┌────▼────┐                                     │
│                  │  Redis  │ Broadcasts to all connected         │
│                  │ Pub/Sub │ browsers (receptionist, patient)    │
│                  └─────────┘                                     │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Ride Status Transitions

```
ASSIGNED ──────► EN_ROUTE ──────► ARRIVED ──────► COMPLETED
    │               │               │                  │
    │               │               │                  └──► Ambulance → Available
    └───────────────┴───────────────┘
              (can be CANCELLED at any point)
```

| Status | What Happens | Who Updates |
|--------|-------------|-------------|
| **Assigned** | Ambulance dispatched, driver notified | Receptionist |
| **En Route** | Driver is on the way, GPS tracking active | Driver |
| **Arrived** | Driver reached pickup location | Driver |
| **Completed** | Patient picked up, ride finished, ambulance freed | Driver |
| **Cancelled** | Ride cancelled, ambulance freed | Receptionist/Driver |

---

## 7. Machine Lifecycle Flow

```
┌───────────────────────────────────────────────────────────────────┐
│                    MACHINE STATUS LIFECYCLE                        │
│                                                                   │
│               ┌──────────┐                                       │
│      ┌───────►│AVAILABLE │◄──────────────────┐                   │
│      │        │ (Green)  │                   │                   │
│      │        └────┬─────┘                   │                   │
│      │             │                         │                   │
│      │    Patient  │ Assigned            Cleaning                │
│      │    Released │                     Complete                │
│      │             ▼                         │                   │
│      │        ┌──────────┐            ┌──────────┐              │
│      │        │  IN USE  │───────────►│ CLEANING │              │
│      │        │  (Blue)  │  Session   │ (Yellow) │              │
│      │        └──────────┘  Complete  └──────────┘              │
│      │                                                           │
│      │        ┌──────────────┐                                   │
│      └────────┤ MAINTENANCE  │◄──── Scheduled or breakdown      │
│    Repair     │  (Orange)    │                                   │
│    Complete   └──────────────┘                                   │
│                                                                   │
│               ┌────────────────┐                                 │
│               │ OUT OF SERVICE │◄── Major breakdown / retired    │
│               │    (Red)       │                                 │
│               └────────────────┘                                 │
│                                                                   │
│  Tracked per machine:                                            │
│  - Total sessions run                                            │
│  - Total operating hours (auto-calculated)                       │
│  - Last maintenance date                                         │
│  - Maintenance logs (technician, cost, parts, test results)      │
│  - Cleaning logs (agent, concentration, bacterial count)         │
└───────────────────────────────────────────────────────────────────┘
```

---

## 8. Staff Management Flow

### 8.1 Staff Account Lifecycle

```
Admin creates staff account
       │
       ▼
┌──────────────┐
│ Account      │  Email, Password, Role, Department assigned
│ Created      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ First Login  │  Must set up 2FA (mandatory, no skip)
│ → 2FA Setup  │  Scan QR with Google Authenticator
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Active Staff │  Can perform role-specific tasks
│ Member       │  2FA grace period: 3 logins without code
└──────┬───────┘
       │
       ▼ (if needed)
┌──────────────┐
│ Deactivated  │  Admin unchecks "Is Active"
│              │  Staff cannot login anymore
└──────────────┘
```

### 8.2 Staff Daily Workflow

```
Staff Login (with 2FA)
       │
       ▼
┌──────────────────────────────────────────────────┐
│              CHECK DAILY SCHEDULE                  │
│                                                   │
│  Shifts:                                         │
│  ├── Morning:  6:00 AM – 2:00 PM                │
│  ├── Evening:  2:00 PM – 10:00 PM               │
│  └── Night:    10:00 PM – 6:00 AM               │
│                                                   │
│  Actions:                                        │
│  ├── Check-in (records attendance)               │
│  ├── Perform role-specific duties                │
│  ├── Request Leave (if needed)                   │
│  │    └── Pending → Approved / Rejected          │
│  └── Check-out (records work hours)              │
└──────────────────────────────────────────────────┘
```

---

## 9. Reports & Export Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      REPORTS MODULE                               │
│                                                                   │
│  Dashboard Stats (Real-time):                                    │
│  ├── Total Patients        ├── Queue Count                       │
│  ├── Active Sessions       ├── Available Machines                │
│  ├── Today's Appointments  └── Revenue Today                    │
│                                                                   │
│  Report Types:                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Patient Report  │  │ Queue Report    │  │ Machine Report  │ │
│  │ - All patients  │  │ - Wait times    │  │ - Utilization   │ │
│  │ - Emergency     │  │ - Session count │  │ - Maintenance   │ │
│  │ - Active only   │  │ - Emergency     │  │ - Per-machine   │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                     │           │
│           └────────────────────┼─────────────────────┘           │
│                                │                                 │
│  Export Formats:               ▼                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ 📄 CSV   │  │ 📊 Excel │  │ 📋 PDF   │                      │
│  │(built-in)│  │(openpyxl)│  │(ReportLab)│                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
│                                                                   │
│  Additional Reports:                                             │
│  ├── Staff Attendance (present/absent/late rate)                 │
│  └── Financial Report (revenue, pending, overdue)               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 10. PWA & Offline Flow

### 10.1 PWA Installation

```
User opens DialysisTrack in Chrome/Edge
       │
       ▼
Service Worker registers automatically
       │
       ▼
Browser detects: App is installable (has manifest + SW)
       │
       ▼
InstallPrompt.jsx shows "Install DialysisTrack" banner
       │
       ├── User clicks "Install" → App installed on device
       │   └── Opens in standalone window (no browser bar)
       │
       └── User dismisses → Banner hidden for 7 days
```

### 10.2 Offline Handling

```
User is Online                          User Goes Offline
─────────────                           ──────────────────
All features work                       OfflineBanner.jsx shows
normally                                "You are offline ⚠️"
       │                                       │
       │                                       ▼
       │                                Cached pages still load
       │                                (HTML, CSS, JS from Service Worker)
       │                                       │
       │                                       ▼
       │                                API calls fail gracefully
       │                                (no new data, no saves)
       │                                       │
       │                                       ▼
       │                                User comes back online
       │                                       │
       ▼                                       ▼
Network restored ◄──────────────────── Banner auto-hides
All features resume                     Data refreshes
```

### 10.3 Cache Strategy

| Resource Type | Strategy | Behavior |
|---------------|----------|----------|
| HTML, CSS, JS | Cache First | Loads from cache instantly, updates in background |
| API responses | Network First | Tries server first, falls back to cached (5 min) |
| Images, icons | Cache First | Cached after first load |
| Failed requests | Offline Fallback | Shows friendly offline page |

---

## 11. Role-Based Access Flow

### What Each Role Can Do

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   ADMIN ─────── Full access to everything                               │
│   │              Dashboard, Patients, Queue, Sessions, Machines,        │
│   │              Staff, Billing, Reports, Fleet, Django Admin Panel     │
│   │                                                                     │
│   ├── DOCTOR ── Patients, Queue, Sessions, Reports                     │
│   │              (view + manage, but NO staff/billing/machines)         │
│   │                                                                     │
│   ├── NURSE ─── Queue (full), Patients (view/update), Sessions,        │
│   │              Machines (view only)                                   │
│   │                                                                     │
│   ├── TECHNICIAN ── Machines (full), Maintenance logs,                 │
│   │                  Queue (view only)                                  │
│   │                                                                     │
│   ├── RECEPTIONIST ── Patients, Appointments, Billing (full),          │
│   │                    Fleet (dispatch)                                 │
│   │                                                                     │
│   ├── PATIENT ── Own records only (appointments, sessions, bills)      │
│   │              Via Patient Dashboard / Patient Portal                 │
│   │                                                                     │
│   └── DRIVER ── Own ambulance rides only                               │
│                  Driver Dashboard (mobile-friendly)                     │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

### How RBAC Is Enforced

```
API Request arrives
       │
       ▼
JWT Token extracted from Authorization header
       │
       ▼
Token decoded → User ID + Role identified
       │
       ▼
HospitalRolePermission class checks:
"Can a [role] do [action] on [module]?"
       │
       ├── YES → Process request
       │
       └── NO  → Return 403 Forbidden
```

**Frontend also enforces:** Sidebar menu items are filtered by role. Unauthorized routes redirect to dashboard.

---

## 12. Data Flow Between Modules

### How Modules Connect

```
                              ┌──────────┐
                              │  USERS   │
                              │(Auth+RBAC│
                              └────┬─────┘
                                   │ Authentication for all modules
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
    ┌─────▼─────┐           ┌─────▼─────┐           ┌─────▼─────┐
    │ PATIENTS  │◄─────────►│   QUEUE   │◄─────────►│ MACHINES  │
    │           │ Patient   │           │ Machine    │           │
    │ Records   │ added to  │ Sessions  │ assigned   │ Status    │
    └─────┬─────┘ queue     └─────┬─────┘ to queue   └─────┬─────┘
          │                       │                        │
          │                       │ Session                │
          │                       │ completed              │ Maintenance
          │                  ┌────▼────┐                   │ logged
          │                  │ BILLING │                   │
          │                  │         │              ┌────▼────┐
          │                  │ Auto-   │              │  STAFF  │
          │                  │ generate│              │Schedule │
          │                  │ bill    │              │Attendance│
          │                  └────┬────┘              └─────────┘
          │                       │
    ┌─────▼─────┐           ┌────▼────┐
    │APPOINTMENT│           │ REPORTS │◄──── Aggregates from ALL modules
    │ Scheduling│           │ Stats   │
    └───────────┘           │ Exports │
                            └─────────┘
          │
    ┌─────▼─────┐           ┌─────────┐
    │   FLEET   │           │  2FA    │◄──── Applied to Users module
    │ Ambulance │           │Security │
    │ GPS Track │           └─────────┘
    └───────────┘
          │
    ┌─────▼─────┐
    │AUDIT LOGS │◄──── Records actions from ALL modules
    │Notifications│
    └───────────┘
```

### Key Data Dependencies

| When This Happens... | These Modules Are Affected |
|---------------------|--------------------------|
| New patient registered | `patients` → optional `users` (account creation) |
| Patient added to queue | `queue` → `patients` (patient data) |
| Machine assigned to patient | `queue` → `machines` (status → In Use) |
| Session completed | `queue` → `machines` (→ Cleaning) → `billing` (auto-bill) |
| Payment received | `billing` → `billing_payment` (record) → `audit_log` |
| Ambulance dispatched | `fleet` → `patients` (pickup) → `users` (driver) |
| Staff logs in | `users` → `two_factor` (2FA check) → `audit_log` |
| Report generated | `reports` ← `patients` + `queue` + `machines` + `billing` + `staff` |

---

## Summary: All Features at a Glance

| # | Feature | Status | Backend | Frontend | Real-time |
|---|---------|--------|---------|----------|-----------|
| 1 | Patient Management (CRUD) | ✅ | Django ViewSet | React Pages | No |
| 2 | Appointment Scheduling (3 shifts) | ✅ | Django ViewSet | Calendar UI | No |
| 3 | Queue Management (priority-based) | ✅ | Django ViewSet | Queue Cards | Auto-refresh |
| 4 | Dialysis Session Recording (vitals) | ✅ | Django ViewSet | Session Forms | No |
| 5 | Machine Tracking (5 statuses) | ✅ | Django ViewSet | Machine Cards | Auto-refresh |
| 6 | Billing + GST (auto-calculate) | ✅ | Django ViewSet | Billing Page | No |
| 7 | Payment (Cash, UPI QR, Card, NEFT) | ✅ | PaymentService | Payment Forms | No |
| 8 | Staff Management (schedule, attendance) | ✅ | Django ViewSet | Staff Page | No |
| 9 | Reports (CSV, Excel, PDF export) | ✅ | Django ViewSet | Reports Page | No |
| 10 | JWT Authentication | ✅ | SimpleJWT | AuthContext | Auto-refresh |
| 11 | Two-Factor Authentication (TOTP) | ✅ | django-otp | 2FA Setup/Verify | No |
| 12 | Role-Based Access (7 roles) | ✅ | Permissions | RoleGuard | No |
| 13 | Ambulance Dispatch | ✅ | Django ViewSet | Fleet Page | No |
| 14 | Live GPS Tracking | ✅ | Django Channels | WebSocket Map | ✅ WebSocket |
| 15 | UPI QR Code Payment | ✅ | python-qrcode | Inline Image | No |
| 16 | PWA (Install + Offline) | ✅ | — | Service Worker | No |
| 17 | Dark/Light Theme | ✅ | — | ThemeContext + CSS | No |
| 18 | ChatBot | ✅ | — | ChatBot.jsx | No |
| 19 | PDF Download (reports, receipts) | ✅ | ReportLab | Download button | No |
| 20 | Audit Logging | ✅ | Django Signals | — | No |
| 21 | Patient Portal (own data) | ✅ | Dashboard API | PatientDashboard | No |
| 22 | Maintenance & Cleaning Logs | ✅ | Django ViewSet | Machine Detail | No |
| 23 | Leave Request System | ✅ | Django ViewSet | Staff Page | No |
| 24 | Micro-animations | ✅ | — | Framer Motion | No |
| 25 | Accessibility (a11y) | ✅ | — | CSS + Utils | No |

**Total: 25 features across 12 backend modules and 37 frontend components.**
