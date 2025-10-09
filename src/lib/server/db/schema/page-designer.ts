import {
  pgTable,
  integer,
  timestamp,
  uuid,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";

export const PageDesignModel = pgTable("page_design", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  tag: varchar("tag").notNull().unique(),
  content: jsonb("content").notNull().default([]),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
