import { generateUniqueId } from "$lib/utils";
import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const ProductsTable = pgTable("products", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  image: uuid("image"),
  meta: jsonb("meta").notNull().default({}),
  price: integer("price").notNull().default(0),
  category: varchar("category", { length: 255 }).notNull().default("general"),
  sku: varchar("sku")
    .notNull()
    .unique()
    .$defaultFn(() => generateUniqueId(8)),
  service: boolean("service").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
