import { UserRoles } from "$lib/types";
import { generateUniqueId } from "$lib/utils";
import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const ApplicationSubmissionTable = pgTable("application_submission", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  application: uuid("application").notNull(),
  user: uuid("user"),
  values: jsonb("values").notNull().default({}),
  draft: boolean("draft").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const ApplicationTokenTable = pgTable("application_token", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  token: varchar("token", { length: 255 })
    .notNull()
    .unique()
    .$defaultFn(() => generateUniqueId()),
  application: uuid("application").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const FormTable = pgTable("system_form", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  form: jsonb("form").notNull().default([]),
  active: boolean("active").notNull().default(true),
  role: integer("role").notNull().default(UserRoles.USER), // Assuming UserRoles is a boolean for simplicity
  created_at: timestamp("created_at").notNull().defaultNow(),
  //
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const FormApplicationTable = pgTable("form_application", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  forms: jsonb("forms").notNull().default([]),
  active: boolean("active").notNull().default(true),
  role: integer("role").notNull().default(UserRoles.USER), // Assuming UserRoles is a boolean for simplicity
  progress: boolean("progress").notNull().default(true),
  autoSave: boolean("auto_save").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
