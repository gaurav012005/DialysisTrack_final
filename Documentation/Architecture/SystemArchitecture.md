# DialysisTrack: Complete System Architecture

## 1. High-Level Architecture (Client-Server Model)

DialysisTrack operates on a decoupled **Headless Architecture**, meaning the Frontend UI and Backend Logic run as completely separate applications, communicating strictly over defined APIs.

### The 3-Tier Architecture
1. **Presentation Layer (Frontend):** React.js + Vite. Runs in the user's browser. Responsible for UI, routing, state management, and capturing user input.
2. **Application Logic Layer (Backend):** Django REST Framework. Runs on the server (usually a WSGI server like Gunicorn + ASGI server like Daphne). Enforces business logic, calculates bills, processes WebSockets, and controls data validation.
3. **Data Layer (Database):** MySQL + Redis. MySQL holds long-term persistent data (Users, Bills, Patients). Redis acts as an in-memory message broker to handle high-speed WebSocket broadcasting for the Ambulance tracking.

---

## 2. Component Communication Flow

### Standard HTTP Flow (REST API)
When a Receptionist clicks "Register Patient":
1. **Frontend:** React identifies the form submission.
2. **Context:** `AuthContext` retrieves the active JWT Access Token from `localStorage`.
3. **Axios Interceptor:** Attaches `Authorization: Bearer <token>` to the HTTP headers.
4. **Transport:** Sends a `POST` request to `http://localhost:8000/api/patients/`.
5. **Backend Router (`urls.py`):** Receives the request and routes it to `PatientViewSet`.
6. **Middleware:** Django verifies the JWT token. If expired, responds with `401 Unauthorized`.
7. **Permissions (`permissions.py`):** Checks if the user's `role` allows `POST` on the `patients` table.
8. **Serializer (`serializers.py`):** Validates the JSON payload (e.g., checks if phone number is correct length).
9. **Database (MySQL):** Saves the record.
10. **Response:** Django returns an `HTTP 201 Created` with the new patient data back to React.

### WebSocket Flow (Live GPS Tracking)
When a Driver is moving:
1. **Frontend:** React uses `navigator.geolocation.watchPosition` to get Lat/Lng every 3 seconds.
2. **Connection:** React establishes a persistent `ws://localhost:8000/ws/fleet/ride/1/` connection.
3. **Backend ASGI:** Django Channels accepts the connection instead of normal Django HTTP.
4. **Redis:** The driver is added to a Redis Channel Group (`ride_1`).
5. **Broadcasting:** The driver sends `{ "lat": 19.1, "lng": 72.4 }`. Redis instantly broadcasts that JSON string to all other frontend browsers (Receptionists, Patients) subscribing to the `ride_1` group, allowing the ambulance icon to move smoothly without refreshing the page.

---

## 3. Deployment Architecture (Production Ready)

When deploying DialysisTrack to a live server (e.g., AWS EC2, DigitalOcean), the architecture uses Nginx as a Reverse Proxy.

### Nginx (`nginx.conf`)
- Acts as the outer shield of the hospital server.
- **Port 80/443:** Listens for incoming internet traffic.
- **Routing:** 
  - If a user asks for `/`, Nginx silently forwards the request to the React Frontend server on port 3000.
  - If a user asks for `/api/...`, Nginx forwards it to the Django Backend server on port 8000.
- **Security:** Injects strict security headers (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`) to block clickjacking and MIME-sniffing attacks before the traffic even reaches Django.
