-- migrate:up

DROP INDEX IF EXISTS "uc_pg_code";

ALTER TABLE "pg"
DROP CONSTRAINT IF EXISTS "pg_code_key";

ALTER TABLE "pg"
ALTER COLUMN "code" DROP NOT NULL;

-- migrate:down

