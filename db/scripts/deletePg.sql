



delete from "staffDocument" where "pgId" = $1;
delete from "staff" where "pgId" = $1;
delete from "guestDocument" where "pgId" = $1;
delete from "monthlyPayment" where "pgId" = $1;
delete from "guest" where "pgId" = $1;
delete from "roomLightBillHistory" where "pgId" = $1;
delete from "room" where "pgId" = $1;
delete from "inquiry" where "pgId" = $1;
delete from "reminder" where "pgId" = $1;
delete from "userPgAccess" where "pgId" = $1;
delete from "pg" where "id" = $1;
