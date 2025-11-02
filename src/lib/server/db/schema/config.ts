import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  uuid,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

import { UserTable } from "./user";

/**
 * @name ResponseTable
 * @description table for conversations
 */
export const UserConfigTable = pgTable("user_config", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => UserTable.uid),
  avatar: varchar("avatar"),
  theme: varchar("theme", { length: 16 }),
  locale: varchar("default_local_name", { length: 8 })
    .notNull()
    .default("en-US"),
  localeName: varchar("local_name", { length: 8 }).notNull().default("en"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

/**
 * @name ResponseTable
 * @description table for conversations
 */
export const ConfigTable = pgTable("config", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 32 }).notNull().default("default"),
  siteName: varchar("site_name", { length: 64 }).notNull(),
  siteDescription: text("site_description").notNull(),
  publicSite: boolean("public_site").default(false),
  defaultRole: integer("default_role").default(2),
  defaultTheme: varchar("default_theme", { length: 16 })
    .default("light")
    .notNull(),
  defaultLocaleName: varchar("default_local_name", { length: 8 })
    .default("en")
    .notNull(),
  apiBaseUrl: varchar("api_base_url", { length: 64 })
    .notNull()
    .default("api/v1"),
  applicationURL: varchar("application_url", { length: 128 })
    .notNull()
    .default("http://127.0.0.1:5173"),
  applicationApi: varchar("application_api", { length: 128 })
    .notNull()
    .default("http://127.0.0.1:1612/api/v2"),
  logos: jsonb("logos").default({}),
  location: text("location"),
  twoFactorAuth: boolean("two_factor_auth").default(true),
  coordinates: jsonb("coordinates").default({}),
  googleMapsKey: varchar("google_maps_key", { length: 128 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
