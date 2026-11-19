-- migrate:up


-- #region Country
CREATE TABLE IF NOT EXISTS "country" (
    "id" UUID DEFAULT GEN_RANDOM_UUID(),
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pk_country" PRIMARY KEY ("id"),
    constraint "uc_country_name" unique("name")
);
-- #endregion

-- #region State
CREATE TABLE IF NOT EXISTS "state" (
    "id" UUID DEFAULT GEN_RANDOM_UUID(),
    "countryId" UUID not null,
    "name" VARCHAR(100) unique NOT NULL,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pk_state" PRIMARY KEY ("id"),
    constraint "uc_state_name" unique("name"),
    CONSTRAINT "fk_state_countryId" FOREIGN KEY ("countryId") REFERENCES "country" ("id")
);
-- #endregion

-- #region City
CREATE TABLE IF NOT EXISTS "city" (
    "id" UUID DEFAULT GEN_RANDOM_UUID(),
    "stateId" UUID not null,
    "name" VARCHAR(100) unique NOT NULL,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pk_city" PRIMARY KEY ("id"),
    constraint "uc_city_name" unique("name"),
    CONSTRAINT "fk_city_stateId" FOREIGN KEY ("stateId") REFERENCES "state" ("id")
);
-- #endregion

-- #region Account
create table if not exists "account"(
	"id" UUID DEFAULT GEN_RANDOM_UUID(),
  -- TODO: "name" should be required
  "name" VARCHAR(100),
	"email" VARCHAR(100) NOT NULL,
  "isEmailVerified" boolean not null default false,
	"phone" VARCHAR(20) NOT NULL,
  "isPhoneVerified" boolean not null default false,
	"password" VARCHAR(500) NOT NULL,
  "isVerified" boolean not null default false,
	"isDeleted" BOOLEAN not null default false,
	"createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
	CONSTRAINT "pk_account" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "uc_account_email" ON "account" ("email") WHERE "isDeleted" = false;
CREATE UNIQUE INDEX IF NOT EXISTS "uc_account_phone" ON "account" ("phone") WHERE "isDeleted" = false;
-- #endregion

-- #region PG
create table if not exists "pg"(
	"id" UUID DEFAULT GEN_RANDOM_UUID(),
	"accountId" UUID not null,
  "code" VARCHAR(30) NOT NULL unique,
	"name" varchar(100) not null,
	"type" varchar(20) not null check ("type" in ('boys','girls','both')) default 'both',
	"phone1" VARCHAR(20) null,
	"phone2" VARCHAR(20) null,
	"email" VARCHAR(100) NULL,
  "cityId" UUID not null,
  "address" varchar(1000) null,
  "isDeleted" BOOLEAN not null default false,
	"createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
	CONSTRAINT "pk_pg" PRIMARY KEY ("id"),
	CONSTRAINT "fk_pg_accountId" FOREIGN KEY ("accountId") REFERENCES "account" ("id"),
	CONSTRAINT "fk_pg_cityId" FOREIGN KEY ("cityId") REFERENCES "city" ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "uc_pg_code" ON "pg" ("code") WHERE "isDeleted" = false;
CREATE UNIQUE INDEX IF NOT EXISTS "uc_pg_accountId_name" ON "pg" ("accountId","name") WHERE "isDeleted" = false;
-- #endregion

-- #region User
create table if not exists "user"(
	"id" UUID DEFAULT GEN_RANDOM_UUID(),
	"pgId" UUID null,
	"isRootUser" boolean not null default false,
	"username" varchar(100) not null,
	"password" varchar(500) null,
	"phone" varchar(20) null,
	"isDeleted" BOOLEAN not null default false,
	"createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
	CONSTRAINT "pk_user" PRIMARY KEY ("id"),
	CONSTRAINT "fk_user_pgId" FOREIGN KEY ("pgId") REFERENCES "pg" ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "uc_user_pgId_isRootUser_username" ON "user" ("pgId","isRootUser","username") WHERE "isDeleted" = false;
-- #endregion

-- #region Room
create table if not exists "room"(
	"id" UUID DEFAULT GEN_RANDOM_UUID(),
	"pgId" UUID NOT NULL,
	"name" varchar(100) not null,
	"capacity" integer not null,
	"rent" integer not null,
  "tags" TEXT[],
  "info" text,
	"isDeleted" BOOLEAN not null default false,
	"createdBy" UUID,
	"updatedBy" UUID,
	"deletedBy" UUID,
	"createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
	CONSTRAINT "pk_room" PRIMARY KEY ("id"),
	CONSTRAINT "fk_room_pgId" FOREIGN KEY ("pgId") REFERENCES "pg" ("id"),
	CONSTRAINT "fk_room_createdBy" FOREIGN KEY ("createdBy") REFERENCES "user" ("id"),
	CONSTRAINT "fk_room_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id"),
	CONSTRAINT "fk_room_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES "user" ("id"),
  constraint "uc_room_pgId_name" UNIQUE("pgId","name")
);
CREATE UNIQUE INDEX IF NOT EXISTS "uc_room_pgId_name" ON "room" ("pgId","name") WHERE "isDeleted" = false;
-- #endregion

-- #region Guest
create table if not exists "guest"(
	"id" UUID DEFAULT GEN_RANDOM_UUID(),
	"pgId" UUID NOT NULL,
	"firstName" varchar(100) not null,
	"lastName" varchar(100) not null,
	"fullName" varchar(201) GENERATED ALWAYS AS ("firstName" || ' ' || "lastName") STORED,
  "profileImgUrl" varchar(2000),
	"gender" varchar(10) not null check ("gender" in ('male','female')),
	"email" varchar(200),
  "isEmailVerified" boolean not null default false,
	"phone" varchar(20) not null,
  "isPhoneVerified" boolean not null default false,
  "address" text,
	"sharing" integer not null,
	"rent" integer not null default 0,
	"checkInDate" TIMESTAMP not null,
  "checkOutDate" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
	"deposit" integer,
	"roomId" UUID not null,
  "emergencyPhone" varchar(20),
  "info" text,
	"isDeleted" BOOLEAN not null default false,
	"createdBy" UUID,
	"updatedBy" UUID,
	"deletedBy" UUID,
	"createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
	CONSTRAINT "pk_guest" PRIMARY KEY ("id"),
	CONSTRAINT "fk_guest_pgId" FOREIGN KEY ("pgId") REFERENCES "pg" ("id"),
	CONSTRAINT "fk_guest_roomId" FOREIGN KEY ("roomId") REFERENCES "room" ("id"),
	CONSTRAINT "fk_guest_createdBy" FOREIGN KEY ("createdBy") REFERENCES "user" ("id"),
	CONSTRAINT "fk_guest_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id"),
	CONSTRAINT "fk_guest_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES "user" ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "uc_guest_pgId_phone" ON "guest" ("pgId","phone") WHERE "isDeleted" = false;
-- #endregion

-- #region MonthlyPayment
create table if not exists "monthlyPayment"(
	"id" UUID DEFAULT GEN_RANDOM_UUID(),
	"pgId" UUID NOT NULL,
	"guestId" UUID NOT NULL,
	"month" integer not null check ("month" >= 0 and "month" <= 11),
	"year" integer not null check ("year" >= 2021 and "year" <= 3000),
	"rent" integer,
  "lightBill" integer,
	"remark" varchar(1000),
	"isDeleted" BOOLEAN not null default false,
	"createdBy" UUID,
	"updatedBy" UUID,
	"deletedBy" UUID,
	"createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
	CONSTRAINT "pk_monthlyPayment" PRIMARY KEY ("id"),
	CONSTRAINT "fk_monthlyPayment_pgId" FOREIGN KEY ("pgId") REFERENCES "pg" ("id"),
	CONSTRAINT "fk_monthlyPayment_guestId" FOREIGN KEY ("guestId") REFERENCES "guest" ("id"),
	CONSTRAINT "fk_monthlyPayment_createdBy" FOREIGN KEY ("createdBy") REFERENCES "user" ("id"),
	CONSTRAINT "fk_monthlyPayment_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id"),
	CONSTRAINT "fk_monthlyPayment_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES "user" ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "uc_monthlyPayment_guestId_month_year" ON "monthlyPayment" ("guestId","month","year") WHERE "isDeleted" = false;
-- #endregion

-- #region Inquiry
create table if not exists "inquiry"(
	"id" UUID DEFAULT GEN_RANDOM_UUID(),
	"pgId" UUID NOT NULL,
	"name" varchar(100) not null,
	"phone" varchar(20) not null,
	"gender" varchar(10) not null check ("gender" in ('male','female')),
	"sharing" integer,
	"message" varchar(1000),
	"isDeleted" BOOLEAN not null default false,
	"createdBy" UUID,
	"updatedBy" UUID,
	"deletedBy" UUID,
	"createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
	CONSTRAINT "pk_inquiry" PRIMARY KEY ("id"),
	CONSTRAINT "fk_inquiry_pgId" FOREIGN KEY ("pgId") REFERENCES "pg" ("id"),
	CONSTRAINT "fk_inquiry_createdBy" FOREIGN KEY ("createdBy") REFERENCES "user" ("id"),
	CONSTRAINT "fk_inquiry_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id"),
	CONSTRAINT "fk_inquiry_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES "user" ("id")
);
-- #endregion

-- #region Token
create table if not exists "token"(
	"type" varchar(100),
	"token" varchar(2000),
	"userId" UUID,
	"otp" varchar(200),
	"expireAt" timestamp without time zone not null
);
-- #endregion

-- #region RoomLightBillHistory
CREATE TABLE IF NOT EXISTS "roomLightBillHistory"(
	"id" UUID DEFAULT GEN_RANDOM_UUID(),
	"pgId" UUID NOT NULL,
	"roomId" UUID NOT NULL,
	"imgUrl" varchar(2000),
  "amount" numeric(10,2),
	"units" numeric(10,2) NOT NULL,
	"year" INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE) CHECK ("year" >= 2021 AND "year" <= 3000),
	"month" INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE) CHECK ("month" >= 0 AND "month" <= 11),
  "s3BucketName" varchar(50),
  "s3Key" varchar(2000),
	"isDeleted" BOOLEAN not null default false,
	"createdBy" UUID,
	"updatedBy" UUID,
	"deletedBy" UUID,
	"createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL,
	CONSTRAINT "pk_roomLightBillHistory" PRIMARY KEY ("id"),
	CONSTRAINT "fk_roomLightBillHistory_pgId" FOREIGN KEY ("pgId") REFERENCES "pg" ("id"),
	CONSTRAINT "fk_roomLightBillHistory_roomId" FOREIGN KEY ("roomId") REFERENCES "room" ("id"),
	CONSTRAINT "fk_roomLightBillHistory_createdBy" FOREIGN KEY ("createdBy") REFERENCES "user" ("id"),
	CONSTRAINT "fk_roomLightBillHistory_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id"),
	CONSTRAINT "fk_roomLightBillHistory_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES "user" ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "uc_roomLightBill_month_year_guest" ON "roomLightBillHistory" ("roomId", "month", "year") WHERE "isDeleted" = false;
-- #endregion

-- #region Reminder
CREATE TABLE IF NOT EXISTS "reminder"(
  "id" UUID DEFAULT GEN_RANDOM_UUID(),
  "pgId" UUID NOT NULL,
  "guestId" UUID,
  "type" VARCHAR(100) NOT NULL check ("type" in ('monthlyPayment','other')),
	"year" INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE) CHECK ("year" >= 2021 AND "year" <= 3000),
	"month" INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE) CHECK ("month" >= 0 AND "month" <= 11),
  "date" TIMESTAMP WITHOUT TIME ZONE,
  "description" TEXT,
  "isDeleted" BOOLEAN not null default false,
  "createdBy" UUID,
  "updatedBy" UUID,
  "deletedBy" UUID,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL,
  CONSTRAINT "pk_reminder" PRIMARY KEY ("id"),
  CONSTRAINT "fk_reminder_pgId" FOREIGN KEY ("pgId") REFERENCES "pg" ("id"),
  CONSTRAINT "fk_reminder_guestId" FOREIGN KEY ("guestId") REFERENCES "guest" ("id"),
  CONSTRAINT "fk_reminder_createdBy" FOREIGN KEY ("createdBy") REFERENCES "user" ("id"),
  CONSTRAINT "fk_reminder_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id"),
  CONSTRAINT "fk_reminder_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES "user" ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "uc_reminder_guestId_month_year" ON "reminder" ("guestId","month","year") WHERE "isDeleted" = false AND "type" = 'monthlyPayment';
-- #endregion


-- #region Insert Data
insert into "country" ("id","name","code") values ('5fc371f0-1405-477d-a7f7-0bda94241ede','India','91');
insert into "state" ("id","countryId","name") values ('26bce2cf-21a7-4c86-b440-20c3cea53bc9','5fc371f0-1405-477d-a7f7-0bda94241ede','Gujarat');
insert into "city" ("id","stateId","name") values
('b404fd23-fffd-4269-b009-8f9d6af05230','26bce2cf-21a7-4c86-b440-20c3cea53bc9','Ahmedabad'),
('7ca54c55-4677-4cba-bc77-9d2fd5391c07','26bce2cf-21a7-4c86-b440-20c3cea53bc9','Rajkot');
-- #endregion

-- migrate:down

-- #region Drop Tables
drop table if exists "reminder";
drop table if exists "inquiry";
drop table if exists "roomLightBillHistory";
drop table if exists "monthlyPayment";
drop table if exists "token";
drop table if exists "guest";
drop table if exists "room";
drop table if exists "user";
drop table if exists "pg";
drop table if exists "account";
drop table if exists "city";
drop table if exists "state";
drop table if exists "country";
-- #endregion
