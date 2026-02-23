# DialysisTrack System Design Diagram

## 🏗️ **System Design Overview**

**DialysisTrack** uses a **3-tier client-server architecture** with **REST API** communication:

- **Frontend:** React.js SPA with component-based UI
- **Backend:** Django REST API with JWT authentication
- **Database:** SQLite with ORM for data persistence
- **Communication:** HTTP/JSON between layers
- **Security:** Role-based access control (Admin, Doctor, Nurse, Receptionist)
- **Deployment:** Containerized with Docker + Nginx reverse proxy

### **Simple System Flow:**
```
┌─────────────┐    HTTP/JSON    ┌─────────────┐    ORM/SQL     ┌─────────────┐
│   React.js  │ ◄─────────────► │   Django    │ ◄─────────────► │   SQLite    │
│  Frontend   │                 │   Backend   │                 │  Database   │
│ Port: 5173  │                 │ Port: 8000  │                 │ db.sqlite3  │
└─────────────┘                 └─────────────┘                 └─────────────┘
      │                               │                               │
   Components                    REST API                        Tables
   • Dashboard                  • Authentication                • Users
   • Forms                      • CRUD Operations               • Patients
   • Navigation                 • Business Logic                • Appointments
   • State Mgmt                 • Data Validation               • Queue
```

## 🏗️ **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   Admin     │  │   Doctor    │  │    Nurse    │  │Reception│ │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │  │Dashboard│ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                         HTTP/HTTPS Requests
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                     React.js Frontend                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Components  │  │   Router    │  │    Hooks    │  │  Axios  │ │
│  │   (JSX)     │  │ Navigation  │  │ State Mgmt  │  │HTTP Lib │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│                    Port: 5173 (Vite Dev Server)                │
└─────────────────────────────────────────────────────────────────┘
                                │
                         REST API Calls
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                    Django Backend API                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │    Views    │  │ Serializers │  │Middleware   │  │   JWT   │ │
│  │ (API Logic) │  │(Data Format)│  │(CORS/Auth)  │  │  Auth   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│                    Port: 8000 (Django Server)                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                         ORM Queries
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                     MySQL Database                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   Users     │  │  Patients   │  │ Appointments│  │Machines │ │
│  │   Staff     │  │   Queue     │  │   Reports   │  │  Logs   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│                  Database: dialysistrack_db                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 **Data Flow Diagram**

```
┌─────────────┐    HTTP Request     ┌─────────────┐
│   Browser   │ ──────────────────► │   React     │
│  (Client)   │                     │  Frontend   │
└─────────────┘                     └─────────────┘
                                           │
                                    Axios API Call
                                           │
                                           ▼
┌─────────────┐    JSON Response    ┌─────────────┐
│   Django    │ ◄─────────────────  │    Nginx    │
│   Backend   │                     │ Proxy Server│
└─────────────┘                     └─────────────┘
       │                                   │
   ORM Query                        Route Request
       │                                   │
       ▼                                   ▼
┌─────────────┐                    ┌─────────────┐
│   SQLite    │                    │  Static     │
│  Database   │                    │   Files     │
└─────────────┘                    └─────────────┘
```

## 🏛️ **Module Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                      DJANGO APPS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    Users    │  │  Patients   │  │Appointments │             │
│  │             │  │             │  │             │             │
│  │ • Models    │  │ • Models    │  │ • Models    │             │
│  │ • Views     │  │ • Views     │  │ • Views     │             │
│  │ • URLs      │  │ • URLs      │  │ • URLs      │             │
│  │ • Serializ  │  │ • Serializ  │  │ • Serializ  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Queue     │  │  Machines   │  │   Reports   │             │
│  │             │  │             │  │             │             │
│  │ • Models    │  │ • Models    │  │ • Models    │             │
│  │ • Views     │  │ • Views     │  │ • Views     │             │
│  │ • URLs      │  │ • URLs      │  │ • URLs      │             │
│  │ • Serializ  │  │ • Serializ  │  │ • Serializ  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 **Security Architecture**

```
┌─────────────┐    Login Request    ┌─────────────┐
│   Client    │ ──────────────────► │    JWT      │
│             │                     │ Auth Server │
└─────────────┘                     └─────────────┘
       │                                   │
   JWT Token                        Generate Token
       │                                   │
       ▼                                   ▼
┌─────────────┐    Verify Token     ┌─────────────┐
│ Protected   │ ◄─────────────────  │   Django    │
│ Resources   │                     │ Middleware  │
└─────────────┘                     └─────────────┘
```

## 📊 **Database Schema**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Users    │     │  Patients   │     │Appointments │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ • id (PK)   │     │ • id (PK)   │     │ • id (PK)   │
│ • username  │     │ • name      │     │ • patient   │
│ • email     │     │ • age       │ ──► │ • date      │
│ • role      │     │ • phone     │     │ • time      │
│ • password  │     │ • address   │     │ • status    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Staff     │     │   Queue     │     │  Machines   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ • user_id   │     │ • patient   │     │ • id (PK)   │
│ • department│     │ • position  │     │ • name      │
│ • shift     │     │ • status    │     │ • status    │
│ • phone     │     │ • priority  │     │ • location  │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 🚀 **Deployment Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCTION                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    Nginx    │    │   Docker    │    │    MySQL    │         │
│  │ Load Balancer│───►│ Containers  │───►│  Database   │         │
│  │   Port 80   │    │             │    │             │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                            │                                    │
│                            ▼                                    │
│                    ┌─────────────┐                              │
│                    │   Gunicorn  │                              │
│                    │ WSGI Server │                              │
│                    └─────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    Vite     │    │   Django    │    │   SQLite    │         │
│  │ Dev Server  │    │ Dev Server  │    │  Database   │         │
│  │  Port 5173  │    │  Port 8000  │    │    File     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```