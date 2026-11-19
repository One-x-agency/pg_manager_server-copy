-- migrate:up

alter table "guest"
alter column "checkInDate" type date,
alter column "checkOutDate" type date,
alter column "dateOfNotice" type date;

alter table "monthlyPayment"
alter column "date" type date;

-- migrate:down

alter table "guest"
alter column "checkInDate" type timestamp,
alter column "checkOutDate" type timestamp,
alter column "dateOfNotice" type timestamp;

alter table "monthlyPayment"
alter column "date" type timestamp;
