-- CockroachDB migration: stable public identity for profiles.
-- Run once against the production database before deploying the backend
-- that reads profile.public_id (apply with `cockroach sql` or the Cloud console).
--
-- 1. Add the column. New users get a UUID from the frontend at registration.
ALTER TABLE profile ADD COLUMN IF NOT EXISTS public_id STRING;

-- 2. Backfill existing rows. The frontend's D1 migration uses the same
--    'legacy-<id>' value for the same integer, so both sides agree without
--    transferring data.
UPDATE profile SET public_id = 'legacy-' || id::STRING WHERE public_id IS NULL;

-- 3. Enforce uniqueness and make lookups by public id fast.
CREATE UNIQUE INDEX IF NOT EXISTS profile_public_id_key ON profile (public_id);

-- 4. The integer id is now internal: let the database assign it.
ALTER TABLE profile ALTER COLUMN id SET DEFAULT unique_rowid();

-- Rollback (if ever needed):
-- ALTER TABLE profile ALTER COLUMN id DROP DEFAULT;
-- DROP INDEX IF EXISTS profile@profile_public_id_key;
-- ALTER TABLE profile DROP COLUMN IF EXISTS public_id;
