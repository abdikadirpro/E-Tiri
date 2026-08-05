# e-Tiri

**Ganacsigaaga si fudud u maamul** — Manage your business easily.

A multi-tenant SaaS business-management app: income & expenses, sales/POS, inventory, customers & suppliers, debts, and reports — for small businesses.

## Stack

| Layer    | Tech                                   |
|----------|-----------------------------------------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend  | Node.js + Express + TypeScript          |
| Database | PostgreSQL + Prisma ORM                 |
| Auth     | JWT (httpOnly cookie)                   |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or a connection string to a hosted instance)

## Setup

```bash
# 1. Install all workspace dependencies
npm install

# 2. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# edit backend/.env with your DATABASE_URL, a strong JWT_SECRET, and a strong ADMIN_KEY

# 3. Create the database schema
npm run db:migrate -w backend

# 4. (optional) seed demo data
npm run db:seed -w backend

# 5. Run both apps in dev mode
npm run dev
```

- Backend: http://localhost:4000
- Frontend: http://localhost:5173

## Local development database (Windows, no separate PostgreSQL install)

This machine already has a PostgreSQL 17 installation but no known superuser password, so local
dev uses a second, self-contained PostgreSQL data directory that isn't a Windows service:

- Data lives in `%USERPROFILE%\.e-tiri\pgdata`, running on port `5433`
- `backend/.env`'s `DATABASE_URL` already points at it (`postgresql://etiri@127.0.0.1:5433/e_tiri`)

It does **not** start automatically — start it before `npm run dev`, stop it when you're done:

```bash
npm run db:start -w backend   # start the local dev database
npm run db:stop -w backend    # stop it
```

If you'd rather use your existing PostgreSQL 17 service (or a hosted database) instead, just change
`DATABASE_URL` in `backend/.env` to point at it and skip `db:start`/`db:stop`.

## Provisioning businesses

Registration is **not** self-service. New businesses are created via a hidden page at
`/admin/create-business`, which requires the `ADMIN_KEY` you set in `backend/.env`. Open it,
enter the admin key plus the business/owner details, and hand the resulting email + password
to the business owner so they can log in at `/login`. There is no public signup route.

## Deployment

The backend serves the built frontend itself in production (single origin, no CORS/cross-site
cookie issues). Deploy via Render using the included `render.yaml` Blueprint:

1. On [render.com](https://render.com), **New +** → **Blueprint** → connect this GitHub repo.
2. Render reads `render.yaml` and provisions a free Postgres database plus a free web service,
   wiring `DATABASE_URL` automatically and generating `JWT_SECRET`/`ADMIN_KEY` for you.
3. After the first deploy, open the web service's **Environment** tab to reveal the generated
   `ADMIN_KEY` — you'll need it at `/admin/create-business` to create the first real business.

Free-tier notes: the web service sleeps after 15 minutes idle (cold start ~30-60s on the next
request), and the free Postgres database is deleted after 90 days unless upgraded.

## Folder structure

```
e-tiri/
├── backend/    # Express + Prisma API
└── frontend/   # React + Vite + Tailwind app
```

## Available scripts (root)

- `npm run dev` — run backend + frontend together
- `npm run build` — build both apps
- `npm run lint` — lint both apps
