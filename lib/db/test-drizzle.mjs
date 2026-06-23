import pg from "./node_modules/pg/lib/index.js";
import { drizzle } from "./node_modules/drizzle-orm/src/index.js";
import * as schema from "./src/schema/index.ts";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  try {
    const [created] = await db.insert(schema.categoriesTable).values({ name: "Test Drizzle" }).returning();
    console.log("Inserted:", created);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    if (err.cause) {
      console.error("Cause:", err.cause.message || err.cause);
    }
    process.exit(1);
  }
}

main();
