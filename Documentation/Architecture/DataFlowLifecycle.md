# The Real-Time Data Flow: Patient Lifecycle

This document breaks down the end-to-end journey of a patient from their home to the dialysis machine, and finally checking out at the reception.

## Phase 1: Emergency Trigger & Dispatch

### The Incident
- Data Flow Starts: A critical patient contacts the hospital.
- **Receptionist (UI):** Navigates to `/ambulance` -> Selects Patient -> Clicks `Dispatch`.
- **Backend API (`POST /api/fleet/dispatch/`):**
  1. Validates `Ambulance_1` is `status == available`.
  2. Creates a new `AmbulanceRide` record and sets it to `status == assigned`.
  3. Updates `Ambulance_1` to `status == on_trip`.

### The Driver (Mobile PWA)
- **Driver (UI):** Receives notification. Opens his "DialysisTrack Driver" PWA.
- **Location Tracking (React):** `navigator.geolocation.watchPosition` begins sampling the smartphone's GPS chip.
- **WebSocket (WSS):** establishes a tunnel to `ws://server/ws/fleet/ride/123/`.
- Every 3 seconds, a payload `{"lat": 19.123, "lng": 72.456}` is fired down the tunnel.
- **Redis Pub/Sub:** Instantly broadcasts to everyone listening to `ride_123`.

---

## Phase 2: Arrival & Admittance

### Arrival
- The Driver clicks "Arrived" and "Complete" in the app.
- **Backend API (`PATCH /api/fleet/rides/123/status`):**
  1. Closes the `AmbulanceRide`.
  2. Frees the `Ambulance_1` back to `available`.

### Registration / Reception
- The Receptionist registers the patient on `/patients`.
- **Emergency Toggle Flag (`is_emergency=True`):** This is a critical workflow node. If true, the patient jumps to the literal top of the `/queue` interface for the Head Nurse.

---

## Phase 3: The Dialysis Session (Medical Logic)

### Creating the Session
- **Head Nurse (UI):** Looks at the `Queue.jsx` component. Drags the patient to `Machine #4`.
- **Backend API (`POST /api/queue/sessions/`):**
  1. Checks if `Machine #4` is `available` (Prevents double-booking).
  2. Marks `Machine #4` as `operating` (Turns Red in UI globally).
  3. Stamps `start_time` = Server OS Clock Time.

### Clinical Metrics Logging (Completion)
- **Nurse (UI):** When the session finishes, fills out the `SessionCompletionForm.jsx`.
- **Entries Logged:**
  - `pre_dialysis_weight`: e.g., 75kg
  - `post_dialysis_weight`: e.g., 72kg
  - `blood_volume`: e.g., 50 Litres
- **Backend Logic Trigger:**
  1. Stamps `end_time`. Calculates duration (e.g., 4 Hours 10 Mins).
  2. Marks `Machine #4` as `cleaning`.
  3. The `Session.save()` method fires a massive **Django Signal**:
     - Automatically constructs a massive `Bill` object for the patient based on `session_cost`, `medicine_cost`, and `doctor_consult_fee`.

---

## Phase 4: Financial Checkout

### The Invoice
- **Receptionist (UI):** Opens the `BillingPage.jsx`. The new invoice is waiting. It reads: `Total: ₹3,500` - `Status: Pending`.

### Payment Methods
- **Card:** The receptionist swipes the card. The UI talks to a mock gateway in `RealPaymentForm.jsx`. The backend takes the ₹3,500 and creates a `Payment` object, appending a 1.8% `processing_fee` for the hospital accounts.
- **Cash:** The patient hands over cash. The receptionist logs it. The backend traces this transaction directly to that Receptionist's `User` ID for auditing purposes.
- **UPI QR:**
  - Patient asks to scan the code.
  - The backend calls `generate_qr_code_base64()`.
  - Dynamically builds a string: `upi://pay?pa=hospital@upi&pn=DialysisTrack&am=3500`.
  - Compiles it into a Base64 PNG inline string.
  - Returns `data:image/png;base64,iVBORw0KGgoAAA...`
  - React instantly throws this image onto the `<img src={...}>` tag on the receptionist's screen.
  - The patient scans it with Google Pay on their phone, which auto-fills the hospital name and exact ₹3,500 amount.

### Completion
Everything resets. The patient leaves. The machine finishes cleaning and flags back to `available`. The architecture waits for the next event.
