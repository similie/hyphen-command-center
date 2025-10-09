import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

import { UserTable } from "./user";
import { otpValueGen } from "$lib/utils/security";
import { generateUniqueId } from "$lib/utils/tools";
import { VerificationContext } from "$lib/types";

/**
 * @name VerificationTokenTable
 * @description table for conversations
 */
export const VerificationTokenTable = pgTable("verification_token", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  token: varchar("token")
    .notNull()
    .unique()
    .$defaultFn(() => generateUniqueId()),
  userId: uuid("user_id")
    .notNull()
    .references(() => UserTable.uid),
  valid: boolean("valid").default(true).notNull(),
  context: varchar("context", { length: 48 }).default(
    VerificationContext.AUTHENTICATION,
  ),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

/**
 * @name OtpTable
 * @description table for conversations
 */
export const OtpTable = pgTable("otp", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => UserTable.uid),
  otp: varchar("otp")
    .notNull()
    .$defaultFn(() => otpValueGen()),
  active: boolean("active").default(true).notNull(),
  identifier: varchar("identifier", { length: 255 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
