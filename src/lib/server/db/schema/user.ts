import { UserRoles } from "$lib/types";

import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { ApplicationSubmissionTable } from "./form";

export const RegistrationTable = pgTable("registration", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  name: varchar("name").notNull(), //
  email: varchar("email", { length: 150 }).notNull(),
  verified: boolean("verified").notNull().default(false),
  active: boolean("active").notNull().default(true),
  emailSent: timestamp("email_sent").notNull().defaultNow(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const UserTable = pgTable("user", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  name: varchar("name").notNull(), //
  email: varchar("email", { length: 150 }).unique().notNull(),
  phone: varchar("phone", { length: 25 }),
  username: text("username").notNull(),
  password: text("password").notNull(),
  resetPassword: boolean("reset_password").notNull().default(true),
  active: boolean("active").notNull().default(true),
  role: integer("role").notNull().default(UserRoles.USER),
  avatar: varchar("avatar", { length: 150 }),
  bio: text("bio"),
  optOut: boolean("opt_out").notNull().default(false),
  registered: boolean("registered").notNull().default(false),
  application: uuid("application").references(
    () => ApplicationSubmissionTable.uid,
  ),
  applicationComplete: boolean("application_complete").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
