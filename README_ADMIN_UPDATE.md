# EcoTrack Admin/User Dashboard Update — 2026-08-29

## Included changes
- Fixed admin Category page robustness and local category image fallbacks.
- Added a render error boundary so admin/user pages show a recoverable error instead of a blank screen.
- Activity Type table order: Category Code + Category Name -> Activity Name -> Unit -> Quantity -> Created At -> Status -> Actions.
- Added categoryCode to ActivityType API responses and server-side sorting by category code/name/activity name.
- Activity Logs charts now use explicit visible colors on the dark theme and retain the requested table order: Category -> Activity -> Activity Date -> Quantity -> Total Emission.
- Added an idempotent extended dataset: Water, Waste Management, Agriculture, and Buildings & Heating categories, related activity types, emission factors, emission limits, and 70+ total activity logs when the database has fewer than that amount.
- Added four more articles and assigned unique local article images; existing seeded article titles are mapped to unique local images.
- Added local category/article SVG assets so dashboard visuals do not depend on third-party image hosts.
- Hardened Admin Dashboard and User Dashboard API response handling.
- Preserved existing business logic and existing records; extended seeding only adds missing records or fills missing visuals.

## Runtime verification performed here
- All frontend JSX/JS source files passed a TypeScript syntax transpile check.
- Modified Java source files passed basic structural brace/parenthesis checks.
- A full Maven build could not be run in this environment because Maven is not installed.
