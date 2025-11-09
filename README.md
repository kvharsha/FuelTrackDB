# FuelTrackDB

**Map-first fuel station locator** with authentication, admin management, offline support, and smart routing.

- **Frontend:** React + Vite + TypeScript + MUI + Leaflet  
- **Backend:** Django + Django REST Framework + Token Auth  
- **Database:** MySQL (SQL schema with Haversine function & stored procedures for nearby search)

---

## Overview

FuelTrackDB delivers a Google Maps–like experience with features such as:
- Login/Sign-up
- Full-screen map with fuel-type filters (CNG, Petrol, Diesel, EV (AC/DC), LPG)
- Shortest-path navigation (A* grid + Haversine)
- Offline map packages and caching
- Role-based Admin Portal for management

---

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Architecture](#architecture)  
4. [Directory Structure](#directory-structure)  
5. [Getting Started](#getting-started-local--docker)  
6. [Environment Variables](#environment-variables)  
7. [Scripts](#scripts)  
8. [Frontend Overview](#frontend-overview)  
9. [Backend Overview](#backend-overview)  
10. [API Endpoints Summary](#api-endpoints-summary)  
11. [Data Model Summary](#data-model-summary)  
12. [Algorithms](#algorithms)  
13. [Offline and PWA](#offline-and-pwa)  
14. [Admin Portal](#admin-portal)  
15. [Testing](#testing)  
16. [Security and Production](#security-and-production)  
17. [Troubleshooting](#troubleshooting)  
18. [Credentials](#credentials-sample)  
19. [License](#license)

---

## Features

### User-Facing
- **Authentication:** Login/Signup with username/email availability checks  
- **Map-First UX:** Full-screen map (React Leaflet) with geolocation  
- **Filters and Sorting:** Filter by fuel type and availability; sort by distance, price, or rating  
- **Routing:** Route visualization with ETA and distance  
- **PWA:** Offline support with cached tiles and station data  
- **UI Elements:**  
  - Avatar menu (Preferences and Theme Toggle)  
  - Floating map controls (Locate Me, Zoom, Wi-Fi strength)  
  - Side panel for Favorites, Recents, Reviews, and Offline Packages  

### Admin-Facing
- Dedicated **Admin Login**  
- **Admin Portal:**  
  - Manage Stations, Fuel Types, Users, Reviews  
  - Inline editing, pagination, CSV export, and charts  
  - DataGrid with success/error toasts and search filters  

---

## Tech Stack

### Frontend
- React + TypeScript (Vite)
- MUI (`@mui/material`, `@emotion/react`, `@emotion/styled`)
- React Leaflet
- Redux Toolkit and React Redux
- Dexie (IndexedDB)
- Axios
- React Router DOM
- Framer Motion
- Vite PWA Plugin

### Backend
- Django + Django REST Framework
- MySQL (with stored procedures)
- CORS Headers, JWT Auth
- Gunicorn + Whitenoise (production)

---

## Architecture

- **Client:** Calls DRF endpoints for authentication, stations, reviews, and nearby search  
- **Database:**  
  - Stored procedures: `sp_find_nearby_stations`  
  - Functions: `fn_distance_km`, `fn_avg_rating`  
- **Routing:** Client-side A* grid algorithm with Haversine distance  
- **Offline:** Stations, tiles, and packages cached locally via Dexie  

---

## Directory Structure

```
FuelTrackDB/
├─ backend/
│  ├─ core/     # Django project
│  └─ api/      # DRF app (models, views, serializers, urls)
│
├─ frontend/
│  └─ src/
│     ├─ api/         # axios clients
│     ├─ store/       # Redux slices
│     ├─ utils/       # haversine, A*, fuzzy, etc.
│     ├─ db/          # dexieDb.ts
│     ├─ components/  # reusable UI
│     └─ pages/       # Auth, Map, Admin, Preferences
```

---

## Getting Started (Local & Docker)

### Backend (Local)
```bash
cd backend
python -m venv venv
.env\Scriptsctivate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (Local)
```bash
cd frontend
npm install
npm run dev
```

### Docker (Recommended)
```bash
docker-compose down -v
docker-compose up --build
```

Verify:
```bash
docker ps
docker-compose ps
```

To test DB connectivity:
```bash
docker-compose exec api sh -c 'mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --ssl=0'
```

---

## Environment Variables

Place in `backend/.env`:

| Variable | Example | Description |
|-----------|----------|-------------|
| `DB_NAME` | fuel_locator_db | MySQL database name |
| `DB_USER` | fueltrack_user | Database username |
| `DB_PASSWORD` | secret | Database password |
| `DB_HOST` | db | Service name in Docker |
| `DB_PORT` | 3306 | Port inside container |
| `DEBUG` | True | Django debug mode |
| `SECRET_KEY` | secret-key | Django secret key |

---

## Scripts

| Command | Description |
|----------|--------------|
| `docker-compose down` | Stop containers |
| `docker-compose up` | Start containers |
| `docker-compose up --build` | Rebuild all images |
| `docker-compose run api python manage.py test` | Run backend tests |

---

## Frontend Overview

| Path | Description |
|------|--------------|
| `/` | Login/Signup |
| `/map` | MapPage |
| `/preferences` | Preferences |
| `/admin` | Admin Portal |
| `/admin/login` | Admin Login |

---

## Backend Overview

- **Auth:** JWT-based login/register with username/email validation  
- **Models:** User, Station, FuelType, StationFuel, Favorites, Reviews, OfflinePackage  
- **Nearby Search:** Stored procedure for efficient distance sorting  
- **Permissions:** Authenticated read, admin write  

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/auth/register/` | Register user |
| POST | `/api/auth/login/` | Login user |
| GET | `/api/stations/` | List stations |
| GET | `/api/nearby/` | Nearby stations |
| GET | `/api/favorites/` | Get favorites |
| POST | `/api/reviews/` | Add review |
| GET | `/api/health/` | Health check |

---

## Data Model Summary

- **User:** Custom user with role (user/admin)  
- **Station:** Location, name, address  
- **FuelType:** Petrol, Diesel, EV, etc.  
- **StationFuel:** Price & availability  
- **Favorite:** User ↔ Station  
- **Review:** User ↔ Station (1 per pair)  
- **OfflinePackage:** Tile & station cache box  

---

## Algorithms

- **Haversine formula** for distance  
- **A\* Grid Search** for routing  
- **Fallback:** Straight line when no path found  

---

## Offline and PWA

- Uses `vite-plugin-pwa` for offline caching  
- Dexie for IndexedDB persistence (stations, routes, favorites)  
- Map tiles preloaded for offline regions  

---

## Admin Portal

- Manage all entities (Stations, Users, Fuel Types, Reviews)  
- Charts for fuel prices and ratings  
- CSV export and DataGrid editing  

---

## Testing

Run via Django test runner:
```bash
python manage.py test
```

Covers:
- Authentication  
- Nearby station ordering  
- Review duplication prevention  
- Admin restrictions  

---

## Security and Production

- Login rate limiting  
- Health checks (`/api/health/`)  
- CORS & security headers  
- Gunicorn + Whitenoise + Nginx production stack  
- Secrets managed via environment variables  

---

## Troubleshooting

If DB is unhealthy:
```bash
docker-compose logs db
```

If stale volumes:
```bash
docker-compose down -v
docker-compose up --build
```

---

## Credentials (Sample)

| Role | Email | Password |
|------|--------|----------|
| User | student@pesu.edu | student_pass_2025 |
| Admin | admin@pesu.edu | admin_pass_2025 |

---

## License

This project is for educational and internal use. Add a license before external distribution.
