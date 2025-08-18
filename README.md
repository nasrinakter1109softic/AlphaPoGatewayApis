# Alphapro Gateway Server — Dockerized README

A production‑ready, Dockerized NestJS + TypeORM (0.3) backend with PostgreSQL. Includes clean workflows for migrations, idempotent seeding, and role/permission mapping tailored to this project.

> **Stack**: Node (TypeScript), NestJS, TypeORM 0.3, PostgreSQL, Docker Compose

---

## Table of Contents
- Overview
- Requirements
- Project Structure
- Configuration (.env)
- Run with Docker
- Run Locally (optional)
- Migrations
- Seeding
- NPM Scripts
- CI/CD Deployment Notes
- Database Notes
- Troubleshooting

---

## Overview
This service acts as a gateway server for payment/merchant operations. It provides Role‑Based Access Control (RBAC) using **Roles ↔ Permissions ↔ Menus** and integrates provider‑specific logic (e.g., **Alphapo**). The repository ships with:

- Dockerized app + DB + Redis + tooling
  - pgAdmin (http://localhost:5050)
  - Redis Commander (http://localhost:8081)
- TypeORM DataSource config (no legacy createConnection)
- Migration helper (`migrate-and-run`)
- Idempotent seeding for Roles, Menus, Permissions, and Super Admin
- Diff-based mapping of permissions/menus to roles
- Fresh DB-safe migrations (new servers can build from scratch without errors)

---

## CI/CD Deployment Notes

**Recommended workflow for CI/CD deployments:**

1. Pull latest code from Git:
```bash
git fetch origin
git checkout development
git pull
```
2. Build and start containers (do NOT drop volumes to preserve data):
```bash
docker compose -f docker-compose.yml down
docker compose -f docker-compose.yml up -d --build
```
3. Run pending migrations inside the app container:
```bash
docker compose -f docker-compose.yml exec app npm run migrate-and-run
```
4. Seed the database only if it is fresh (idempotent):
```bash
docker compose -f docker-compose.yml exec app npm run seed
```
5. Verify logs & container health:
```bash
docker compose -f docker-compose.yml logs -f app
```

✅ This ensures:

- Existing data is preserved
- Only new migrations are applied
- Seeding happens automatically only for fresh databases
- Safe for CI/CD pipelines

---

## Run with Docker (Fresh Server)

1. Stop & remove old containers and volumes (for fresh DB only):
```bash
docker compose -f docker-compose.yml down -v
```
2. Start fresh containers:
```bash
docker compose -f docker-compose.yml up -d --build
```
3. Sanity check DB:
```bash
docker compose -f docker-compose.yml exec postgres psql -U postgres -c "\l"
```
4. Generate & run fresh migration:
```bash
docker compose -f docker-compose.yml exec app npm run migrate-and-run init
docker compose -f docker-compose.yml exec app npm run migrate-and-run
```
5. Seed database:
```bash
docker compose -f docker-compose.yml exec app npm run seed
```

---

## Run Locally (Optional)
```bash
npm i
npm run build
# Ensure Postgres running and .env points to it
npm run migrate-and-run init
npm run seed
```

---

## Migrations

- Generate & run new migration:
```bash
npm run migrate-and-run <name>
```
- Manual migrations if needed:
```bash
npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli migration:create src/migrations/manual-fix
```

---

## Seeding

- Standard seed:
```bash
npm run seed
```
- Reset + seed (dev only):
```bash
npm run seed:reset
```
- Extra test data:
```bash
SEED_EXTRA_DATA=true npm run seed
```

---

## Database Notes

- Unique constraints: roles.roleName, permissions.slug, menus.path
- Many-to-many relations: only owning side has @JoinTable()
- Role-Permission mapping: diff-based, safe to re-run
- users.phone nullable if public signup may not provide phone

---

## Troubleshooting

- ECONNREFUSED 127.0.0.1:5432 → Use service name DB_HOST=postgres
- ON CONFLICT needs unique → Add unique constraint
- JoinTable metadata undefined → Check @JoinTable() on owning side
- Duplicate key on junction → Use diff-based mapper
- Compose volume mismatch → Dockerfile WORKDIR must match compose mount

✅ Following this guide ensures fresh server build, migration, and seeding will work without manual tweaks. Safe for CI/CD pipelines.

Happy shipping! 🚀
