# EcoTrack – CreatedAt and Startup Fixes

This update aligns the current Java model with the existing PostgreSQL schema, keeps legacy data, and automatically records creation timestamps for new records.

## Backend

- `@CreationTimestamp` is used for `createdAt` with `updatable=false`.
- Goal is mapped to existing `target_month`, `goal_year`, `target_amount`, `target_emission`, and `status` columns.
- Article is mapped to existing `summary` for `shortDescription` and uses `author` / `visible_to_users` columns.
- Goal creation/update and demo seeding populate required legacy Goal fields.
- Google client ID/secret properties are optional so username/password login can start without Google credentials.
- Backend port is 8088 and frontend Vite proxy points to 8088.
- `CreatedAtDatabaseInitializer` runs before demo seeding and backfills NULL `created_at` values using existing `updated_at` where available, otherwise the current server timestamp.

## PostgreSQL one-time migration

A copy is included at:
`carbon-footprint-backend/src/main/resources/db/created_at_migration.sql`

It is idempotent and does not delete records. It also backfills legacy created timestamps and supplies safe defaults for required legacy Goal/Article columns.

## Run

Backend:

```powershell
cd carbon-footprint-backend
mvn clean
mvn spring-boot:run
```

Frontend:

```powershell
cd carbon-footprint-frontend
npm install
npm run dev
```

Successful backend startup should show:
`Tomcat started on port 8088`
`Started CarbonFootprintApplication`
