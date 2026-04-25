# BuyMe Auction Platform

BuyMe is a full-stack auction platform built for CS 527 (Database Systems).
The project includes:

- A Flask + SQLAlchemy backend API
- A React + Vite frontend
- A MySQL schema and optional sample data seeding utility

## Project Structure

- `backend/` - main backend API used by the frontend
- `frontend/` - React TypeScript client
- `schema.sql` - database schema setup script
- `buyme_full_dump.sql` - full DB dump (schema + data snapshot)
- `db_connector.py` - optional seeding utility API
- `app.py` - separate Flask tutorial/legacy file (not the main backend service)

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm (or bun, but npm is documented below)
- MySQL 8+

## 1. Clone and Enter the Project

```bash
git clone <your-repo-url>
cd CS527_DBDS_Project_BuyMe
```

## 2. Database Setup (MySQL)

Import the database using the full dump file:

```bash
mysql -u root -p < buyme_full_dump.sql
```

Default DB name expected by backend code: `buyme`.

## 3. Backend Setup

From the repository root:

```bash
python3 -m venv venv
source venv/bin/activate
pip3 install -r backend/requirements.txt
```

### Configure DB Credentials

Edit the DB values in `backend/app.py`:

- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`

Run backend API:

```bash
cd backend
flask --app app run --port 5001
```

Health check:

- `http://127.0.0.1:5001/`

Expected response:

```json
{"message": "BuyMe API is running"}
```

## 4. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

- `http://localhost:5173`

The Vite dev server proxies `/api` calls to `http://localhost:5001`.

## 5. Optional: Seed Data Utility

If you want to quickly seed users/items/bids from HTTP endpoints, run:

```bash
source venv/bin/activate
python db_connector.py
```

Then call:

```bash
curl -X POST http://127.0.0.1:5000/seed/all
```


## Recommended Local Checks

Frontend:

```bash
cd frontend
npm run lint
npm run test
```

Backend:

- Start backend and verify key endpoints used by your feature.
- Validate DB changes by re-exporting `buyme_full_dump.sql` after updates.

## Common Issues

- `Access denied for user`:
  Verify DB credentials in `backend/app.py` and MySQL user permissions.
- Frontend cannot reach API:
  Confirm backend is running on port `5001`.
- Empty data in UI:
  Ensure `buyme_full_dump.sql` was imported into MySQL and optionally run the seed utility.

## Course Context

This repository is for academic project use in CS 527. Coordinate schema changes and API contract changes with the full team before merging.


