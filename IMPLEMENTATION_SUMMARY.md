# EcoTrack Feature Implementation Summary

Reference/base: the uploaded ZIP project. Requirements were aligned with the uploaded Milestone 1 and Milestone 2 documents plus the supplied Recommendations, Alerts, Goals & Targets, Articles, Chatbot, Google/GitHub OAuth prompt.

## Implemented / Updated

### Recommendations & Alerts
- Top 5 user activity records are returned by highest calculated emission.
- Monthly category limits trigger HIGH_EMISSION alerts.
- Goal-exceeded alerts are generated against the user's current monthly target.
- Alert history supports read, resolve, read-all and delete operations.
- Recommendation messages are category-specific.

### Goals & Targets
- Monthly goal create/update flow is retained.
- Current-month emission progress/status is calculated from activity logs.
- Goal history is displayed with pagination.

### Articles
- Admin CRUD/publish/unpublish flow is retained.
- Users can view published/visible sustainability articles.
- Cover-image upload validation is retained.
- Admin and user article lists now have pagination.

### Chatbot
- Public predefined questions cover registration, login, application overview, carbon footprint and support.
- Authenticated predefined questions cover activity logging, categories, activity types, emission factors, history, recommendations, goals, alerts and articles.

### Authentication
- Existing Google sign-in flow is retained.
- Added GitHub OAuth2 login using Spring Security OAuth2 Client.
- Successful GitHub OAuth automatically creates an APPROVED ROLE_USER when the email is new.
- OAuth users do not enter the manual registration/admin approval workflow.
- OAuth success produces the same JWT-based application session used by normal login.
- Added frontend OAuth callback handling.

### Pagination
Added reusable **server-side database pagination** with actual page metadata and page numbers. Supported page sizes:
5, 10, 15, 20, 50.

The frontend requests only the selected page from Spring Data/JPA endpoints instead of slicing the complete dataset in the browser.

Pagination was added to:
- Category Management
- Activity Type Management
- Emission Factor Management
- User Activity History
- Admin Activity Logs
- Admin Emission Limits
- Admin Articles
- User Articles
- Alert History
- Goal History

Existing Admin Dashboard user pagination was preserved.

### Sample / Demo Data
The backend initializer now verifies/seeds realistic records directly into PostgreSQL (without deleting existing data):
- **10 approved demo users**
- **4 domain categories** (Transport, Electricity, Food, Shopping)
- **15 activity types**
- **15 emission factors**
- **4 category monthly emission limits**
- **40+ activity logs overall**, with **15+ logs for demo.user** and dates distributed across recent months for analytics
- **12 monthly goals for demo.user** plus goals for the other demo users
- **12 monthly high-emission alerts for demo.user** plus additional alerts when required
- **12 published sustainability articles**

All activity emissions are calculated from the stored emission factors, and all seeded records use valid foreign-key relationships.

Demo user:
- Username: demo.user
- Email: demo@ecotrack.local
- Password: demo123

### Database Compatibility
- Added an `emissionKg` persistence field to ActivityLog for compatibility with database versions containing the `emission_kg` column.
- New activity creation/update and seeded activity records populate both totalEmission and emissionKg.

## Main Files Created
- frontend/src/components/Pagination.jsx
- frontend/src/pages/OAuth2CallbackPage.jsx
- backend/src/main/java/com/infosys/carbonfootprint/security/OAuth2AuthenticationSuccessHandler.java

## Main Files Modified
### Backend
- pom.xml
- application.properties
- .env.example
- DataInitializer.java
- SecurityConfig.java
- ActivityLog.java
- ActivityLogServiceImpl.java
- ActivityTypeRepository.java
- AlertRepository.java

### Frontend
- .env.example
- App.jsx
- UserLoginPage.jsx
- ActivityLoggingPage.jsx
- ActivityTypeManagementPage.jsx
- CategoryManagementPage.jsx
- EmissionFactorManagementPage.jsx
- AdminActivityLogsPage.jsx
- AdminArticlesPage.jsx
- AdminEmissionLimitsPage.jsx
- AlertHistoryPage.jsx
- ArticlesPage.jsx
- GoalsPage.jsx

## Configuration
Set GitHub OAuth values in backend environment:
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
APP_FRONTEND_URL

For Google, continue setting VITE_GOOGLE_CLIENT_ID and the backend Google configuration already present in the project.

GitHub OAuth callback:
http://localhost:8080/login/oauth2/code/github

Frontend callback:
http://localhost:5173/oauth2/callback

## Run
Backend:
1. Start PostgreSQL.
2. Create/use the configured carbonfootprint database.
3. Set backend .env values.
4. Run the Spring Boot application.
5. The DataInitializer will create/verify the demo data.

Frontend:
1. Install dependencies with npm install.
2. Set frontend .env values.
3. Start with npm run dev.

## Verification
- Static Java structure/brace checks completed after the changes.
- Backend pagination endpoints and Spring Data `Pageable` repository methods were added and cross-checked against their service/controller calls.
- Frontend pagination was changed to consume backend `content`/`totalElements` metadata.
- The environment has Node/npm but no installed frontend `node_modules`; Maven is unavailable, so a full Maven/Vite runtime build could not be executed here.
- PostgreSQL is required to verify the seeded records at runtime; the initializer is designed to insert them when the application starts against the configured database.
