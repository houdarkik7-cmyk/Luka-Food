import pg from "./node_modules/pg/lib/index.js";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log("Creating schema...");

  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE "public"."order_status" AS ENUM('pending', 'preparing', 'completed');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "categories" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "menu_items" (
      "id" SERIAL PRIMARY KEY,
      "category_id" INTEGER NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "price" NUMERIC(10,3) NOT NULL,
      "image_url" TEXT,
      "available" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "orders" (
      "id" SERIAL PRIMARY KEY,
      "table_number" INTEGER NOT NULL,
      "status" "public"."order_status" NOT NULL DEFAULT 'pending',
      "total_price" NUMERIC(10,3) NOT NULL,
      "notes" TEXT,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "order_items" (
      "id" SERIAL PRIMARY KEY,
      "order_id" INTEGER NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
      "menu_item_id" INTEGER NOT NULL REFERENCES "menu_items"("id") ON DELETE CASCADE,
      "menu_item_name" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "unit_price" NUMERIC(10,3) NOT NULL
    );
  `);

  const result = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log("Tables:", result.rows.map(r => r.table_name).join(", "));
  console.log("Schema pushed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
