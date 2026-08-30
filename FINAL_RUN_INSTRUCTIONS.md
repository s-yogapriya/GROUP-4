ECO TRACK FINAL PACKAGE

IMPORTANT:
Use this package only. Do not mix files from previous EcoTrack ZIPs.

Backend:
  cd carbon-footprint-backend
  mvn clean
  mvn spring-boot:run

Expected:
  Tomcat started on port 8088
  Started CarbonFootprintApplication

Frontend (second terminal):
  cd carbon-footprint-frontend
  npm install
  npm run dev

Expected:
  http://localhost:5173

This package contains:
- CreatedAt automatic generation via @CreationTimestamp.
- Existing created_at values are preserved.
- Missing created_at values are backfilled at startup.
- Goal legacy columns target_year/goal_year are synchronized.
- Goal target_emission/status are populated and protected by defaults.
- Article legacy schema compatibility is preserved.
- Google OAuth client properties are optional for startup.
- Vite proxy targets backend port 8088.
