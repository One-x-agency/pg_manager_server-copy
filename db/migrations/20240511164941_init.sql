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
  "meta" jsonb not null default '{}',
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
  "meta" jsonb not null default '{}',
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
  "accountId" UUID not null,
	"isRootUser" boolean not null default false,
	"username" varchar(100) not null,
	"password" varchar(500) null,
	"phone" varchar(20) null,
	"isDeleted" BOOLEAN not null default false,
	"createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
	CONSTRAINT "pk_user" PRIMARY KEY ("id"),
  CONSTRAINT "fk_user_accountId" FOREIGN KEY ("accountId") REFERENCES "account" ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "uc_user_accountId_username" ON "user" ("accountId","username") WHERE "isDeleted" = false;
CREATE UNIQUE INDEX IF NOT EXISTS "uc_user_accountId_phone" ON "user" ("accountId","phone") WHERE "isDeleted" = false;

-- #endregion

-- #region UserPgAccess
create table if not exists "userPgAccess"(
  "id" UUID DEFAULT GEN_RANDOM_UUID(),
  "userId" UUID not null,
  "pgId" UUID,
  "meta" jsonb not null default '{}',
  "createdAt" TIMESTAMP WITHOUT TIME ZONE not null default current_timestamp,
  "createdBy" UUID,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE not null default current_timestamp,
  "updatedBy" UUID,
  constraint "pk_userPgAccess" primary key ("id"),
  constraint "fk_userPgAccess_userId" foreign key ("userId") references "user" ("id"),
  constraint "fk_userPgAccess_pgId" foreign key ("pgId") references "pg" ("id"),
  constraint "fk_userPgAccess_createdBy" foreign key ("createdBy") references "user" ("id"),
  constraint "fk_userPgAccess_updatedBy" foreign key ("updatedBy") references "user" ("id"),
  constraint "uc_userPgAccess_userId_pgId" unique ("userId", "pgId")
);
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
	CONSTRAINT "fk_room_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES "user" ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "uc_room_pgId_name" ON "room" ("pgId","name") WHERE "isDeleted" = false;
-- #endregion

-- #region Guest
create table if not exists "guest"(
	"id" UUID DEFAULT GEN_RANDOM_UUID(),
	"pgId" UUID NOT NULL,
  "name" varchar(200) not null,
  "profileImage" varchar(2000),
	"gender" varchar(10) not null check ("gender" in ('male','female')),
	"email" varchar(200),
  "isEmailVerified" boolean not null default false,
	"phone" varchar(20) not null,
  "isPhoneVerified" boolean not null default false,
  "address" text,
	"sharing" integer not null,
	"rent" integer not null default 0,
  "checkInReading" numeric(10,2),
  "checkOutReading" numeric(10,2),
	"checkInDate" TIMESTAMP WITHOUT TIME ZONE not null,
  "dateOfNotice" TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL,
  "checkOutDate" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
	"deposit" integer,
	"roomId" UUID not null,
  "emergencyPhone" varchar(20),
  "info" text,
	"isDeleted" BOOLEAN not null default false,
	"createdBy" UUID,
	"updatedBy" UUID,
	"deletedBy" UUID,
  "meta" jsonb not null default '{}',
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
  "date" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  "rentPaymentMethod" varchar(100) default 'cash',
  "lightBillPaymentMethod" VARCHAR(30) default 'cash',
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
  "status" varchar(10) DEFAULT 'pending',
	"phone" varchar(20) not null,
	"gender" varchar(10) not null check ("gender" in ('male','female')),
	"sharing" integer,
	"message" varchar(1000),
  "token" integer,
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
	"image" varchar(2000),
  "amount" numeric(10,2),
  "unitPrice" numeric(10,2) NOT NULL DEFAULT 10,
	"reading" numeric(10,2) NOT NULL,
	"year" INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE) CHECK ("year" >= 2021 AND "year" <= 3000),
	"month" INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE) CHECK ("month" >= 0 AND "month" <= 11),
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
  "type" VARCHAR(100) NOT NULL check ("type" in ('monthlyPayment','other')),
  "reference" VARCHAR(200),
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
  CONSTRAINT "fk_reminder_createdBy" FOREIGN KEY ("createdBy") REFERENCES "user" ("id"),
  CONSTRAINT "fk_reminder_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id"),
  CONSTRAINT "fk_reminder_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES "user" ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "uc_reminder_pgId_reference" ON "reminder" ("pgId","reference") WHERE "isDeleted" = false AND "type" = 'monthlyPayment';
-- #endregion

-- #region GuestDocument
create table if not exists "guestDocument"(
	"id" UUID DEFAULT GEN_RANDOM_UUID(),
  "pgId" UUID not null,
  "guestId" UUID not null,
  "name" varchar(200),
  "image" varchar(2000),
  constraint "pk_guestDocument" primary key ("id"),
  constraint "fk_guestDocument_pgId" foreign key ("pgId") references "pg" ("id"),
  constraint "fk_guestDocument_guestId" foreign key ("guestId") references "guest" ("id")
);
-- #endregion

-- #region Staff
CREATE TABLE IF not exists "staff" (
    "id" UUID DEFAULT GEN_RANDOM_UUID(),
    "name" VARCHAR(255) NOT NULL,
    "pgId" UUID NOT NULL,
    "gender" VARCHAR(10) NOT NULL CHECK ("gender" IN ('male', 'female')) default 'male',
    "phone" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "info" varchar(2000),
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedBy" UUID,
    "isDeleted" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
    CONSTRAINT "pk_staff" PRIMARY KEY ("id"),
    CONSTRAINT "fk_staff_pgId" FOREIGN KEY ("pgId") REFERENCES "pg" ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "uc_staff_pgId_phone" ON "staff" ("pgId","phone") where "isDeleted"=false;
-- #endregion

-- #region StaffDocument
create table if not exists "staffDocument"(
	"id" UUID DEFAULT GEN_RANDOM_UUID(),
  "pgId" UUID not null,
  "staffId" UUID not null,
  "name" varchar(200),
  "image" varchar(2000),
  constraint "pk_staffDocument" primary key ("id"),
  constraint "fk_staffDocument_pgId" foreign key ("pgId") references "pg" ("id"),
  constraint "fk_staffDocument_staffId" foreign key ("staffId") references "staff" ("id")
);
-- #endregion

-- #region Expenses
CREATE TABLE IF NOT EXISTS "expenses" (
    "id" UUID DEFAULT GEN_RANDOM_UUID(),
    "pgId" UUID NOT NULL,
    "description" TEXT,
    "amount" NUMERIC(10, 2) NOT NULL,
    "category" VARCHAR(255),
    "paymentMethod" VARCHAR(50),
    "date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sender" varchar(255),
    "receiver" varchar(255),
    "isDeleted" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedBy" UUID,
    CONSTRAINT "pk_expenses" PRIMARY KEY ("id"),
    CONSTRAINT "fk_expenses_pgId" FOREIGN KEY ("pgId") REFERENCES "pg" ("id"),
    CONSTRAINT "fk_expenses_createdBy" FOREIGN KEY ("createdBy") REFERENCES "user" ("id"),
    CONSTRAINT "fk_expenses_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id"),
    CONSTRAINT "fk_expenses_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES "user" ("id")
);
-- #endregion

-- #region Booking
create table if not exists "booking"(
	"id" UUID DEFAULT GEN_RANDOM_UUID(),
	"pgId" UUID NOT NULL,
  "name" varchar(200) not null,
	"gender" varchar(10) not null check ("gender" in ('male','female')),
	"email" varchar(200),
	"phone" varchar(20) not null,
	"sharing" integer not null,
	"rent" integer not null default 0,
	"checkInDate" TIMESTAMP WITHOUT TIME ZONE not null,
  "checkOutDate" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
	"tokenAmount" integer,
	"roomId" UUID ,
	"isDeleted" BOOLEAN not null default false,
	"createdBy" UUID,
	"updatedBy" UUID,
	"deletedBy" UUID,
	"createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"deletedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT null,
	CONSTRAINT "pk_booking" PRIMARY KEY ("id"),
	CONSTRAINT "fk_booking_pgId" FOREIGN KEY ("pgId") REFERENCES "pg" ("id"),
	CONSTRAINT "fk_booking_roomId" FOREIGN KEY ("roomId") REFERENCES "room" ("id"),
	CONSTRAINT "fk_booking_createdBy" FOREIGN KEY ("createdBy") REFERENCES "user" ("id"),
	CONSTRAINT "fk_booking_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id"),
	CONSTRAINT "fk_booking_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES "user" ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "uc_booking_pgId_phone" ON "booking" ("pgId","phone") WHERE "isDeleted" = false;
-- #endregion

-- migrate:down

-- #region Drop Tables
drop table if exists "booking";
drop table if exists "expenses";
drop table if exists "staffDocument";
drop table if exists "staff";
drop table if exists "guestDocument";
drop table if exists "reminder";
drop table if exists "inquiry";
drop table if exists "roomLightBillHistory";
drop table if exists "monthlyPayment";
drop table if exists "token";
drop table if exists "guest";
drop table if exists "room";
drop table if exists "userPgAccess";
drop table if exists "pg";
drop table if exists "user";
drop table if exists "account";
drop table if exists "city";
drop table if exists "state";
drop table if exists "country";
-- #endregion
