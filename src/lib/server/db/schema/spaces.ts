import { generateUserApiKey } from "$lib/server/utils/security";
import { UserRoles } from "$lib/types";
import {
  pgTable,
  integer,
  timestamp,
  boolean,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { UserTable } from "./user";

export const SpaceTagsTable = pgTable("space_tags", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  tag: varchar("tag").notNull(),
});

export const SpaceTagsReferenceTable = pgTable("space_tags_reference", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  space: uuid("space")
    .notNull()
    .references(() => SpacesTable.uid),
  tag: uuid("tag")
    .references(() => SpaceTagsTable.uid)
    .notNull(),
});

export const SpacesMembers = pgTable("space_member", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  space: uuid("space")
    .notNull()
    .references(() => SpaceTagsTable.uid),
  user: uuid("user")
    .notNull()
    .references(() => UserTable.uid),
  role: integer("role").notNull().default(UserRoles.GUEST),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const SpacesTable = pgTable("space", {
  uid: uuid("uid").notNull().defaultRandom().primaryKey(),
  name: varchar("name").notNull().unique(), //
  description: varchar("description").notNull().unique(),
  image: varchar("image").notNull().default(""),
  teaser: text("teaser").notNull(),
  active: boolean("active").notNull().default(false),
  grandFatheredOn: timestamp("grand_fathered"),
  price: integer("price").notNull().default(0),
  weight: integer("weight").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  btnText: varchar("btn_text").notNull().default(""),
  gatewayPlanId: varchar("gateway_plan_id", { length: 255 })
    .notNull()
    .unique()
    .$defaultFn(() => generateUserApiKey()),
  gatewayPriceId: varchar("gateway_price_id", { length: 255 })
    .notNull()
    .default(""),
  created_at: timestamp("created_at").notNull().defaultNow(),
  role: integer("role").notNull().default(UserRoles.UNRESTRICTED),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
