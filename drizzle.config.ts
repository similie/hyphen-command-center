import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();
const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  throw new Error("No database url provided");
}

export default defineConfig({
  schema: "./src/lib/server/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  out: "./src/db", // Directory where generated types will be stored
});
