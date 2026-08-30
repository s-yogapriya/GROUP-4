EcoTrack final source verification

Checked in this package:
- No spring-jdbc dependency.
- Goal maps goal_year and legacy target_year and auto-synchronizes target_year.
- Goal supplies status/target_emission defaults at persist time.
- EmissionLimit supplies status/unit defaults at persist time.
- Dataset category seeding reuses existing category by code or name.
- Dataset emission-limit seeding updates/reuses an existing row instead of inserting a duplicate for the same category.
- Activity Type table order: Category Code/Name, Activity Name, Unit, Quantity, Created At, Status, Actions.
- Activity Log table order excludes Created At: Category, Activity, Activity Date, Quantity, Total Emission.
- User/Admin shells contain responsive profile/logout actions.
- Local category/article image assets are included.

A full Windows Maven/PostgreSQL runtime test must be performed on the target machine because Maven and the user's PostgreSQL instance are not available in this execution environment.
