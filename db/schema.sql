SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100),
    email character varying(100) NOT NULL,
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    phone character varying(20) NOT NULL,
    "isPhoneVerified" boolean DEFAULT false NOT NULL,
    password character varying(500),
    "isVerified" boolean DEFAULT false NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone,
    "accountNumber" integer NOT NULL
);


--
-- Name: account_accountNumber_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."account_accountNumber_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: account_accountNumber_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."account_accountNumber_seq" OWNED BY public.account."accountNumber";


--
-- Name: booking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "pgId" uuid NOT NULL,
    name character varying(200) NOT NULL,
    gender character varying(10) NOT NULL,
    email character varying(200),
    phone character varying(20) NOT NULL,
    sharing integer NOT NULL,
    rent integer DEFAULT 0 NOT NULL,
    "checkInDate" timestamp without time zone NOT NULL,
    "checkOutDate" timestamp without time zone,
    "tokenAmount" integer,
    "roomId" uuid,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdBy" uuid,
    "updatedBy" uuid,
    "deletedBy" uuid,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone,
    CONSTRAINT booking_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying])::text[])))
);


--
-- Name: expense; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "pgId" uuid NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    category character varying(255),
    "paymentMethod" character varying(50),
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    sender character varying(255),
    receiver character varying(255),
    "isDeleted" boolean DEFAULT false,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone,
    "createdBy" uuid,
    "updatedBy" uuid,
    "deletedBy" uuid
);


--
-- Name: guest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "pgId" uuid NOT NULL,
    name character varying(200) NOT NULL,
    "profileImage" character varying(2000),
    gender character varying(10) NOT NULL,
    email character varying(200),
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    phone character varying(20) NOT NULL,
    "isPhoneVerified" boolean DEFAULT false NOT NULL,
    address text,
    sharing integer NOT NULL,
    rent integer DEFAULT 0 NOT NULL,
    "checkInReading" numeric(10,2),
    "checkOutReading" numeric(10,2),
    "checkInDate" date NOT NULL,
    "dateOfNotice" date,
    "checkOutDate" date,
    deposit integer,
    "roomId" uuid NOT NULL,
    "emergencyPhone" character varying(20),
    info text,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdBy" uuid,
    "updatedBy" uuid,
    "deletedBy" uuid,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone,
    CONSTRAINT guest_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying])::text[])))
);


--
-- Name: guestDocument; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."guestDocument" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "pgId" uuid NOT NULL,
    "guestId" uuid NOT NULL,
    name character varying(200),
    image character varying(2000)
);


--
-- Name: inquiry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "pgId" uuid NOT NULL,
    name character varying(100) NOT NULL,
    status character varying(10) DEFAULT 'pending'::character varying,
    phone character varying(20) NOT NULL,
    gender character varying(10) NOT NULL,
    sharing integer,
    message character varying(1000),
    token integer,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdBy" uuid,
    "updatedBy" uuid,
    "deletedBy" uuid,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone,
    CONSTRAINT inquiry_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying])::text[])))
);


--
-- Name: monthlyPayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."monthlyPayment" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "pgId" uuid NOT NULL,
    "guestId" uuid NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    date date NOT NULL,
    "rentPaymentMethod" character varying(100) DEFAULT 'cash'::character varying,
    "lightBillPaymentMethod" character varying(30) DEFAULT 'cash'::character varying,
    rent integer,
    "lightBill" integer,
    remark character varying(1000),
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdBy" uuid,
    "updatedBy" uuid,
    "deletedBy" uuid,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone,
    CONSTRAINT "monthlyPayment_month_check" CHECK (((month >= 0) AND (month <= 11))),
    CONSTRAINT "monthlyPayment_year_check" CHECK (((year >= 2021) AND (year <= 3000)))
);


--
-- Name: pg; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pg (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "accountId" uuid NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(20) DEFAULT 'both'::character varying NOT NULL,
    phone character varying(20),
    phone2 character varying(20),
    email character varying(100),
    address character varying(1000),
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone,
    CONSTRAINT pg_type_check CHECK (((type)::text = ANY ((ARRAY['boys'::character varying, 'girls'::character varying, 'both'::character varying])::text[])))
);


--
-- Name: reminder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reminder (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "pgId" uuid NOT NULL,
    type character varying(100) NOT NULL,
    reference character varying(200),
    date timestamp without time zone,
    description text,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdBy" uuid,
    "updatedBy" uuid,
    "deletedBy" uuid,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone,
    CONSTRAINT reminder_type_check CHECK (((type)::text = ANY ((ARRAY['monthlyPayment'::character varying, 'other'::character varying])::text[])))
);


--
-- Name: room; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "pgId" uuid NOT NULL,
    name character varying(100) NOT NULL,
    capacity integer NOT NULL,
    rent integer NOT NULL,
    tags text[],
    info text,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdBy" uuid,
    "updatedBy" uuid,
    "deletedBy" uuid,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone
);


--
-- Name: roomLightBillHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."roomLightBillHistory" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "pgId" uuid NOT NULL,
    "roomId" uuid NOT NULL,
    image character varying(2000),
    amount numeric(10,2),
    "unitPrice" numeric(10,2) DEFAULT 10 NOT NULL,
    reading numeric(10,2) NOT NULL,
    year integer DEFAULT EXTRACT(year FROM CURRENT_DATE) NOT NULL,
    month integer DEFAULT EXTRACT(month FROM CURRENT_DATE) NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdBy" uuid,
    "updatedBy" uuid,
    "deletedBy" uuid,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone,
    CONSTRAINT "roomLightBillHistory_month_check" CHECK (((month >= 0) AND (month <= 11))),
    CONSTRAINT "roomLightBillHistory_year_check" CHECK (((year >= 2021) AND (year <= 3000)))
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    "pgId" uuid NOT NULL,
    gender character varying(10) DEFAULT 'male'::character varying NOT NULL,
    phone character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    info character varying(2000),
    "createdBy" uuid,
    "updatedBy" uuid,
    "deletedBy" uuid,
    "isDeleted" boolean DEFAULT false,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone,
    CONSTRAINT staff_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying])::text[])))
);


--
-- Name: staffDocument; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."staffDocument" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "pgId" uuid NOT NULL,
    "staffId" uuid NOT NULL,
    name character varying(200),
    image character varying(2000)
);


--
-- Name: token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token (
    type character varying(100),
    token character varying(2000),
    "userId" uuid,
    otp character varying(200),
    "expireAt" timestamp without time zone NOT NULL
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "accountId" uuid NOT NULL,
    "isRootUser" boolean DEFAULT false NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(500),
    phone character varying(20),
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone
);


--
-- Name: userPgAccess; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."userPgAccess" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "pgId" uuid,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" uuid,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedBy" uuid
);


--
-- Name: account accountNumber; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account ALTER COLUMN "accountNumber" SET DEFAULT nextval('public."account_accountNumber_seq"'::regclass);


--
-- Name: account account_accountNumber_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_accountNumber_key" UNIQUE ("accountNumber");


--
-- Name: account pk_account; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT pk_account PRIMARY KEY (id);


--
-- Name: booking pk_booking; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT pk_booking PRIMARY KEY (id);


--
-- Name: expense pk_expenses; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense
    ADD CONSTRAINT pk_expenses PRIMARY KEY (id);


--
-- Name: guest pk_guest; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest
    ADD CONSTRAINT pk_guest PRIMARY KEY (id);


--
-- Name: guestDocument pk_guestDocument; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."guestDocument"
    ADD CONSTRAINT "pk_guestDocument" PRIMARY KEY (id);


--
-- Name: inquiry pk_inquiry; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry
    ADD CONSTRAINT pk_inquiry PRIMARY KEY (id);


--
-- Name: monthlyPayment pk_monthlyPayment; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."monthlyPayment"
    ADD CONSTRAINT "pk_monthlyPayment" PRIMARY KEY (id);


--
-- Name: pg pk_pg; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pg
    ADD CONSTRAINT pk_pg PRIMARY KEY (id);


--
-- Name: reminder pk_reminder; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder
    ADD CONSTRAINT pk_reminder PRIMARY KEY (id);


--
-- Name: room pk_room; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT pk_room PRIMARY KEY (id);


--
-- Name: roomLightBillHistory pk_roomLightBillHistory; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."roomLightBillHistory"
    ADD CONSTRAINT "pk_roomLightBillHistory" PRIMARY KEY (id);


--
-- Name: staff pk_staff; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT pk_staff PRIMARY KEY (id);


--
-- Name: staffDocument pk_staffDocument; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."staffDocument"
    ADD CONSTRAINT "pk_staffDocument" PRIMARY KEY (id);


--
-- Name: user pk_user; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT pk_user PRIMARY KEY (id);


--
-- Name: userPgAccess pk_userPgAccess; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userPgAccess"
    ADD CONSTRAINT "pk_userPgAccess" PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: userPgAccess uc_userPgAccess_userId_pgId; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userPgAccess"
    ADD CONSTRAINT "uc_userPgAccess_userId_pgId" UNIQUE ("userId", "pgId");


--
-- Name: uc_account_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uc_account_email ON public.account USING btree (email) WHERE ("isDeleted" = false);


--
-- Name: uc_account_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uc_account_phone ON public.account USING btree (phone) WHERE ("isDeleted" = false);


--
-- Name: uc_booking_pgId_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "uc_booking_pgId_phone" ON public.booking USING btree ("pgId", phone) WHERE ("isDeleted" = false);


--
-- Name: uc_guest_pgId_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "uc_guest_pgId_phone" ON public.guest USING btree ("pgId", phone) WHERE ("isDeleted" = false);


--
-- Name: uc_monthlyPayment_guestId_month_year; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "uc_monthlyPayment_guestId_month_year" ON public."monthlyPayment" USING btree ("guestId", month, year) WHERE ("isDeleted" = false);


--
-- Name: uc_pg_accountId_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "uc_pg_accountId_name" ON public.pg USING btree ("accountId", name) WHERE ("isDeleted" = false);


--
-- Name: uc_reminder_pgId_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "uc_reminder_pgId_reference" ON public.reminder USING btree ("pgId", reference) WHERE (("isDeleted" = false) AND ((type)::text = 'monthlyPayment'::text));


--
-- Name: uc_roomLightBill_month_year_guest; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "uc_roomLightBill_month_year_guest" ON public."roomLightBillHistory" USING btree ("roomId", month, year) WHERE ("isDeleted" = false);


--
-- Name: uc_room_pgId_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "uc_room_pgId_name" ON public.room USING btree ("pgId", name) WHERE ("isDeleted" = false);


--
-- Name: uc_staff_pgId_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "uc_staff_pgId_phone" ON public.staff USING btree ("pgId", phone) WHERE ("isDeleted" = false);


--
-- Name: uc_user_accountId_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "uc_user_accountId_phone" ON public."user" USING btree ("accountId", phone) WHERE ("isDeleted" = false);


--
-- Name: uc_user_accountId_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "uc_user_accountId_username" ON public."user" USING btree ("accountId", username) WHERE ("isDeleted" = false);


--
-- Name: booking fk_booking_createdBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT "fk_booking_createdBy" FOREIGN KEY ("createdBy") REFERENCES public."user"(id);


--
-- Name: booking fk_booking_deletedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT "fk_booking_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id);


--
-- Name: booking fk_booking_pgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT "fk_booking_pgId" FOREIGN KEY ("pgId") REFERENCES public.pg(id);


--
-- Name: booking fk_booking_roomId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT "fk_booking_roomId" FOREIGN KEY ("roomId") REFERENCES public.room(id);


--
-- Name: booking fk_booking_updatedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT "fk_booking_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES public."user"(id);


--
-- Name: expense fk_expenses_createdBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense
    ADD CONSTRAINT "fk_expenses_createdBy" FOREIGN KEY ("createdBy") REFERENCES public."user"(id);


--
-- Name: expense fk_expenses_deletedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense
    ADD CONSTRAINT "fk_expenses_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id);


--
-- Name: expense fk_expenses_pgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense
    ADD CONSTRAINT "fk_expenses_pgId" FOREIGN KEY ("pgId") REFERENCES public.pg(id);


--
-- Name: expense fk_expenses_updatedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense
    ADD CONSTRAINT "fk_expenses_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES public."user"(id);


--
-- Name: guestDocument fk_guestDocument_guestId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."guestDocument"
    ADD CONSTRAINT "fk_guestDocument_guestId" FOREIGN KEY ("guestId") REFERENCES public.guest(id);


--
-- Name: guestDocument fk_guestDocument_pgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."guestDocument"
    ADD CONSTRAINT "fk_guestDocument_pgId" FOREIGN KEY ("pgId") REFERENCES public.pg(id);


--
-- Name: guest fk_guest_createdBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest
    ADD CONSTRAINT "fk_guest_createdBy" FOREIGN KEY ("createdBy") REFERENCES public."user"(id);


--
-- Name: guest fk_guest_deletedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest
    ADD CONSTRAINT "fk_guest_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id);


--
-- Name: guest fk_guest_pgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest
    ADD CONSTRAINT "fk_guest_pgId" FOREIGN KEY ("pgId") REFERENCES public.pg(id);


--
-- Name: guest fk_guest_roomId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest
    ADD CONSTRAINT "fk_guest_roomId" FOREIGN KEY ("roomId") REFERENCES public.room(id);


--
-- Name: guest fk_guest_updatedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest
    ADD CONSTRAINT "fk_guest_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES public."user"(id);


--
-- Name: inquiry fk_inquiry_createdBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry
    ADD CONSTRAINT "fk_inquiry_createdBy" FOREIGN KEY ("createdBy") REFERENCES public."user"(id);


--
-- Name: inquiry fk_inquiry_deletedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry
    ADD CONSTRAINT "fk_inquiry_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id);


--
-- Name: inquiry fk_inquiry_pgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry
    ADD CONSTRAINT "fk_inquiry_pgId" FOREIGN KEY ("pgId") REFERENCES public.pg(id);


--
-- Name: inquiry fk_inquiry_updatedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry
    ADD CONSTRAINT "fk_inquiry_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES public."user"(id);


--
-- Name: monthlyPayment fk_monthlyPayment_createdBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."monthlyPayment"
    ADD CONSTRAINT "fk_monthlyPayment_createdBy" FOREIGN KEY ("createdBy") REFERENCES public."user"(id);


--
-- Name: monthlyPayment fk_monthlyPayment_deletedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."monthlyPayment"
    ADD CONSTRAINT "fk_monthlyPayment_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id);


--
-- Name: monthlyPayment fk_monthlyPayment_guestId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."monthlyPayment"
    ADD CONSTRAINT "fk_monthlyPayment_guestId" FOREIGN KEY ("guestId") REFERENCES public.guest(id);


--
-- Name: monthlyPayment fk_monthlyPayment_pgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."monthlyPayment"
    ADD CONSTRAINT "fk_monthlyPayment_pgId" FOREIGN KEY ("pgId") REFERENCES public.pg(id);


--
-- Name: monthlyPayment fk_monthlyPayment_updatedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."monthlyPayment"
    ADD CONSTRAINT "fk_monthlyPayment_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES public."user"(id);


--
-- Name: pg fk_pg_accountId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pg
    ADD CONSTRAINT "fk_pg_accountId" FOREIGN KEY ("accountId") REFERENCES public.account(id);


--
-- Name: reminder fk_reminder_createdBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder
    ADD CONSTRAINT "fk_reminder_createdBy" FOREIGN KEY ("createdBy") REFERENCES public."user"(id);


--
-- Name: reminder fk_reminder_deletedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder
    ADD CONSTRAINT "fk_reminder_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id);


--
-- Name: reminder fk_reminder_pgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder
    ADD CONSTRAINT "fk_reminder_pgId" FOREIGN KEY ("pgId") REFERENCES public.pg(id);


--
-- Name: reminder fk_reminder_updatedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder
    ADD CONSTRAINT "fk_reminder_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES public."user"(id);


--
-- Name: roomLightBillHistory fk_roomLightBillHistory_createdBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."roomLightBillHistory"
    ADD CONSTRAINT "fk_roomLightBillHistory_createdBy" FOREIGN KEY ("createdBy") REFERENCES public."user"(id);


--
-- Name: roomLightBillHistory fk_roomLightBillHistory_deletedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."roomLightBillHistory"
    ADD CONSTRAINT "fk_roomLightBillHistory_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id);


--
-- Name: roomLightBillHistory fk_roomLightBillHistory_pgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."roomLightBillHistory"
    ADD CONSTRAINT "fk_roomLightBillHistory_pgId" FOREIGN KEY ("pgId") REFERENCES public.pg(id);


--
-- Name: roomLightBillHistory fk_roomLightBillHistory_roomId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."roomLightBillHistory"
    ADD CONSTRAINT "fk_roomLightBillHistory_roomId" FOREIGN KEY ("roomId") REFERENCES public.room(id);


--
-- Name: roomLightBillHistory fk_roomLightBillHistory_updatedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."roomLightBillHistory"
    ADD CONSTRAINT "fk_roomLightBillHistory_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES public."user"(id);


--
-- Name: room fk_room_createdBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT "fk_room_createdBy" FOREIGN KEY ("createdBy") REFERENCES public."user"(id);


--
-- Name: room fk_room_deletedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT "fk_room_deletedBy" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id);


--
-- Name: room fk_room_pgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT "fk_room_pgId" FOREIGN KEY ("pgId") REFERENCES public.pg(id);


--
-- Name: room fk_room_updatedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT "fk_room_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES public."user"(id);


--
-- Name: staffDocument fk_staffDocument_pgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."staffDocument"
    ADD CONSTRAINT "fk_staffDocument_pgId" FOREIGN KEY ("pgId") REFERENCES public.pg(id);


--
-- Name: staffDocument fk_staffDocument_staffId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."staffDocument"
    ADD CONSTRAINT "fk_staffDocument_staffId" FOREIGN KEY ("staffId") REFERENCES public.staff(id);


--
-- Name: staff fk_staff_pgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "fk_staff_pgId" FOREIGN KEY ("pgId") REFERENCES public.pg(id);


--
-- Name: userPgAccess fk_userPgAccess_createdBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userPgAccess"
    ADD CONSTRAINT "fk_userPgAccess_createdBy" FOREIGN KEY ("createdBy") REFERENCES public."user"(id);


--
-- Name: userPgAccess fk_userPgAccess_pgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userPgAccess"
    ADD CONSTRAINT "fk_userPgAccess_pgId" FOREIGN KEY ("pgId") REFERENCES public.pg(id);


--
-- Name: userPgAccess fk_userPgAccess_updatedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userPgAccess"
    ADD CONSTRAINT "fk_userPgAccess_updatedBy" FOREIGN KEY ("updatedBy") REFERENCES public."user"(id);


--
-- Name: userPgAccess fk_userPgAccess_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userPgAccess"
    ADD CONSTRAINT "fk_userPgAccess_userId" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: user fk_user_accountId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "fk_user_accountId" FOREIGN KEY ("accountId") REFERENCES public.account(id);


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20240511164941'),
    ('20240603170353'),
    ('20241015062835'),
    ('20241114110944'),
    ('20241114114630'),
    ('20241119053933'),
    ('20250215040753'),
    ('20250220025942');
