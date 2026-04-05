# Frontend: UI Components & Utilities

## 📁 Related Files

```
src/
├── components/
│   ├── ── Layout & Navigation ──
│   ├── Layout.jsx                 # Page layout wrapper (1KB)
│   ├── Navbar.jsx                 # Top navigation bar (4.7KB)
│   ├── Sidebar.jsx                # Side navigation menu (5.6KB)
│   ├── ThemeToggle.jsx            # Dark/light mode toggle (2KB)
│   │
│   ├── ── Data Display ──
│   ├── Table.jsx                  # Reusable data table (9.6KB)
│   ├── Charts.jsx                 # Chart components (5.4KB)
│   ├── EmptyState.jsx             # Empty state placeholder (1.4KB)
│   ├── LoadingSpinner.jsx         # Loading animation (253B)
│   │
│   ├── ── Interactions ──
│   ├── ActionButton.jsx           # Styled action button (1.3KB)
│   ├── RefreshButton.jsx          # Data refresh button (257B)
│   ├── ConfirmDialog.jsx          # Confirmation dialog (910B)
│   ├── SimpleModal.jsx            # Generic modal wrapper (820B)
│   ├── MicroInteractions.jsx      # Micro-animation components (8.9KB)
│   │
│   ├── ── PWA & Offline ──
│   ├── InstallPrompt.jsx          # PWA install prompt (7KB)
│   ├── SmallInstallButton.jsx     # Compact install button (6.1KB)
│   ├── OfflineBanner.jsx          # Offline status banner (3.2KB)
│   │
│   ├── ── Error Handling ──
│   ├── ErrorBoundary.jsx          # React error boundary (1.7KB)
│   │
│   └── ── Chat ──
│       └── ChatBot.jsx            # Chatbot component (14.7KB)
│
├── context/
│   └── ThemeContext.jsx           # Theme state management (1.5KB)
│
├── hooks/
│   ├── useApi.js                  # API request hook (1.4KB)
│   ├── useFetch.js                # Data fetching hook (1KB)
│   └── useOnlineStatus.js         # Online/offline detection (993B)
│
├── styles/
│   ├── index.css                  # Main styles (11.8KB)
│   ├── dark-mode-fixes.css        # Dark mode overrides (34.3KB)
│   ├── typography.css             # Font styles (3KB)
│   └── accessibility.css          # Accessibility styles (1.8KB)
│
├── utils/
│   ├── api.js                     # Axios instance configuration (2.3KB)
│   ├── toast.js                   # Toast notification system (3.5KB)
│   ├── errorHandler.js            # Global error handler (247B)
│   └── accessibility.jsx          # Accessibility utilities (7.5KB)
│
├── config/
│   └── environment.js             # API URL configuration (462B)
│
├── App.jsx                        # Root app component (136B)
├── AppRouter.jsx                  # Route definitions (9.3KB)
└── main.jsx                       # Application entry point (936B)
```

---

## 🔧 How It Works

### 1. Layout & Navigation

#### Layout (`Layout.jsx`)
Main page wrapper that includes Sidebar and Navbar:
```jsx
<Layout>
    <Sidebar />
    <main>
        <Navbar />
        {children}
    </main>
</Layout>
```

#### Navbar (`Navbar.jsx`)
Top navigation bar showing:
- Current page title
- User name and role
- Theme toggle (dark/light)
- Logout button
- Notification bell

#### Sidebar (`Sidebar.jsx`)
Side navigation with **role-based menu items:**

| Menu Item | Visible To |
|-----------|------------|
| Dashboard | All |
| Patients | Admin, Doctor, Nurse, Receptionist |
| Queue | Admin, Doctor, Nurse, Technician |
| Sessions | Admin, Doctor, Nurse |
| Machines | Admin, Technician |
| Staff | Admin |
| Billing | Admin, Receptionist |
| Reports | Admin, Doctor |
| Fleet | Admin, Receptionist, Driver |
| My Dashboard | Patient |

### 2. Theme System

#### ThemeToggle (`ThemeToggle.jsx`)
Toggle between dark and light mode. Sets CSS class on document body.

#### ThemeContext (`ThemeContext.jsx`)
Provides `theme` and `toggleTheme` to all components via React Context.

#### Dark Mode CSS (`dark-mode-fixes.css`)
A comprehensive **34.3KB** CSS file that overrides all component styles for dark mode:
- Background colors (dark greys/blacks)
- Text colors (light greys/whites)
- Card backgrounds, borders
- Table styling, form inputs
- Chart colors, status badges

### 3. Reusable Table (`Table.jsx`)

A powerful **9.6KB** table component with:
- **Column definitions** with headers and data keys
- **Sorting** by column (ascending/descending)
- **Search** with real-time filtering
- **Pagination** with page size selector
- **Row actions** (edit, delete, view)
- **Custom cell renderers** (for status badges, etc.)
- **Responsive** design (horizontal scroll on mobile)

### 4. Charts (`Charts.jsx`)

Chart components for data visualization:
- Bar charts (queue stats, machine usage)
- Pie/donut charts (payment methods, patient distribution)
- Line charts (session trends)

### 5. Micro Interactions (`MicroInteractions.jsx`)

**8.9KB** of animated UI components:
- Fade-in animations on page load
- Hover effects on cards and buttons
- Slide-in transitions for modals
- Pulse animations for alert badges
- Smooth number counting animations

### 6. PWA Support

#### InstallPrompt (`InstallPrompt.jsx`)
Detects PWA installability and prompts users to install the app:
- Shows install banner/modal
- Handles `beforeinstallprompt` event
- Works on Chrome, Edge, and Android browsers

#### OfflineBanner (`OfflineBanner.jsx`)
Shows a banner when the user goes offline:
- Detects network status changes
- Shows yellow banner: "You are offline"
- Auto-hides when connection restores

#### useOnlineStatus (`hooks/useOnlineStatus.js`)
Custom hook for detecting online/offline status.

### 7. ChatBot (`ChatBot.jsx`)

A **14.7KB** chatbot interface:
- Floating chat button in bottom-right corner
- Chat window with message bubbles
- User and bot message styling
- Quick reply suggestions
- Expandable/collapsible chat window

### 8. Error Handling

#### ErrorBoundary (`ErrorBoundary.jsx`)
React error boundary that catches runtime errors:
- Shows friendly error message instead of crash
- "Something went wrong" fallback UI
- Retry button to recover

### 9. Routing (`AppRouter.jsx`)

All routes defined with role protection:

| Route | Page | Allowed Roles |
|-------|------|---------------|
| `/login` | Login | Public |
| `/` | Dashboard | All authenticated |
| `/patients` | Patients | Admin, Doctor, Nurse, Receptionist |
| `/queue` | Queue | Admin, Doctor, Nurse, Technician |
| `/sessions` | Sessions | Admin, Doctor, Nurse |
| `/machines` | Machines | Admin, Technician |
| `/staff` | Staff | Admin |
| `/billing` | BillingPage | Admin, Receptionist |
| `/billing-dashboard` | BillingDashboard | Admin, Receptionist |
| `/reports` | Reports | Admin, Doctor |
| `/ambulance` | AmbulanceManagement | Admin, Receptionist |
| `/driver` | DriverDashboard | Driver |
| `/track-ambulance` | TrackAmbulance | Patient |
| `/patient-dashboard` | PatientDashboard | Patient |
| `/two-factor-setup` | TwoFactorSetup | All staff |
| `*` | NotFound | All |

### 10. API Configuration

#### Environment (`config/environment.js`)
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

#### Axios Config (`api/axiosConfig.js`)
- Base URL from environment
- Request interceptor (JWT token attachment)
- Response interceptor (error handling, auto-logout on 401)

---

## 🔑 Key Features

- **Dark/Light theme** with comprehensive dark mode CSS
- **Role-based sidebar** navigation
- **Reusable table** with sort, search, pagination
- **PWA support** with install prompt and offline detection
- **Micro-animations** for enhanced UX
- **Chatbot** interface
- **Error boundary** for crash recovery
- **Accessibility** CSS and utilities
- **37 total components** organized by function
