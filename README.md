<!-- cd backend
# For Windows
python -m venv venv
.\venv\Scripts\activate

-- backend dependencies
pip install django==5.0.6 djangorestframework==3.15.2 djangorestframework-simplejwt==5.3.1 django-cors-headers==4.4.0 mysqlclient==2.2.4 python-dotenv==1.0.1
django: The web framework.

djangorestframework: To build your REST API.

djangorestframework-simplejwt: For user authentication tokens (login).

django-cors-headers: Crucial for allowing your React frontend to talk to your backend.

mysqlclient: The driver to connect Django to your MySQL database.

python-dotenv: A best practice for managing secret keys and database passwords.

Freeze dependencies in to a file
pip freeze > requirements.txt

start project

# The 'core' is your project's name. The '.' at the end
# places it in the current 'backend' folder, which is good practice.
django-admin startproject core .
# We'll call our app 'api'
python manage.py startapp api


cd frontend
Important: Do not activate the Python (venv) in this terminal. This is for Node.js.

# The '.' means "create the project in the current directory"
# The '-- --template react-ts' part selects the React + TypeScript template.
# This will create a package.json file and other initial files.
npm create vite@latest . -- --template react-ts

# install base dependencies 
npm install

# Install your project-specific dependencies.
# UI and Mapping Libraries
npm install @mui/material @emotion/react @emotion/styled react-leaflet

# State Management, Data Fetching, and Routing
npm install @reduxjs/toolkit react-redux dexie axios react-router-dom

@mui/material: The main MUI component library.

@emotion/react & @emotion/styled: Required peer dependencies for MUI.

react-leaflet: The mapping library.

@reduxjs/toolkit & react-redux: For state management (user, favorites).

dexie: For your offline IndexedDB storage.

axios: The best tool for making API calls to your Django backend.

react-router-dom: For handling different pages (e.g., /login, /map).

# Install development dependencies. These are for your development environment, specifically the TypeScript types for react-leaflet
npm install -D @types/react-leaflet


# Running initial set up -- backend
Run migrations (to set up the initial Django tables):
python manage.py migrate

Run the server:
python manage.py runserver

# frontend -- npm run dev

# run docker-compose -- docker-compose up --build
# The -v flag is vital here; it removes the persistent volume (fueltrackdb_fueltrack_data) which contained the corrupted, half-initialized mini_project database.
docker-compose down -v
# Stop all currently running containers from your project
# stop docker-compose -- docker-compose down --build

Service         ,Action,        Outcome
db (MySQL),"Starts, then runs mini_project_final.sql.","Creates all tables, functions, triggers, and inserts all sample data (including your Admin and Student users)."

api (Django),"Builds the image, installs Python packages, and starts the Django development server (Port 8000).",The API connects successfully to the db container using the service name db.

web (React),"Builds the image, installs Node packages (node_modules are in the container), and starts the Vite development server (Port 5173).",The React app is ready to call the API.

## Docker — quick run & environment

These are the exact commands I use for local development (PowerShell / Windows):

1. Create or update `backend/.env` from `backend/.env.example` and set any secrets.

2. Recreate and start the stack (this will build images and start services):

```powershell
docker-compose down -v
docker-compose up --build
```

3. Verify services are running:

```powershell
docker ps
docker-compose ps
```

Important environment variables (put these into `backend/.env` — an example is provided in `backend/.env.example`):

- DB_NAME: name of the MySQL database (e.g. `fuel_locator_db`)
- DB_USER: DB username (e.g. `fueltrack_user`)
- DB_PASSWORD: DB password (keep secret)
- DB_HOST: inside docker-compose this should be `db`
- DB_PORT: usually `3306` inside the container (host mapping in compose may be different)
- DEBUG: `True/False` for Django development mode
- SECRET_KEY: Django secret key (use a real secret in production)

Notes & troubleshooting
- If Docker Compose warns that `version` is obsolete, it is safe to remove that key (we've removed it here).
- If you see the DB container marked `unhealthy`, check the DB logs and healthcheck with:
	- `docker inspect --format='{{json .State.Health}}' fueltrack_db_container`
	- `docker-compose logs --tail=200 db`
- To confirm the API has connected correctly, watch the API logs: `docker-compose logs --tail=200 api` (you should see `mysqld is alive` followed by Django starting).

Manual mysql client test
If you need to test DB reachability from the API container, run this (it mirrors the wait script's behavior):

```powershell
docker-compose exec api sh -c 'mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --ssl=0 || mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD"'
```

If the mysql client errors with a TLS/SSL issue, the `--ssl=0` option (first attempt) will skip SSL verification which is appropriate for local dev. If your mysql client doesn't accept `--ssl=0`, the second attempt (no SSL flag) will be tried.

If you want, I can also add a `Makefile` or simple PowerShell script to simplify these commands.

docker-compose down
docker-compose up

docker-compose run api python manage.py makemigrations api
docker-compose run api python manage.py migrate api --fake
docker-compose up --build

User Login (Email): student@pesu.edu

User Login (Password): student_pass_2025

Admin Login (Email): admin@pesu.edu

Admin Login (Password): admin_pass_2025 -->

FuelTrackDB

Map-first fuel station locator with authentication, admin management, offline support, and smart routing.
Frontend: React + Vite + TypeScript + MUI + Leaflet.
Backend: Django + DRF + Token Auth.
DB: SQL schema (with Haversine function & stored procedure for nearby search).

This app delivers a Google-Maps-like experience: login/sign-up, a full-screen map, fuel-type filters (CNG, Petrol, Diesel, EV (AC/DC), LPG), shortest-path navigation (A* over a coarse grid with Haversine distance), favorites/recents, reviews, offline map packages, a refined UI with smooth transitions, and a role-based Admin Portal for stations/fuel types/users/reviews.

Table of Contents

Features

Tech Stack

Architecture

Directory Structure

Getting Started (Local & Docker)

Environment Variables

Scripts

Frontend Overview

Backend Overview

API Endpoints (Summary)

Data Model (Summary)

Algorithms

Offline & PWA

Admin Portal

Testing

Security & Production

Troubleshooting

Credentials (Sample)

License

Features
User-facing

Auth: Login/Signup with username & email availability checks.

Map-first UX: Full-screen react-leaflet map after login; geolocation prompt on entry.

Floating UI:

Welcome micro-toast (greets first name; gentle “breathe” hover).

Top-right Avatar menu → Preferences & Day/Night (half-moon) toggle.

Bottom-right controls → Locate-me, Zoom ±, Wi-Fi strength indicator.

Center Search (station name / place).

Left Ribbon → expands Side Panel for Favorites, Recents, Fuel chips, Reviews, Recent locations, Download maps.

Bottom-left Layer Picker → Geographical (default), Satellite, Terrain.

Filters & Sorting: Fuel type + availability; sort by distance (default), price, rating.

Routing: Draws route polyline and shows distance (km) and ETA (configurable in Preferences).

Marker cues: Price-based color coding; fade-in markers/popups; compass overlay; persisted map position/zoom.

Onboarding: One-time onboarding modal with quick tips.

PWA: Works offline with cached assets, tiles, and station data.

Admin-facing

Admin Login (separate; no signup).

Admin Portal:

Manage Stations (incl. fuels, price, availability), Fuel Types, Users, Reviews.

Inline DataGrid editing, pagination, CSV export, charts for ratings/price insights.

Success/error toasts, search & filters.

Platform & Quality

Dexie (IndexedDB): Offline stations, settings, favorites, recents, offline packages, routes.

A* grid routing (fallback to direct line) with Haversine distance math.

Performance: Lazy-loaded pages (Map/Admin/Preferences), memoized controls, code splitting, optimized animations.

Security & Ops: Rate-limited login, /api/health/ endpoint, production Dockerfiles (gunicorn/nginx), CORS & security headers, PWA.

Tech Stack

Frontend

React + Vite + TypeScript

MUI (@mui/material, @emotion/*)

react-leaflet (+ optional clustering/decorators)

@reduxjs/toolkit, react-redux

Dexie

axios

react-router-dom

Framer Motion

Vite PWA plugin

Backend

Django + Django REST Framework + authtoken

SQL schema with stored procs (Haversine/nearby)

CORS, environment-driven settings

Unit tests (pytest/unittest style via Django test runner)

Gunicorn + Whitenoise (production)

Architecture

Client calls DRF endpoints for auth, stations/fuels, reviews, favorites, nearby search, offline packages, and health check.

DB (SQL) provides stable schema + stored procedure sp_find_nearby_stations and functions (fn_distance_km, fn_avg_rating).

Routing computed client-side via coarse grid A*; distance displayed with Haversine to match server calculations.

Offline: Station lists & tiles cached; user can create “offline packages” as bboxes; app can render and work with cached data when network is weak/unavailable.

Directory Structure
D:\FuelTrackDB
├─ backend/
│  ├─ core/                # Django project
│  └─ api/                 # DRF app: models, serializers, views, urls, tests
│
├─ frontend/
│  └─ src/
│     ├─ api/              # axios clients (auth, stations, nearby, reviews, favorites, offline, admin)
│     ├─ store/            # RTK slices (auth, ui, map, stations, favorites, offline)
│     ├─ utils/            # geolocation, haversine, gridSearch (A*), wifi, fuzzy
│     ├─ db/               # dexieDb.ts (offline storage)
│     ├─ components/       # common UI (AvatarMenu, MapControls, FuelChips, LayerPicker, etc.)
│     └─ pages/            # Auth, AdminAuth, MapPage, PreferencesPage, AdminPortal

Getting Started (Local & Docker)

You can set up both backend and frontend locally or run everything via Docker Compose.
Your original step-by-step setup and Docker instructions are preserved below (Windows/PowerShell examples).

Backend (local)
cd backend
# For Windows
python -m venv venv
.\venv\Scripts\activate

# Backend dependencies
pip install django==5.0.6 djangorestframework==3.15.2 djangorestframework-simplejwt==5.3.1 django-cors-headers==4.4.0 mysqlclient==2.2.4 python-dotenv==1.0.1
# (See README notes for what each library is used for.)

# Freeze (optional)
pip freeze > requirements.txt

# Start project/app (already present in repo; commands shown for reference)
django-admin startproject core .
python manage.py startapp api

# Run migrations & server
python manage.py migrate
python manage.py runserver


(Library purposes and the initialization steps listed above mirror your original guide.)

Frontend (local)
cd frontend
# Vite React+TS template was already bootstrapped (command shown for reference):
# npm create vite@latest . -- --template react-ts

npm install
# UI & Mapping
npm install @mui/material @emotion/react @emotion/styled react-leaflet
# State/Storage/HTTP/Routing
npm install @reduxjs/toolkit react-redux dexie axios react-router-dom
# Types for react-leaflet
npm install -D @types/react-leaflet

# Dev server
npm run dev


(These steps align with your original notes.)

Docker (recommended for a unified stack)

Your original Docker workflow (preserved and clarified):

# Recreate from scratch (removes volumes, including any partially initialized DB data)
docker-compose down -v
docker-compose up --build


Verify services:

docker ps
docker-compose ps


Notes:

The DB container runs mini_project_final.sql to create tables, functions, triggers, and insert sample data.

The API (Django) connects to the DB service by name (db) inside Compose.

The React app builds and serves on its dev port (or via nginx in production image).

Manual MySQL reachability test from the API container (as in your notes):

docker-compose exec api sh -c 'mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --ssl=0 || mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD"'

Environment Variables

Create or update backend/.env (you can base it on a .env.example):

DB_NAME – e.g. fuel_locator_db

DB_USER – e.g. fueltrack_user

DB_PASSWORD – keep secure

DB_HOST – db inside docker-compose

DB_PORT – 3306 (container)

DEBUG – True/False

SECRET_KEY – strong secret in production
(This mirrors your original list; production settings now also enforce CORS/security headers.)

Scripts

Common Compose lifecycle (from your notes):

docker-compose down
docker-compose up
docker-compose up --build


If you ever need to reconcile migrations with an existing DB (rare, managed tables):

docker-compose run api python manage.py makemigrations api
docker-compose run api python manage.py migrate api --fake
docker-compose up --build

Frontend Overview

Routes

/ – Auth (Login/Signup; frosted glass; blurred background; availability checks)

/admin/login – Admin Login (no signup; minimalist)

/map – MapPage (protected)

/preferences – Preferences (protected)

/admin – Admin Portal (admin-only)

Key UI

Welcome toast → greets user’s first name; non-intrusive; parks at top-left; hover “breathe”.

Avatar (top-right) → Preferences + Day/Night theme toggle.

Map controls (bottom-right) → Locate-me, Zoom ±, Wi-Fi indicator.

Search (center) → fuzzy station search; optional place search; opens station popup & centers.

Left ribbon → expand Side Panel: Favorites, Recents, Fuel chips, Reviews, Recent locations, Offline packages.

Layer picker (bottom-left) → Geographical/Satellite/Terrain.

Compass, marker fade-in, price-based color for quick visual scanning.

State & Offline

RTK slices for auth/ui/map/stations/favorites/offline.

Dexie stores stations, settings, recents, favorites, offline packages, routes, tiles meta.

PWA service worker caches assets & prefetches tiles (configurable).

Backend Overview

Auth

Token-based login and registration, with endpoints to check email/username availability.

Domain

Stations, Fuel Types, StationFuel (price & availability), Favorites, Reviews, Offline Packages.

Nearby

/api/nearby/?lat=&lon=&radius_km=&fuel_type_id= → calls stored proc for fast, accurate distance sorting.

Utilities

/api/test/ → latency ping for Wi-Fi indicator.

/api/health/ → readiness/liveness probe (used by Docker/infra).

Permissions

Read for authenticated users; admin-only writes on stations/fuel types/users/reviews moderation.

API Endpoints (Summary)

POST /api/auth/register/

POST /api/auth/login/

POST /api/auth/check-email/

POST /api/auth/check-username/

GET /api/stations/ | POST/PUT/PATCH/DELETE (admin)

GET /api/fuel_types/ | POST/PUT/PATCH/DELETE (admin)

GET /api/nearby/?lat&lon&radius_km&fuel_type_id

GET /api/favorites/ (mine) | POST /api/favorites/ | DELETE /api/favorites/{station_id}/

GET /api/reviews?station_id= | POST /api/reviews/

GET /api/offline-packages/ (mine) | POST /api/offline-packages/ | DELETE /api/offline-packages/{id}/

GET /api/users/ (admin) | POST /api/users/{id}/toggle-block/ (admin)

GET /api/test/ (ping)

GET /api/health/ (ok/db status)

Data Model (Summary)

User (custom) – role: user / admin.

FuelType – e.g., CNG, Petrol, Diesel, EV (AC/DC), LPG.

Station – geo & address data.

StationFuel – station ↔ fuel type, price_per_unit, is_available.

Favorite – user ↔ station.

Review – user ↔ station (DB trigger enforces one per user/station).

OfflinePackage – user-owned bbox for tile/data prefetch.

Algorithms

Haversine (client & DB) — distance shown in km; ETA derived from user’s speed profile (Preferences).

A* over a coarse grid within current bounds — 8-way neighbors; step cost ≈ Haversine; iteration cap & fallback to straight line if path not found.

Grid search used to find a plausible path quickly; not a full road graph.

Offline & PWA

PWA via vite-plugin-pwa: static assets + API data caching; SPA fallback.

Dexie persists stations, favorites, settings, recents, packages, route polylines, and tile metadata.

Download maps → create offline package (bbox), prefetch tiles (z≈11–15), filter map to that area when selected.

Admin Portal

Stations – CRUD + inline edit of fuel prices/availability; status toggles.

Fuel Types – CRUD.

Users – list/search; block/unblock.

Reviews – moderate/hide/delete.

Charts – ratings distribution; avg price per fuel.

Exports – CSV for stations/users/fuels/reviews.

Testing

Backend unit tests cover:

Auth & token issuance

Nearby distance ordering via stored proc

Reviews (duplicate prevention)

Favorites add/remove

Admin-only operations

Run via Django test runner (python manage.py test) or inside Docker (docker-compose run api python manage.py test).

Security & Production

Rate limiting on login (e.g., 5 attempts/min).

/api/health/ for container health checks.

CORS configured for your frontend origin.

Security headers enabled; DEBUG=False in production.

Docker production images:

Backend: Gunicorn + Whitenoise

Frontend: Vite build served by nginx (gzip, caching, SPA fallback)

Secrets via environment variables; never commit real keys.

Troubleshooting

From your original notes (selected tips):

If the DB container is unhealthy, inspect logs:

docker inspect --format='{{json .State.Health}}' <db_container>

docker-compose logs --tail=200 db

To confirm API → DB connectivity, tail API logs:

docker-compose logs --tail=200 api

If a stale volume caused a half-initialized DB, recreate volumes:

docker-compose down -v then docker-compose up --build

Credentials (Sample)

(For local testing; from your seeded data)

User
Email: student@pesu.edu
Password: student_pass_2025

Admin
Email: admin@pesu.edu
Password: admin_pass_2025

License

This project is for educational and internal demonstration use. Add an explicit license if/when you plan external distribution.