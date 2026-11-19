-- migrate:up


alter table "account"
add column "accountNumber" SERIAL unique;

-- migrate:down


alter table "account"
drop column "accountNumber";
