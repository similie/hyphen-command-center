import {
  pgTable,
  integer,
  timestamp,
  boolean,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { ConfigTable } from "./config";
export const LicenseAgreementTable = pgTable("license_agreements", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  config: integer("config_id")
    .notNull()
    .references(() => ConfigTable.id),
  description: text("description"),
  content: text("content").notNull(),
  active: boolean("active").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
