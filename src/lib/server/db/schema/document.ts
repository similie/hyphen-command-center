import { UserRoles } from "$lib/types";
import {
  pgTable,
  integer,
  uuid,
  varchar,
  customType,
  boolean,
  bigint,
} from "drizzle-orm/pg-core";

const bytea = customType({
  dataType() {
    return "bytea";
  },
});

/*
 * These are for local assets to run the application. They are not uploaded
 * to the embeddings server.
 */
export const ApplicationDocumentsTable = pgTable("app_documents", {
  uid: uuid("uid").defaultRandom().primaryKey(),
  ownerUid: uuid("owner_uid"),
  name: varchar("name", { length: 128 }).notNull(),
  alt: varchar("alt", { length: 64 }),
  size: integer("size").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  original_file: bytea("original_file").notNull(),
  lg_file: bytea("lg_file"),
  md_file: bytea("md_file"),
  sm_file: bytea("sm_file"),
  type: varchar("type", { length: 128 }).notNull(),
  role: integer("role").default(UserRoles.ADMIN).notNull(),
  created_at: bigint("created_at", { mode: "number" })
    .notNull()
    .$defaultFn(() => new Date().getTime()),
  updated_at: bigint("updated_at", { mode: "number" })
    .notNull()
    .$defaultFn(() => new Date().getTime())
    .$onUpdateFn(() => new Date().getTime()),
});
