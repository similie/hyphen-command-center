import { execSync } from "node:child_process";
import { seed } from "./seeds"; // your custom seed function
import { db } from "./query/db.server";
let ran = false;
export async function bootstrap() {
  if (ran) {
    return;
  }
  ran = true;
  console.log("🚀 Running DB bootstrap...");
  try {
    // 1️⃣ Run migrations (safe & idempotent)
    // 2️⃣ Run seeding logic if needed
    let result;
    try {
      result = await db.execute(`SELECT COUNT(*) FROM "user";`);
      if (!result || !Array.isArray(result)) {
        execSync("npm run migrate", { stdio: "inherit" });
      }
      //   throw new Error("Failed to query user table for seeding check.");
    } catch (err) {
      console.log("User table does not exist, running migrations...");
      execSync("npm run migrate", { stdio: "inherit" });
      result = await db.execute(`SELECT COUNT(*) FROM "user";`);
    }

    if (!result || !Array.isArray(result)) {
      return;
    }
    const count = Number(result[0]?.count ?? 0);
    if (count > 0) {
      return;
    }
    console.log("🌱 Empty DB detected — running seed...");
    await seed(db);
  } catch (err) {
    console.error("❌ Bootstrap failed:", err);
  }
}
