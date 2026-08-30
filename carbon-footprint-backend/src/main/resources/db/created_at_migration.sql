-- EcoTrack CreatedAt migration/backfill
-- Safe to run more than once. Existing data is preserved.

DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users','addresses','government_ids','roles','categories','activity_types',
        'emission_factors','activity_logs','goals','articles','alerts','emission_limits'
    ]
    LOOP
        EXECUTE format('ALTER TABLE IF EXISTS %I ADD COLUMN IF NOT EXISTS created_at TIMESTAMP', t);
    END LOOP;
END $$;

UPDATE users SET created_at = COALESCE(updated_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL;
UPDATE addresses SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE government_ids SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE roles SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE categories SET created_at = COALESCE(updated_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL;
UPDATE activity_types SET created_at = COALESCE(updated_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL;
UPDATE emission_factors SET created_at = COALESCE(updated_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL;
UPDATE activity_logs SET created_at = COALESCE(updated_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL;
UPDATE goals SET created_at = COALESCE(updated_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL;
UPDATE articles SET created_at = COALESCE(updated_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL;
UPDATE alerts SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE emission_limits SET created_at = COALESCE(updated_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL;

-- Preserve existing required columns used by the current Java model.
UPDATE goals SET status = 'IN PROGRESS' WHERE status IS NULL;
UPDATE goals SET target_emission = target_amount WHERE target_emission IS NULL;
ALTER TABLE goals ALTER COLUMN status SET DEFAULT 'IN PROGRESS';
ALTER TABLE goals ALTER COLUMN target_emission SET DEFAULT 0;

UPDATE articles SET author = 'EcoTrack Admin' WHERE author IS NULL;
UPDATE articles SET visible_to_users = FALSE WHERE visible_to_users IS NULL;
ALTER TABLE articles ALTER COLUMN author SET DEFAULT 'EcoTrack Admin';
ALTER TABLE articles ALTER COLUMN visible_to_users SET DEFAULT FALSE;

-- Preserve existing required emission-limit status for legacy rows.
UPDATE emission_limits SET status = CASE WHEN active THEN 'ACTIVE' ELSE 'INACTIVE' END WHERE status IS NULL;
ALTER TABLE emission_limits ALTER COLUMN status SET DEFAULT 'ACTIVE';
