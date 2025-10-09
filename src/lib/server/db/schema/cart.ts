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
import { PaymentType } from "$lib/types";
import { generateUniqueId } from "$lib/utils/tools";

/**
 * @name CartInvoiceTable
 * @description table for cart invoices
 */
export const CartInvoiceTable = pgTable("cart_invoice", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  invoice: varchar("invoice_id")
    .notNull()
    .unique()
    .$defaultFn(() => generateUniqueId(8)),
  user: uuid("user_id")
    .notNull()
    .references(() => UserTable.uid),
  paid: boolean("paid").notNull().default(false),
  meta: jsonb("meta").default({}),
  items: jsonb("items").default([]),
  total: integer("total").notNull().default(0),
  paidTotal: integer("paid_total").notNull().default(0),
  scholarships: jsonb("scholarships").notNull().default([]),
  expired: boolean("expired").notNull().default(false),
  paymentType: varchar("payment_type", { length: 25 })
    .notNull()
    .default(PaymentType.INVOICE),

  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
