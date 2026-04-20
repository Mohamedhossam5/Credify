import pool from "./src/config/db";

async function check() {
  const { rows } = await pool.query("SELECT u.email, a.balance FROM users u JOIN accounts a ON u.id = a.user_id");
  console.log("Users and Balances:");
  console.table(rows);
  process.exit(0);
}
check();
