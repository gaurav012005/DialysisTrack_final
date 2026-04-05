# Technical Stack & Modules Explained

Every small library, framework, and package in DialysisTrack was selected to solve a specific problem.

## 1. Frontend Technologies (React/Vite)

- **Vite:** The build tool. Selected instead of `create-react-app` because it starts the development server 10x to 100x faster using native ES modules (ESM) and is configured optimized for modern browsers.
- **React Router DOM:** Enables Single Page Application (SPA) behavior. Pages change without reloading the browser window.
- **Tailwind CSS:** A utility-first CSS framework. It allows styling directly in the JSX (e.g., `className="text-red-500 font-bold"`), keeping the component files small, maintaining a consistent hospital theme (blue/white/gray).
- **Axios:** The HTTP client used for fetching APIs. Preferable to the native `fetch()` because it handles JSON automatically, sets default base URLs (`localhost:8000/api/`), and lets us implement Interceptors to inject JWT Tokens securely on every request.
- **Recharts:** Used for drawing the interactive graphs on the Billing Analytics dashboard. Chosen because it handles data mathematically and is entirely composed of customizable React components.
- **Phosphor Icons (now lucide-react):** The icon library. Selected because the icons are clean, scalable vector graphics (SVG), keeping the hospital UI looking professional and lightweight.
- **Framer Motion:** Used to power small UI micro-interactions (like a modal sliding in smoothly or buttons bouncing when clicked), giving the app a premium, modern feel.
- **React-QR-Reader:** Allows the receptionist's webcam to scan a physical card (or QR code) if hardware integration is needed.
- **PWA (Progressive Web App):** The `vite-plugin-pwa` manifest is implemented. It allows the driver to "Install" the tracking dashboard directly onto their phone's home screen as if it were a native Android/iOS application.

---

## 2. Backend Technologies (Django/Python)

- **Django 4.2:** Provides the robust MVC (or MTV) framework. Handles routing, security, DB migrations, and the Admin Panel.
- **Django REST Framework (DRF):** A toolkit that serializes complex Python objects (like a `Bill` or `Patient` record) into structured JSON format that the React frontend can read.
- **SimpleJWT (`djangorestframework-simplejwt`):** Implements JWT (JSON Web Tokens). It allows stateless authentication (the server doesn't need to look up a session ID in the database for every single click; the token encrypts the user's role securely).
- **Django Channels:** An asynchronous framework built on top of Django. Allows Django to speak WebSocket protocol (`ws://`) instead of just HTTP. Critical for the live Ambulance GPS tracking.
- **Redis & `channels-redis`:** An in-memory key-value data structure store. Functions as the "Channel Layer" to quickly broadcast the GPS coordinates to hundreds of connected browsers in milliseconds without straining the MySQL database.
- **PyMySQL:** The driver that connects the Python logic to the physical MySQL database engine.
- **Python `qrcode`:** Used in the Billing module to generate a UPI QR code string (`upi://pay?pa=...`) and convert it directly into a Base64-encoded PNG image on the backend. This means the frontend doesn't need external generic APIs to display payment codes.
- **Python `pyotp`:** Generates the Time-Based One-Time Passwords (TOTP) algorithm for the High-Security 2FA (Two-Factor Authentication) workflow (e.g., verifying Google Authenticator codes).
- **Python `decouple`:** Reads variables from an isolated `.env` file (like `SECRET_KEY`, Database Passwords) so they are never hardcoded and pushed to GitHub (preventing severe security leaks).
