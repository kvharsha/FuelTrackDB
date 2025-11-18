<!-- PROJECT BADGES -->
<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react&logoColor=white" alt="React 18"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white" alt="TS"></a>
  <a href="https://mui.com/"><img src="https://img.shields.io/badge/UI-MUI-007FFF?logo=mui&logoColor=white" alt="MUI"></a>
  <a href="https://leafletjs.com/"><img src="https://img.shields.io/badge/Maps-Leaflet-199900?logo=leaflet&logoColor=white" alt="Leaflet"></a>
  <a href="https://www.djangoproject.com/"><img src="https://img.shields.io/badge/Backend-Django%205-092E20?logo=django&logoColor=white" alt="Django"></a>
  <a href="https://www.django-rest-framework.org/"><img src="https://img.shields.io/badge/API-DRF-E23F3E?logo=fastapi&logoColor=white" alt="DRF"></a>
  <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/DB-MySQL-4479A1?logo=mysql&logoColor=white" alt="MySQL"></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker"></a>
  <a href="#"><img src="https://img.shields.io/badge/PWA-offline-5A0FC8?logo=googlechrome&logoColor=white" alt="PWA"></a>
</p>

<!-- PROJECT LOGO -->
<p align="center">
  <img src="frontend/public/vite.svg" alt="FuelTrackDB Logo" width="84" height="84">
</p>

# 🚗 FuelTrackDB

Map-first Fuel Station Locator & Management Platform for Bengaluru

Built with React + Vite + TypeScript + MUI + Leaflet × Django + DRF × MySQL × Docker + PWA

---

## ✨ Overview

FuelTrackDB delivers a Google-Maps-like experience for discovering, filtering, and managing fuel stations.

**Highlights**

- Secure authentication (User/Admin)
- Map-first UI with filters, routes, and markers
- Grid A* pathfinding + Haversine distance / ETA
- Favorites, Recents, Reviews
- Offline/PWA functionality (Dexie + Service Worker)
- Admin Portal for CRUD management and analytics

Data sourced from Maruti (CNG), Statiq (EV), and OpenStreetMap (Petrol/Diesel).

---

## 📚 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
  - [Local Development](#local-development)
  - [Docker (Recommended)](#docker-recommended)
- [Environment Variables](#-environment-variables)
- [Frontend Overview](#-frontend-overview)
- [Backend Overview](#-backend-overview)
- [API Endpoints](#-api-endpoints)
- [Data Model](#-data-model)
- [Algorithms](#-algorithms)
- [Offline & PWA](#-offline--pwa)
- [Admin Portal](#-admin-portal)
- [Testing](#-testing)
- [Security & Deployment](#-security--deployment)
- [Troubleshooting](#-troubleshooting)
- [Sample Credentials](#-sample-credentials)
- [License](#-license)

---

## ✨ Features

### 👤 User-Facing

- Auth: Login/Signup with username & email availability checks
- Map-first UX: Full-screen `react-leaflet` map after login
- Floating UI:
  - Welcome toast (greets by first name)
  - Top-right avatar → Preferences + Day/Night toggle
  - Bottom-right controls → Locate-me, Zoom ±, Wi-Fi indicator
  - Center search → station/place finder
  - Left ribbon → Side Panel with Favorites, Recents, Reviews, Offline maps
  - Bottom-left → Layer Picker (Geographical/Satellite/Terrain)
- Routing: Grid-based A* polyline with Haversine ETA
- Markers: Price-based color coding (green=cheapest → red)
- Offline: Persistent map state, favorites, recents, cached data
- Onboarding Modal and smooth animations throughout

### 🧭 Admin-Facing

- Admin Login: Dedicated portal (no self-registration)
- Admin Portal:
  - Manage Stations, Fuel Types, Users, and Reviews
  - Inline DataGrid editing, pagination, search/filter
  - Charts for insights (price, ratings)
  - CSV export and moderation tools

### ⚙️ Platform Features

- Dexie (IndexedDB) for offline persistence
- A* + Haversine for fast routing and distance accuracy
- Responsive UI with MUI and Emotion
- Secure token-based auth
- CI/CD ready with testing, linting, and deployment stages

---

## 🧱 Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18 · Vite · TypeScript · MUI · Emotion · React-Leaflet · Redux Toolkit · Dexie · Axios · React Router · Framer Motion · PWA |
| Backend | Django 5 · Django REST Framework · SimpleJWT · CORS Headers · MySQL |
| DevOps | Docker · Docker Compose · Gunicorn · Nginx · Whitenoise |
| Database | MySQL with stored procs & Haversine distance function |

---

## 🧭 Architecture

```mermaid
flowchart LR
  A[Frontend (React/Vite/TS)] -->|Axios| B[Backend API (Django REST Framework)]
  B -->|ORM + Stored Procedures| C[(MySQL)]
  subgraph Offline (Client)
    A --> D[Dexie IndexedDB]
    A --> E[PWA Service Worker]
  end
  B -->|sp_find_nearby_stations + fn_distance_km| C
```

## 🗂️ Directory Structure

```
FuelTrackDB/
├── backend/
│   ├── core/                # Django project configuration
│   └── api/                 # Main DRF app (models, serializers, views, urls)
├── frontend/
│   └── src/
│       ├── api/             # Axios clients (auth, stations, etc.)
│       ├── store/           # Redux slices (auth, ui, map, favorites, offline)
│       ├── utils/           # Haversine, grid search (A*), fuzzy search
│       ├── db/              # Dexie offline storage
│       ├── components/      # Reusable UI components
│       └── pages/           # Page components (Map, Auth, Admin, Preferences)
└── docker-compose.yml
```

---

## ⚙️ Getting Started

### Local development (backend)

From PowerShell:

```powershell
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install django==5.0.6 djangorestframework==3.15.2 djangorestframework-simplejwt==5.3.1 django-cors-headers==4.4.0 mysqlclient==2.2.4 python-dotenv==1.0.1

# Freeze requirements
pip freeze > requirements.txt

# Run migrations & server
python manage.py migrate
python manage.py runserver
```

### Local development (frontend)

```powershell
cd frontend

# Install base dependencies
npm install

# UI and Mapping
npm install @mui/material @emotion/react @emotion/styled react-leaflet

# State Management, HTTP, and Routing
npm install @reduxjs/toolkit react-redux dexie axios react-router-dom

# Type definitions
npm install -D @types/react-leaflet

# Run development server
npm run dev
```

### Docker (recommended)

Run the full stack (backend + frontend + db):

```powershell
docker-compose down -v
docker-compose up --build
```

Verify services and inspect logs:

```powershell
docker ps
docker-compose ps
docker-compose logs --tail=200 api
```

Manual MySQL connection test (from API container):

```powershell
docker-compose exec api sh -c 'mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --ssl=0'
```

---

## 🔐 Environment Variables

Create or update `backend/.env` with:

```ini
DB_NAME=fuel_locator_db
DB_USER=fueltrack_user
DB_PASSWORD=<secure_password>
DB_HOST=db
DB_PORT=3306
DEBUG=True
SECRET_KEY=<generate_secure_secret>
```

---

## 🖥️ Frontend Overview

Routes

- `/` — Login/Signup
- `/admin/login` — Admin login
- `/map` — User map view (protected)
- `/preferences` — User preferences
- `/admin` — Admin portal

UI highlights

- Glassmorphism login
- Map with interactive controls (zoom, locate-me, layers)
- Side panel (favorites, recents, offline packages)
- Avatar menu (preferences, theme toggle)
- Smooth animations and dark mode

---

## ⚙️ Backend Overview

Key features

- Auth: Token-based (JWT)
- Endpoints: Auth, Stations, Fuels, Favorites, Reviews, Offline Packages
- Permissions: Admin-only writes, user reads
- Utilities: `/api/test/` ping & `/api/health/` status

---

## 📡 API Endpoints (Summary)

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register/ | Register new user |
| POST | /api/auth/login/ | Obtain JWT token |
| POST | /api/auth/check-email/ | Validate email availability |
| GET | /api/stations/ | List stations |
| GET | /api/fuel_types/ | List fuel types |
| GET | /api/nearby/?lat&lon&radius_km | Nearby stations |
| GET | /api/favorites/ | User favorites |
| GET | /api/reviews?station_id= | Station reviews |
| GET | /api/offline-packages/ | Offline map packages |
| GET | /api/users/ | Admin user management |
| GET | /api/health/ | Health check |

---

## 🗄️ Data Model (Summary)

| Model | Description |
|---|---|
| User | Custom user with role (user / admin) |
| FuelType | e.g. CNG, Petrol, Diesel, EV, LPG |
| Station | Location and address info |
| StationFuel | Station ↔ Fuel type with price & availability |
| Favorite | User ↔ Station |
| Review | One per user/station |
| OfflinePackage | Offline map data bounding boxes |

---

## 🧮 Algorithms

- Haversine formula for distance (km)
- A* (grid-based) for pathfinding and ETA
- Client-side caching for routes and tiles
- Fallback: straight-line route if path unavailable

---

## 📱 Offline & PWA

- PWA via `vite-plugin-pwa`
- Dexie (IndexedDB) caches: Stations, favorites, settings, recents, offline packages, routes
- Offline map tiles (prefetched by bounding box)
- Service Worker fallback for offline mode

---

## 🧑‍💼 Admin Portal

- CRUD for stations, fuels, users, reviews
- Analytics via charts (price, ratings)
- DataGrid with inline edits, pagination, CSV export
- Moderation tools for reviews & user management

---

## 🧪 Testing

### Backend

Run tests:

```powershell
python manage.py test
```

Covers: Auth & tokens, nearby sorting, review validation, favorites logic, admin permissions

### Frontend

```powershell
cd frontend
npm run test
```

---

## 🔒 Security & Deployment

- JWT-based authentication
- Rate-limited login
- CORS configured for frontend origin
- Production Dockerfiles: Backend (Gunicorn + Whitenoise), Frontend (Nginx static hosting)
- Secure environment variables via `.env`
- `/api/health/` endpoint for readiness probes

---

## 🛠️ Troubleshooting

| Issue | Fix |
|---|---|
| DB unhealthy | `docker-compose logs db` |
| API can’t connect to DB | Verify `.env` host = `db` |
| Port conflicts | Stop old containers with `docker-compose down` |
| Stale volume | `docker-compose down -v && docker-compose up --build` |

---

## 🔑 Sample Credentials

| Role | Email | Password |
|---|---|---|
| User | student@pesu.edu | student_pass_2025 |
| Admin | admin@pesu.edu | admin_pass_2025 |

---

## 🧾 License

This project is for educational and demonstration purposes. Add a license file (e.g., MIT) before external distribution.
<!-- PROJECT BADGES -->
<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react&logoColor=white" alt="React 18"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white" alt="TS"></a>
  <a href="https://mui.com/"><img src="https://img.shields.io/badge/UI-MUI-007FFF?logo=mui&logoColor=white" alt="MUI"></a>
  <a href="https://leafletjs.com/"><img src="https://img.shields.io/badge/Maps-Leaflet-199900?logo=leaflet&logoColor=white" alt="Leaflet"></a>
  <a href="https://www.djangoproject.com/"><img src="https://img.shields.io/badge/Backend-Django%205-092E20?logo=django&logoColor=white" alt="Django"></a>
  <a href="https://www.django-rest-framework.org/"><img src="https://img.shields.io/badge/API-DRF-E23F3E?logo=fastapi&logoColor=white" alt="DRF"></a>
  <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/DB-MySQL-4479A1?logo=mysql&logoColor=white" alt="MySQL"></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker"></a>
  <a href="#"><img src="https://img.shields.io/badge/PWA-offline-5A0FC8?logo=googlechrome&logoColor=white" alt="PWA"></a>
</p>

<!-- PROJECT LOGO -->
<p align="center">
  <img src="frontend/public/vite.svg" alt="FuelTrackDB Logo" width="84" height="84">
</p>

<h1 align="center">🚗 FuelTrackDB</h1>

<p align="center">
  <b>Map-first Fuel Station Locator & Management Platform for Bengaluru</b><br/>
  Built with <b>React + Vite + TypeScript + MUI + Leaflet × Django + DRF × MySQL × Docker + PWA</b>
</p>