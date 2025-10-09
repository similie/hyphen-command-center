import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  json,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * @name EmailTable
 * @description table for emails send
 */
export const EmailTable = pgTable("email", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  email: varchar("email", { length: 128 }).notNull(),
  content: text("content").default("").notNull(),
  templateProps: json("template_props").default({}),
  sent: boolean("sent").default(false).notNull(),
  error: text("error"),
  attachments: json("props").default({}),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
