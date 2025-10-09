import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
// import { DATABASE_URL } from "$env/dynamic/private";

// Lazy load DATABASE_URL at runtime
const getDatabaseUrl = () =>
  process.env.DATABASE_URL ||
  // docker default
  "postgres://postgres:postgres@vector_db:5433/vector";

// const client = dev ? postgres(DATABASE_URL) : postgres(DATABASE_URL, { ssl: 'require' });
const client = postgres(getDatabaseUrl());
export const db = drizzle(client, {});
