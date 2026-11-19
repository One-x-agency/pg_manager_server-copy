-- migrate:up


ALTER TABLE "expenses" RENAME TO "expense";

-- migrate:down


ALTER TABLE "expense" RENAME TO "expenses";

