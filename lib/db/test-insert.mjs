import pg from "./node_modules/pg/lib/index.js";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      ["Test Direct"]
    );
    console.log("Inserted:", result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    console.error("Detail:", err.detail || "(none)");
    console.error("Hint:", err.hint || "(none)");
    console.error("Code:", err.code || "(none)");
    process.exit(1);
  }
}

main();
