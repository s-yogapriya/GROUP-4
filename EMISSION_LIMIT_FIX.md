# Emission Limit Startup Fix

The existing PostgreSQL `emission_limits` table requires a non-null `status` value, while the previous entity did not map it. The final package now:

- maps `status` in `EmissionLimit` with default `ACTIVE`;
- sets status explicitly in all seed/create paths;
- updates status when activating/deactivating a limit;
- reuses an existing limit by category so the unique `category_id` constraint is respected;
- backfills legacy null statuses to `ACTIVE` (or `INACTIVE` when `active=false`) in the startup compatibility initializer and SQL migration.

No data is deleted.
