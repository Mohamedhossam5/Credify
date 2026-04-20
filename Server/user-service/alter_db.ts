import pool from "./src/config/db";

async function run() {
  try {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'USER'");
    console.log("ALter success.");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

run();
