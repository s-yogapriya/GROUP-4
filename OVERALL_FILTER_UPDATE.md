# EcoTrack Overall Filtering Update — 2026-08-29

All existing management-page filters now operate on the full loaded dataset before pagination. Changing a search/status/category filter resets the current page to 1, recalculates the matching record count, and then paginates the matching records.

Updated pages:
- Category Management
- Activity Type Management
- Emission Factor Management
- Activity Logs
- Emission Limits
- Articles
- Admin User Management
- User Alert History

Emission Factor table no longer displays Effective From. Effective-date fields remain available in the create/edit form because they are existing business data.
