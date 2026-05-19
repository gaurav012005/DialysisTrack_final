# Open Source Tools & Technologies in DialysisTrack

This document provides a concise overview of the key open-source tools and technologies integrated into the DialysisTrack project, specifically focusing on Ambulance Tracking, Progressive Web App (PWA) offline capabilities, Two-Factor Authentication (2FA), and Payment mechanisms.

---

## 1. Ambulance Tracking Tools

The real-time ambulance tracking module leverages open-source mapping and geolocation solutions instead of paid alternatives like Google Maps.

*   **Leaflet.js:** An open-source JavaScript library used for mobile-friendly interactive maps. It handles the rendering of maps, plotting vehicle coordinates, and updating markers in real-time on the frontend dashboard without heavy performance overhead.
*   **OpenStreetMap (OSM):** A free and open geographic database. The project uses OSM tile servers to provide the underlying map visual layers without strict API usage limits or billing attached to map tile fetches.
*   **Geolocation API / WebSocket (Backend):** Standard web and mobile Geolocation APIs are used on the mobile side to grab GPS coordinates, which are then transmitted to the server and streamed to the Leaflet frontend map.

---

## 2. Progressive Web App (PWA) & Offline Functionality

DialysisTrack is built as a PWA, enabling it to be installed on mobile devices and desktops natively. The offline capability is managed using modern web APIs.

### Which Tools are Used?
*   **Vite PWA Plugin & Workbox:** Used in the React frontend to generate service workers and manage caching strategies automatically.
*   **Service Workers & Cache API:** Core browser features to intercept network requests and serve cached static assets.

### How Does Partial (Current) Offline Mode Work?
Currently, the app supports **partial offline capability**:
1.  **Static Shell Caching:** When a user visits the app, the Service Worker caches the core "App Shell" (HTML, CSS, JS bundles, fonts, and images).
2.  **Network-First / Cache-Fallback:** If the user loses internet connection, the UI will still load instantly from the Cache API instead of showing the "No Internet" dinosaur game. 
3.  **Read-Only:** The user can navigate previously visited screens, but dynamic data (like new API calls for patient lists or appointments) will fail if no network is present because dynamic database data is not deeply cached locally yet.

### How Would 100% Offline Mode Work?
To achieve robust **100% offline functionality**, the system would need to integrate:
1.  **IndexedDB:** An in-browser NoSQL database (using a wrapper like `localforage` or `Dexie.js`).
2.  **Background Sync API:** 
    *   *Mechanism:* When offline, if a doctor updates a patient record or a driver updates their ambulance location, the app saves this operation locally in IndexedDB.
    *   *Synchronization:* Through the Service Worker's Background Sync API, the app queues these actions. The moment the internet reconnects, the Service Worker automatically pushes this queued data to the Django REST backend.

---

## 3. Two-Factor Authentication (2FA) Tools

To secure admin and staff accounts, Time-based One-Time Passwords (TOTP) 2FA is implemented in the backend using open-source Python libraries.

*   **PyOTP:** A Python library for generating and verifying one-time passwords. It implements the standard TOTP algorithm (RFC 6238), the same technology used by Google Authenticator, Microsoft Authenticator, and Authy.
*   **qrcode (Python Library):** Used in conjunction with PyOTP to dynamically generate a graphical QR code on the backend. This allows users to easily scan and link their accounts during initial setup.
*   *How it works:* The backend securely stores a unique base32 secret for each user. PyOTP uses this secret and the current UTC time to validate 6-digit codes submitted by the user at login.

---

## 4. Payment Integration Tools

Rather than relying on closed-source, heavy proprietary gateways out of the box, the system incorporates lean, standard-based methods for managing patient billing.

*   **UPI QR Generation:** The project uses standard open libraries (`qrcode` in Python / React QR libraries in frontend) to generate Dynamic UPI (Unified Payments Interface) QR codes.
*   *How it works:* By formatting a deep link `upi://pay?pa=hospital@bank&pn=Hospital&am=500`, the app dynamically renders a QR. A patient or their relative scans it with PhonePe, GPay, or Paytm to pay directly offline or via mobile without gateway transaction fees.
*   **Payment Form UI:** Built natively in React, providing logical input masks for manual transactions alongside the QR scan status, integrating securely with typical REST APIs for invoice tracking.

---

## Summary of Tools Used
*   **Maps & Tracking:** Leaflet.js, OpenStreetMap (OSM)
*   **PWA / App Shell / Cache:** Workbox, Cache API, Service Workers
*   **Security / 2FA:** PyOTP, `qrcode` library (TOTP Standards)
*   **Payments:** Dynamic UPI Deep-linking, QR code standards
*   **Frameworks:** React (Frontend), Django/Django REST (Backend)
