-- migrate:up

ALTER TABLE "account"
ALTER COLUMN "password" DROP NOT NULL;



-- migrate:down

