# FuelTrackDB — SQL Queries & Comprehensive Project README

This file merges a project-wide README, developer notes and an extensive SQL mapping guide that you can use for demonstrations, assignments, and to understand how frontend actions map to database operations. It also includes the SQL examples and stored procedure documentation from `mini_project_final.sql` and connectivity notes.

Table of contents
1. Project overview (big picture)
2. Repo layout and important files
3. How the pieces talk to each other (data flow)
4. Developer workflows (build, test, debug)
5. SQL seed, functions, procedures — summary and examples
6. Mapping UI actions → Django views → SQL (detailed)  
7. How to demonstrate frontend-driven SQL changes for an assignment
8. Debugging DB schema mismatches
9. Safe Dexie/IndexedDB handling notes
10. Example SQL snippets you can run during a demo
11. Appendix: commands and quick checks

---

## 1) Project overview (big picture)

FuelTrackDB is a small full-stack application that provides a map-based UI to find fuel/charging stations, view prices, save favorites, and manage offline map packages. The main architectural choices are:

- Backend: Django 5.x + Django REST Framework exposing REST endpoints. Authentication uses DRF token authentication. The backend includes both ORM-based views and raw SQL/stored procedures for spatial queries and aggregates.
- Database: MySQL 8.x (containerized via Docker Compose) seeded with `mini_project_final.sql`. The seed contains functions (fn_distance_km, fn_avg_rating) and stored procedures (sp_update_price, sp_find_nearby_stations) used by the app.
- Frontend: React + Vite + TypeScript with MUI UI components, react-leaflet for maps, redux-toolkit for state, axios wrappers for API calls, and optional Dexie for offline caching.
- Devops: Docker Compose orchestrates three services: db (MySQL), api (Django), web (Vite). The `mini_project_final.sql` file is the authoritative initial DB state used for development and demo data.

Why the split matters
- Spatial logic (distance calculations, nearest stations) is implemented in SQL functions/procedures for performance and to demonstrate SQL features. This is intentional: heavy aggregations and spatial filters are more efficient when done at DB level.
- The frontend is a consumer of the API; it should be designed to render whatever the API returns. For the assignment/demos you can show that a UI click issues an API call which in turn executes SQL and alters rows.


## 2) Repo layout and important files

Top-level (relevant):
- `docker-compose.yml` — orchestrates `db`, `api`, `web` containers.
- `mini_project_final.sql` — DB schema, functions, stored procedures, seed data. Primary source for SQL examples.
- `backend/` — Django project
  - `backend/manage.py`
  - `backend/core/settings.py` — Django settings
  - `backend/api/` — app containing models, serializers, views (API endpoints)
- `frontend/` — React app
  - `frontend/src/pages/MapPage.tsx` — main map UI and data loading
  - `frontend/src/db/dexieDb.ts` — Dexie wrapper (optional caching)
  - `frontend/src/components/common/SidePanel.tsx` — left navigation/side panel (favorites, recent, offline packages)
  - `frontend/src/api/*` — axios wrapper modules
  - `frontend/src/store/*` — Redux slices (mapSlice, stationsSlice, uiSlice, favoritesSlice)

Files you will open early when changing behavior:
- `mini_project_final.sql` — to understand DB functions and procedures
- `backend/api/views.py` — to see where stored procedures are called
- `frontend/src/pages/MapPage.tsx` — to see how the map calls the API and uses Dexie
- `frontend/src/db/dexieDb.ts` — for caching; often a source of runtime issues
- `frontend/src/components/common/SidePanel.tsx` — UI crash hotspot (defensive coding required)


## 3) How the pieces talk to each other (data flow)

1. The frontend calls axios wrappers like `stationsApi.getStations()` or `stationsApi.getStationFuels()`.
2. Axios sends HTTP requests to Django REST endpoints (e.g., `/api/station_fuels/`, `/api/nearby/`).
3. Backend views either use Django ORM or call raw SQL/stored procedures (via `django.db.connection.cursor()` and `cursor.callproc(...)`).
4. The DB returns rows (SELECT) or effects (INSERT/UPDATE/DELETE). Stored procedures in `mini_project_final.sql` contain the canonical SQL logic for spatial searches and price updates.
5. Backend serializes results to JSON, the frontend renders them.
6. For caching, the frontend optionally writes station and station_fuel data into Dexie (IndexedDB) for offline use.


## 4) Developer workflows (build, test, debug)

Start the full stack using Docker Compose (recommended):

- PowerShell (Windows):
```
cd d:\FuelTrackDB
docker-compose up --build
```

Frontend only (dev):
```
cd frontend
npm ci
npm run dev
```

Backend only (local venv):
```
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Testing & linting (frontend):
```
cd frontend
npm ci
npm run lint:ci
$env:CI = 'true'
npm run test:ci
npm run coverage
```

Backend coverage (example command present in repo scripts):
```
npm run coverage:backend
node scripts/check-coverage-threshold.mjs 75
```

Debugging database schema mismatches:
- Inspect `docker-compose logs --tail=200 api` for Django OperationalError messages complaining about unknown columns.
- Open `mini_project_final.sql` to find the column/function/procedure definitions expected by Django models/serializers.
- Optionally, exec into `db` container and run `ALTER TABLE` statements for hotfixing a running DB during debugging.


## 5) SQL seed, functions, procedures — summary and examples

`mini_project_final.sql` contains:
- Table DDL for stations, station_fuels, fuel_types, users, reviews, favorites, offline_packages, etc.
- Functions:
  - `fn_distance_km(lat1, lon1, lat2, lon2)` — Haversine/Great-circle distance calculation helper.
  - `fn_avg_rating(station_id)` — returns average rating (uses `reviews` table aggregation).
- Stored Procedures:
  - `sp_update_price(in_station_id, in_fuel_type_id, in_new_price)` — updates or inserts a station fuel row and marks availability.
  - `sp_find_nearby_stations(in_lat, in_lon, in_radius_km, in_fuel_type_id)` — returns stations matching fuel type within radius, calls `fn_distance_km` and `fn_avg_rating`.

These SQL constructs are intentionally rich to demonstrate joins, scalar functions, aggregates, stored procedures, and typical DML.


## 6) Mapping UI actions → Django view → SQL

How frontend changes map to SQL (for your assignment)
Short answer: the frontend talks to Django REST endpoints (axios / stationsApi / favoritesApi / offlineApi). Those endpoints run ORM operations and raw SQL (including stored procedures) on the MySQL DB. So any frontend POST/PUT/DELETE that modifies data will cause corresponding SQL INSERT/UPDATE/DELETE; GETs cause SELECTs (often JOINs) or stored procedure calls.

Concretely — mapping UI actions → Django view → SQL:

### Show nearby stations on the Map
- Frontend: calls GET `/api/nearby?lat=...&lon=...&radius_km=...&fuel_type_id=...`
- Backend view: `NearbyStationsView` (in `backend/api/views.py`) executes:
  `cursor.callproc('sp_find_nearby_stations', [lat, lon, radius_km, fuel_type_id])`
- SQL (procedure body, from `mini_project_final.sql`):
```
SELECT
  s.station_id,
  s.name,
  s.address,
  s.city,
  s.state,
  s.latitude,
  s.longitude,
  sf.price_per_unit,
  sf.is_available,
  fn_distance_km(in_lat, in_lon, s.latitude, s.longitude) AS distance_km,
  fn_avg_rating(s.station_id) AS avg_rating
FROM stations s
JOIN station_fuels sf ON sf.station_id = s.station_id AND sf.fuel_type_id = in_fuel_type_id
WHERE sf.is_available = 1
  AND fn_distance_km(in_lat, in_lon, s.latitude, s.longitude) <= in_radius_km
  AND s.status = 'Operational'
ORDER BY distance_km ASC;
```
This uses joins (stations ⇄ station_fuels), scalar functions (fn_distance_km, fn_avg_rating), and returns rows the frontend displays as map markers and popup info.

### Favorite / Unfavorite a station
- Frontend: POST `/api/favorites/` with `{ station_id }` or DELETE `/api/favorites/{station_id}/`
- Backend view:
  - POST: `FavoriteListCreateView.post()`:
    - get station via `get_object_or_404(Station, station_id=...)` → SQL: `SELECT ... FROM stations WHERE station_id = ?`
    - `Favorite.objects.get_or_create(user=request.user, station=station)` → SQL: `SELECT ... FROM favorites WHERE user_id=? AND station_id=?; INSERT INTO favorites (...)` if not exists.
  - DELETE: `FavoriteDeleteView.delete()` → gets favorite and then `favorite.delete()` → `DELETE FROM favorites WHERE user_id=? AND station_id=?`.
- Useful example SQL:
```
INSERT IGNORE INTO favorites (user_id, station_id) VALUES (...);
```

### Submit a review
- Frontend: POST `/api/reviews/` with `{ station: station_id, rating, comment }`
- Backend: `ReviewListCreateView.post()` uses `serializer.save(user=request.user)`
- SQL: `INSERT INTO reviews (station_id, user_id, rating, comment, created_at) VALUES (...);` The DB also has function `fn_avg_rating` that aggregates reviews via `GROUP BY`.

### Update price / mark unavailable (admin or via procedure)
- Backend: stored procedure `sp_update_price(in_station_id, in_fuel_type_id, in_new_price)` (present in `mini_project_final.sql`) updates or inserts into `station_fuels` and sets `last_price_update`.
- Example:
```
CALL sp_update_price(3, 2, 78.75);
```

### Search / listing of stations & joining data
- Frontend GET `/api/station_fuels/` or `/api/stations/` → Backend `StationFuelViewSet` and `StationViewSet` use Django ORM. Example SQL they produce:
```
SELECT s.*, sf.price_per_unit, ft.name
FROM stations s
JOIN station_fuels sf ON s.station_id = sf.station_id
JOIN fuel_types ft ON ft.fuel_type_id = sf.fuel_type_id
WHERE <filters>
```
- Useful SQL for assignment: see examples in `mini_project_final.sql` around the procedures and commented example `SELECT`s.


## 7) How you can demonstrate this in class (simple steps)

Show an interaction in the UI (e.g., add a favorite) and then show the DB row changed:
1. Use the Django admin or MySQL client inside the `db` container to run:
```
SELECT * FROM favorites WHERE user_id = <your_user_id>;
```
2. Or run a SQL query to show joins e.g.:
```
SELECT s.name, sf.price_per_unit, ft.name AS fuel_type
FROM station_fuels sf
JOIN stations s ON s.station_id = sf.station_id
JOIN fuel_types ft ON ft.fuel_type_id = sf.fuel_type_id
WHERE s.station_id = <the station you favorited>;
```
Show how a frontend action (POST) maps to SQL:
- Make the POST (via UI), then in DB run `SELECT * FROM favorites WHERE user_id = X;` — the new row should appear.
Show a stored procedure run:
- Call `sp_find_nearby_stations` from MySQL client and show the returned rows and the underlying SELECT (which uses JOINs and functions).


## 8) Debugging DB schema mismatches

Symptoms:
- Django OperationalError: Unknown column '...'
- 500 Internal Server Error in API logs when calling endpoints that expect different columns

Steps to triage:
1. Read the full traceback from `docker-compose logs --tail=200 api`.
2. Inspect the model which is causing the issue in `backend/api/models.py` and note expected fields.
3. Inspect `mini_project_final.sql` to see the seed schema and if the column exists.
4. Exec into the DB container and compare: `docker-compose exec db mysql -e "DESCRIBE station_fuels;"`
5. Fix options:
   - ALTER TABLE on the running DB (temporary fix while debugging).
   - Update `mini_project_final.sql` to include the required columns (persistable fix for future rebuilds).
   - If migrations exist, run `python manage.py migrate --fake-initial` carefully.
6. Restart the API container and re-check logs.

Notes:
- The repo historically needed ALTER TABLE and seed updates to match Django models — keep those edits minimal and documented.


## 9) Safe Dexie/IndexedDB handling notes (frontend)

Dexie is used to cache stations, station fuels, recents and offline packages. However:
- Browsers may report `UnknownError` or `DatabaseClosedError` when the IndexedDB is corrupted.
- To avoid the app crashing on load, always call a small `initDb()` helper that attempts `db.open()` and recovers or lets callers know to skip cache usage.
- Consider a `REACT_APP_DISABLE_DEXIE` feature flag to disable Dexie during CI or when dexie initialization fails.
- When writing UI code that depends on cache, wrap calls in try/catch and fall back to network results.

Example safe pattern (pseudocode):
```ts
let dbReady = false;
try { await initDb(); dbReady = true; } catch(e) { console.warn('Dexie failed - use network'); }
const [stationsData, fuelsData] = await Promise.all([api.getStations(), api.getStationFuels()]);
if (dbReady) { try { await dbHelpers.cacheStations(stationsData); } catch(e) { console.warn('cache failed'); } }
```


## 10) Example SQL snippets you can show (copy/paste into your assignment)

SELECT with JOIN + function:
```
SELECT s.station_id, s.name, sf.price_per_unit, fn_distance_km(12.94,77.61,s.latitude,s.longitude) AS distance_km
FROM stations s
JOIN station_fuels sf ON s.station_id = sf.station_id
WHERE sf.fuel_type_id = 2 AND sf.is_available = 1
ORDER BY distance_km ASC;
```

Insert favorite (from UI action):
```
INSERT INTO favorites (user_id, station_id) VALUES (2, 5);
```

Call the stored procedure:
```
CALL sp_find_nearby_stations(12.934056, 77.614375, 3, 2);
```

Find average rating example:
```
SELECT fn_avg_rating(1) AS avg_rating_for_station_1;
```

Bulk update example (e.g., apply a city-wide price increase):
```
UPDATE station_fuels sf
JOIN fuel_types ft ON ft.fuel_type_id = sf.fuel_type_id
JOIN stations s ON s.station_id = sf.station_id
SET sf.price_per_unit = ROUND(sf.price_per_unit * 1.015, 2),
    sf.last_price_update = NOW()
WHERE ft.name = 'Petrol' AND s.city = 'Bengaluru' AND sf.is_available = 1;
```


## 11) Appendix: commands and quick checks

- Start everything (Docker):
```
cd d:\FuelTrackDB
docker-compose up --build
```

- Tail API logs:
```
docker-compose logs --tail=200 api
```

- Exec into DB to run quick SQL (example):
```
docker-compose exec db mysql -u root -p$MYSQL_ROOT_PASSWORD -e "SELECT * FROM favorites LIMIT 10;" <db_name>
```

- Frontend dev server (alternative to web container):
```
cd frontend
npm ci
npm run dev
```

- Run frontend tests & lint (CI style):
```
cd frontend
npm ci
npm run lint:ci
$env:CI='true'
npm run test:ci
npm run coverage
```

---

# Notes for the instructor/demo (how to present)

- Show the Map UI and use the developer console to show the network request (GET /api/nearby) and explain how the DB procedure is called.
- Perform an action (favorite a station) and then in the DB client show `SELECT * FROM favorites` to prove the POST produced an `INSERT`.
- Use the SQL logging option in Django settings to capture raw SQL for students.

---

# End of file — FuelTrackDB SQL queries & project README

(If you want this split into separate `README.md` and `SQL_QUERIES.md` files instead of one big file, I can split this up.)