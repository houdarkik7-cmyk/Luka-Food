import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

try {
  const result = await db.execute("SELECT * FROM categories");
  console.log("Result:", JSON.stringify(result.rows));
} catch (e) {
  console.error("Error:", e.message);
  if (e.detail) console.error("Detail:", e.detail);
  if (e.hint) console.error("Hint:", e.hint);
}
await pool.end();
