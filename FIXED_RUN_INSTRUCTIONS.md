# EcoTrack Fixed Run Instructions

## Backend

Open PowerShell in `carbon-footprint-backend` and run:

```powershell
mvn clean
mvn spring-boot:run
```

Expected startup lines:

```text
Tomcat started on port 8088
Started CarbonFootprintApplication
```

## Frontend

Open a second PowerShell in `carbon-footprint-frontend` and run:

```powershell
npm install
npm run dev
```

Expected URL:

```text
http://localhost:5173
```

## Database date/time

The backend automatically ensures `created_at` exists on the relevant tables and backfills NULL values with the current database/server timestamp. New records receive their own creation timestamp from Hibernate `@CreationTimestamp` and the entity column is `updatable = false`.

No `createdAt` value is required in POST payloads.
