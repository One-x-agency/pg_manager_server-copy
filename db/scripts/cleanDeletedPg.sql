

with pg_to_be_delete as (
    select * from "pg" where
    "isDeleted" = true
)

delete from "staffDocument" where "pgId" in (select "id" from pg_to_be_delete);
delete from "staff" where "pgId" in (select "id" from pg_to_be_delete);
delete from "guestDocument" where "pgId" in (select "id" from pg_to_be_delete);
delete from "monthlyPayment" where "pgId" in (select "id" from pg_to_be_delete);;
delete from "guest" where "pgId" in (select "id" from pg_to_be_delete);
delete from "roomLightBillHistory" where "pgId" in (select "id" from pg_to_be_delete););
delete from "room" where "pgId" in (select "id" from pg_to_be_delete);
delete from "inquiry" where "pgId" in (select "id" from pg_to_be_delete);
delete from "reminder" where "pgId" in (select "id" from pg_to_be_delete);
delete from "userPgAccess" where "pgId" in (select "id" from pg_to_be_delete);
delete from "pg" where "id" in (select "id" from pg_to_be_delete);
