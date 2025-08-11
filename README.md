# Alphapro Gateway Server — Dockerized README

A production‑ready, Dockerized NestJS + TypeORM (0.3) backend with PostgreSQL. Includes clean workflows for migrations, idempotent seeding, and role/permission mapping tailored to this project.

> **Stack**: Node (TypeScript), NestJS, TypeORM 0.3, PostgreSQL, Docker Compose

---

## Table of Contents
- [Overview](#overview)
- [Requirements](#requirements)
- [Project Structure](#project-structure)
- [Configuration (.env)](#configuration-env)
- [Run with Docker](#run-with-docker)
- [Run Locally (optional)](#run-locally-optional)
- [Migrations](#migrations)
- [Seeding](#seeding)
- [NPM Scripts](#npm-scripts)
- [API Modules](#api-modules)
- [Database Notes](#database-notes)
- [Troubleshooting](#troubleshooting)

---

## Overview
This service acts as a gateway server for payment/merchant operations. It provides Role‑Based Access Control (RBAC) using **Roles ↔ Permissions ↔ Menus** and integrates provider‑specific logic (e.g., **Alphapo**). The repository ships with:

- **Dockerized** app + DB + Redis + tooling (pgAdmin, redis-commander)
- **TypeORM DataSource** config (no legacy createConnection)
- **Migration helper** (`migrate-and-run`)
- **Idempotent seeding** for Roles, Menus, Permissions, and Super Admin
- **Diff‑based mapping** of permissions/menus to roles (safe to re‑run)

---

## Requirements
- **Docker** 24+ & **Docker Compose** v2
- (Optional) **Node.js 18+** & **npm** for running scripts on host

---

## Project Structure
```
.
├─ docker-compose.yml              # ← compose file used by this repo
├─ Dockerfile
├─ src/
│  ├─ config/ormconfig.ts
│  ├─ role/entity/role.entity.ts
│  ├─ permission/entity/permission.entity.ts
│  ├─ menu/entity/menu.entity.ts
│  ├─ user/entity/user.entity.ts
│  ├─ ... controllers/services/modules ...
├─ scripts/
│  ├─ migrate-and-run.ts
│  └─ seeds/
│     ├─ seed.ts
│     ├─ reset-and-seed.ts
│     ├─ seedRoles.ts
│     ├─ seedMenus.ts
│     ├─ permissions.list.ts
│     ├─ seedAllPermissions.ts
│     ├─ mapPermissionsToRolesAndMenus.ts
│     └─ seedSuperAdminUser.ts
├─ package.json
├─ tsconfig.json
└─ .env  (not committed)
```

---

## Configuration (.env)
Create a `.env` at project root (copy from `.env.example` if present):

```
# App
NODE_ENV=development
APP_PORT=3000

# Database (container service names)
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=alphapolocaldb
# Or use a single URL instead of the above:
# DATABASE_URL=postgres://postgres:postgres@postgres:5432/alphapolocaldb

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=123456

# Auth/Security (examples)
JWT_SECRET=change-me
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# Seeding flags
SEED_EXTRA_DATA=false

# Super Admin seed (optional)
SA_NAME=Super Admin
SA_EMAIL=admin@alphapro.local
SA_PASSWORD=Admin@123456
SA_PHONE=
SA_RESET_PASSWORD=false
```

Ensure `ormconfig.ts` uses **DB_HOST=postgres** (service name inside Docker), not `localhost`.

---

## Run with Docker

> This repo uses **`docker-compose.yml`** (not the default name), so pass `-f docker-compose.yml`.

1) **Build & start** services
```bash
docker compose -f docker-compose.yml up -d --build
```

2) **Sanity check env inside container** (optional)
```bash
docker compose -f docker-compose.yml exec app sh -lc 'echo $DB_HOST; echo $DATABASE_URL'
# Expect: DB_HOST=postgres
```

3) **Run migrations** inside the app container
```bash
docker compose -f docker-compose.yml exec app npm run migrate-and-run init
```

4) **Seed the database** (roles, menus, permissions, mappings, super admin)
```bash
docker compose -f docker-compose.yml exec app npm run seed
```

5) **Logs**
```bash
docker compose -f docker-compose.yml logs -f app
```

App is available at `http://localhost:3000` (adjust if you remap ports).

> **Compose services** provided: `postgres`, `pgadmin` (http://localhost:5050), `redis`, `redis-commander` (http://localhost:8081), `app`.

---

## Run Locally (optional)
```bash
npm i
npm run build   # or ts-node for dev
# Make sure Postgres is running locally and .env points to it
npm run migrate-and-run init
npm run seed
```

---

## Migrations
Generate & run in one go:
```bash
npm run migrate-and-run add-some-change
```
If you get **“No changes in database schema were found”**, either:
- Entities aren’t picked by the DataSource `entities` glob, or
- You need a manual migration:
```bash
npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli migration:create src/migrations/manual-fix
# edit the file and add SQL up/down
npm run migrate-and-run manual-fix
```

Dry‑run (generate only) is available if you added a `migrate:dry` script.

---

## Seeding

### Standard seed
Seeds Roles, Menus, the project’s Permissions list, maps them to roles/menus, and ensures a **Super Admin** user from env.
```bash
npm run seed
```

### Reset + seed (dev only)
Truncates seed‑related tables with CASCADE and re‑seeds.
```bash
npm run seed:reset
```

### Extra test data
Enable via env and re-run seed:
```bash
SEED_EXTRA_DATA=true npm run seed
```

---

## NPM Scripts
Common scripts wired for this repo:
```json
{
  "scripts": {
    "start:dev": "nest start --watch",
    "migrate-and-run": "ts-node -r tsconfig-paths/register scripts/migrate-and-run.ts",
    "seed": "ts-node -r tsconfig-paths/register scripts/seeds/seed.ts",
    "seed:reset": "ts-node -r tsconfig-paths/register scripts/seeds/reset-and-seed.ts",
    "migrate:dry": "ts-node scripts/migrate-and-run.ts --dry"
  }
}
```

---

## API Modules
High‑level modules/controllers included in this project (routes vary by implementation):

- **AuthController** — login/logout, refresh, profile, password ops
- **CompanyController** — CRUD, status toggle, API key rotate, settlement config
- **CurrencyController** — CRUD, provider sync
- **MenuController** — CRUD for app navigation items
- **PermissionController** — CRUD for RBAC permissions
- **RoleController** — CRUD and assign permissions to roles
- **DepositController** — list/view/create manual/approve/reject/export
- **TransactionCallbackController** — list/view/retry/reprocess callbacks
- **UploadController** — file upload/list/view/delete
- **AppController** — health/status/cache utilities
- **AlphapoController** — provider ops: balance, address, withdraw, sync

> For exact routes/DTOs, check the corresponding `*.controller.ts` files or Swagger if enabled.

---

## Database Notes
- **Uniqueness for upserts**: ensure `roles.roleName`, `permissions.slug`, `menus.path` are `@Column({ unique: true })`.
- **Many‑to‑many**: keep `@JoinTable()` only on the **owning side** (this project uses **Roles** as owning side for `permissions` and `menus`).
- **Mapper**: `mapPermissionsToRolesAndMenus.ts` uses **diff‑based** sync to avoid duplicate junction inserts.
- **Users.phone**: if public signup allows no phone, set `users.phone` to `nullable: true` and run a migration (`ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;`).

---

## Troubleshooting

**ECONNREFUSED 127.0.0.1:5432 inside container**  
Your app is trying to connect to Postgres at `localhost`. Inside Docker, use the **service name**: set `DB_HOST=postgres` (or `DATABASE_URL=...@postgres:5432/...`) and ensure `ormconfig.ts` reads it.

**ON CONFLICT needs unique**  
> `there is no unique or exclusion constraint matching the ON CONFLICT specification`  
Add unique constraints on natural keys used for upsert (e.g., `slug`, `roleName`, `path`).

**JoinTable metadata undefined**  
> `Cannot read properties of undefined (reading 'tableName'|'tablePath')`  
Ensure `@JoinTable()` exists on one side of each many‑to‑many relation (owning side).

**Duplicate key on junction**  
> `duplicate key value violates unique constraint ... (role_id, permission_id)`  
Use the provided **diff‑based** mapper (adds/removes only changes) instead of bulk re‑add.

**Path aliases not resolving**  
Run scripts with `-r tsconfig-paths/register` or import it in the script file.

**Compose volume path mismatch**  
Make sure Dockerfile `WORKDIR` (default here `/usr/src/app`) matches the compose mount path: `- .:/usr/src/app`.

---

Happy shipping! 🚀
