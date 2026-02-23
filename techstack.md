# Tech Stack - DialysisTrack

## Overview
DialysisTrack is a comprehensive dialysis queue management system built with modern web technologies, featuring role-based access control and a responsive user interface.

## Backend
- **Framework:** Django REST Framework
- **Database:** MySQL (production) / SQLite (development)
- **Authentication:** JWT (JSON Web Tokens)
- **Language:** Python 3.x

## Frontend
- **Framework:** React
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Language:** JavaScript (ES6+)

## Deployment & Infrastructure
- **Containerization:** Docker
- **Web Server:** Nginx
- **Database:** MySQL
- **Reverse Proxy:** Nginx for static files and API routing

## Additional Technologies
- **Testing:** Custom Python scripts for API testing
- **Documentation:** Markdown files
- **Version Control:** Git
- **Package Management:**
  - Backend: pip (Python)
  - Frontend: npm (Node.js)

## Development Tools
- **IDE:** VS Code
- **API Testing:** Postman/Insomnia
- **Database Management:** pgAdmin / SQLite Browser
- **Container Orchestration:** Docker Compose

## Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing
- Token refresh mechanism
- Permission validation

## Key Dependencies
### Backend (requirements.txt)
- Django
- djangorestframework
- djangorestframework-simplejwt
- pymysql (MySQL adapter)
- django-cors-headers
- python-decouple

### Frontend (package.json)
- React
- Vite
- Tailwind CSS
- Axios (HTTP client)
- React Router
- Lucide React (icons)

## Architecture
- **Monolithic Backend:** Single Django application with multiple apps
- **SPA Frontend:** Single-page application with client-side routing
- **RESTful API:** JSON-based communication between frontend and backend
- **Microservices Potential:** Modular structure allows for future decomposition

## Development Environment
- **OS:** Cross-platform (Windows/Linux/macOS)
- **Python Version:** 3.8+
- **Node.js Version:** 16+
- **Database:** MySQL 8.0+ or SQLite 3

## Production Deployment
- Docker containers for backend and frontend
- Nginx reverse proxy
- MySQL database
- Environment-based configuration
- Static file serving optimization
