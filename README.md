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
- [CI/CD Deployment Notes](#cicd-deployment-notes)
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
- **Fresh DB-safe migrations** (new servers can build from scratch without errors)

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

> Make sure `ormconfig.ts` uses **DB_HOST=postgres**, not localhost (Docker service name).

---

## Run with Docker (Fresh Server)

1. **Stop & remove old containers and volumes**

```bash
docker compose -f docker-compose.yml down -v
```

2. **Build & Start fresh containers**

```bash
docker compose -f docker-compose.yml up -d --build
```

3. **Sanity check env inside container** (optional)

```bash
docker compose -f docker-compose.yml exec app sh -lc 'echo $DB_HOST; echo $DATABASE_URL'
# Expect: DB_HOST=postgres
```

4. **Run migrations** inside the app container

```bash
docker compose -f docker-compose.yml exec app npm run migrate-and-run init
```

5. **Sanity check DB**

```bash
docker compose -f docker-compose.yml exec postgres psql -U postgres -c "\l"
```

6. **Generate & run fresh migration**

```bash
docker compose -f docker-compose.yml exec app npm run migrate-and-run init
docker compose -f docker-compose.yml exec app npm run migrate-and-run
```

7. **Seed the database** (roles, menus, permissions, mappings, super admin)

```bash
docker compose -f docker-compose.yml exec app npm run seed

```

8. **Logs**

```bash
docker compose -f docker-compose.yml logs -f app
```

App is available at `http://localhost:3000` (adjust if you remap ports).

> **Compose services** provided: `postgres`, `pgadmin` (http://localhost:5050), `redis`, `redis-commander` (http://localhost:8081), `app`.

---

## Run Locally (optional)

```bash
npm i
npm run build
# Ensure Postgres running and .env points to it
npm run migrate-and-run init
npm run seed

```

---

## Migrations

- Use **npm run migrate-and-run <name>** for any new migration.

- Use **hasTable ** / ** hasColumn** checks in alter/drop migrations to avoid fresh DB errors.

- Manual migrations: **npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli migration:create src/migrations/manual-fix**

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

## CI/CD Deployment Notes

- Pull latest code

- Build Docker image (or pull)

- Start containers:

```bash
docker compose -f docker-compose.yml up -d --build
```

- Run migrations inside app container:

```bash
docker compose -f docker-compose.yml exec app npm run migrate-and-run
```

- Optional seed (dev/staging only)

- Check logs & healthchecks

# Tips:

- `Fresh DB → run **init** migration first`

- Existing DB → run pending migrations only

- Use **hasTable ** / ** hasColumn** in migrations to avoid errors

Database Notes

- Unique constraints: **roles.roleName** , **permissions.slug**, **menus.path**

- Many-to-many relations: only owning side has @JoinTable()

- Role-Permission mapping: diff-based, safe to re-run

- users.phone nullable if public signup may not provide phone

Troubleshooting

- ECONNREFUSED 127.0.0.1:5432 → Use service name DB_HOST=postgres

- ON CONFLICT needs unique → Add unique constraint

- JoinTable metadata undefined → Check @JoinTable() on owning side

- Duplicate key on junction → Use diff-based mapper

- Compose volume mismatch → Dockerfile WORKDIR must match compose mount

✅ Following this guide ensures fresh server build, migration, and seeding will work without manual tweaks. Safe for CI/CD pipelines.

Happy shipping! 🚀
