import {
  pgTable,
  integer,
  timestamp,
  boolean,
  uuid,
  varchar,
  text,
  json,
} from "drizzle-orm/pg-core";
import { ConfigTable } from "./config";
import { UserRoles } from "$lib/types";
export const SiteRoutingTable = pgTable("site_routing", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  pageName: varchar("page_name").notNull(), //
  path: varchar("path", { length: 150 }).notNull(),
  public: boolean("public").notNull().default(false),
  config: integer("config_id")
    .notNull()
    .references(() => ConfigTable.id),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  role: integer("role").notNull().default(UserRoles.USER),
  params: json("params").default({}),
  method: varchar("method"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
