-- migrate:up


ALTER TABLE "pg"
DROP COLUMN "cityId",
DROP COLUMN "code";

ALTER TABLE "pg" RENAME COLUMN "phone1" TO "phone";

drop table if exists "city";
drop table if exists "state";
drop table if exists "country";



-- migrate:down

