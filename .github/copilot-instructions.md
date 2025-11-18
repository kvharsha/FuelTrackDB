# Copilot / AI agent instructions for FuelTrackDB

Purpose: Help an AI programming assistant become productive quickly in this repository. Follow these concrete, project-specific rules and pointers.

Quick context
- Monorepo with two main parts:
  - `backend/` — Django 5.x REST API (MySQL), DRF, custom `CustomUser` and legacy `users` mapping.
  - `frontend/` — React + Vite + TypeScript app using MUI, react-leaflet, axios, redux-toolkit, and optional Dexie (IndexedDB) caching.
- Dev environment uses Docker Compose (`docker-compose.yml`) with services: `db` (MySQL), `api` (Django), `web` (Vite).
- DB seed: `mini_project_final.sql` — contains tables, functions `fn_distance_km`, `fn_avg_rating`, procedures `sp_update_price`, `sp_find_nearby_stations`, and example queries.

What to do first (fast onboarding checklist)
1. Read `README.md` at repo root for high-level orientation.
2. Start backend locally (recommended via Docker Compose):
   - `docker-compose up --build` (Windows PowerShell) — watch logs for DB schema mismatches.
3. If debugging DB schema issues, inspect `mini_project_final.sql` and `backend/migrations`.
4. Open `frontend/` and run Vite dev server: `cd frontend && npm ci && npm run dev` if not using Docker web container.
5. Reproduce the bug described by the user before making changes. Do not change behavior without tests or verification.

Project hotspots and where to look for behavior
- Backend API endpoints: `backend/api/views.py` (high-level routing and raw SQL stored procedure calls), serializers: `backend/api/serializers.py`, models: `backend/api/models.py`.
- Seed and DB logic: `mini_project_final.sql`. Stored procs and SQL functions are authoritative for spatial and reporting logic.
- Frontend map: `frontend/src/pages/MapPage.tsx` (large file, central UX). Navigation, fetching, and Dexie usage happens here.
- Dexie wrapper: `frontend/src/db/dexieDb.ts` (caching helpers). Dexie has caused runtime errors in multiple browsers — be defensive when touching it.
- Global state: `frontend/src/store/*` (mapSlice, stationsSlice, uiSlice, favoritesSlice) — used throughout UI.
- Small UI components: `frontend/src/components/common/*` (SidePanel, LeftRibbon, FuelChips etc.) — often sources of runtime crashes when props are undefined.

Important coding conventions (project-specific)
- Use `import type` where only types are imported (Vite + TS runtime import issues were a cause of earlier failures).
- Avoid creating callback or handler components inline inside render if they dispatch to Redux — extract them into stable components (example: `NavigationHandler.tsx`). This prevents repeated dispatch / render loops.
- Dexie/IndexedDB calls must be guarded: DB may be unavailable or corrupted. Use an init helper or feature flag to disable Dexie in CI/dev as needed.
- When rendering numbers that come from the API, coerce to `Number()` and check `Number.isFinite()` before calling `.toFixed()`. Many runtime TypeErrors came from unexpected DB values (string/null) formatted directly.
- Use defensive optional chaining in UI components that map arrays from Redux or API (e.g., `station?.name`) to prevent crashes during partial data loads.

Testing & Validation rules
- After any frontend change, run the dev server (or Docker Compose) and exercise the map page and side-panel in the browser.
- Run frontend lint/tests: in `frontend/`: `npm ci && npm run lint:ci && $env:CI='true'; npm run test:ci`.
- Backend: run Django migrations when DB schema changed; check `mini_project_final.sql` when reproducing 500s.

How to handle DB schema mismatch bugs
- If Django raises OperationalError complaining about unknown columns, compare expected model fields in `backend/api/models.py` with `mini_project_final.sql` and the running DB (inside `db` container).
- Fix options:
  - Update seed SQL to include missing columns (persist fix for fresh DBs), and apply ALTER TABLE to running DB for hot fixes when debugging.
  - Use `manage.py migrate --fake` with caution for seeded DBs that already have tables.

Debugging tips (frequent patterns)
- Use `docker-compose logs --tail=200 api` and `docker-compose exec db mysql -e "SHOW TABLES;"` to inspect state.
- To capture SQL executed by Django, temporarily enable SQL logging in `backend/core/settings.py` under LOGGING for `django.db.backends` at DEBUG.
- Browser: open DevTools console and Application → IndexedDB to inspect `FuelTrackDB` Dexie DB state.

Files to reference when working on features
- `mini_project_final.sql` — stored procedures, functions, seed data. Primary source for SQL examples to show in assignments.
- `backend/api/views.py`, `backend/api/serializers.py`, `backend/api/models.py` — API logic and DB mapping.
- `frontend/src/pages/MapPage.tsx` — main map UI; exercise carefully when changing state or effects.
- `frontend/src/db/dexieDb.ts` — caching helpers; be conservative when calling during page mount.
- `frontend/src/components/common/SidePanel.tsx` — previously triggered crashes when arrays had unexpected shapes; add defensive checks if modifying.

Pull request & change guidance
- Keep changes minimal and localized. Prefer small, verifiable commits.
- When enabling/disabling Dexie or heavy dev-only workarounds, use a clearly named feature flag (e.g., `REACT_APP_DISABLE_DEXIE`) rather than commenting code.
- Add or update a short test (Jest) for frontend logic you change where possible (e.g., ensure `getPriceColor` handles invalid inputs).

If unsure, ask the user for these exact items before editing
- Repro steps (URL + exact clicks) and screenshots or console logs.
- Whether it's OK to alter DB seed (`mini_project_final.sql`) or run ALTERs on the running DB.

Contact points in code
- Map data flows: `frontend/src/api/*` (axios wrappers) → `backend/api/views.py` → `mini_project_final.sql` (procedures/queries)
- Global state: `frontend/src/store/*` (mapSlice, stationsSlice, favoritesSlice) — update these when changing data shape.

End of guidance

If you want, I can add a short `CONTRIBUTING.md` with the exact dev commands and the disable-Dexie feature flag pattern (recommended).