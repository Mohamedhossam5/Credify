import pool from "./src/config/db";

async function run() {
  try {
    await pool.query("DELETE FROM transactions");
    await pool.query("DELETE FROM accounts WHERE user_id IN (SELECT id FROM users WHERE role != 'ADMIN')");
    await pool.query("DELETE FROM users WHERE role != 'ADMIN'");
    console.log("Successfully wiped user DB records.");
  } catch (err) {
    console.error("Failed to wipe user DB", err);
  } finally {
    process.exit(0);
  }
}
run();
