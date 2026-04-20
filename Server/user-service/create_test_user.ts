import pool from "./src/config/db";
import bcrypt from "bcryptjs";
import Account from "./src/models/Account";

async function run() {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash("test1234", salt);

  console.log("Creating Test User Account...");

  try {
    const { rows: existing } = await pool.query("SELECT * FROM users WHERE email = 'testuser@credify.com'");
    if (existing.length > 0) {
      console.log("Test user account already exists!");
      process.exit(0);
    }

    const res = await pool.query(`
      INSERT INTO users (first_name, last_name, email, password_hash, id_number, birthdate, role, kyc_status)
      VALUES ('Test', 'User', 'testuser@credify.com', $1, 'TEST-0001', '1990-01-01', 'USER', 'APPROVED')
      RETURNING id
    `, [hash]);

    const userId = res.rows[0].id;
    
    // Create account for this user and set balance to $50,000
    const account = await Account.create(userId);
    await pool.query("UPDATE accounts SET balance = 50000.00 WHERE id = $1", [account.id]);

    console.log("Test user inserted with $50,000 balance.");
    console.log("Email: testuser@credify.com");
    console.log("Password: test1234");
    console.log("Account ID: " + account.account_id);

  } catch (e) {
    console.error("Error creating test user:", e);
  } finally {
    process.exit();
  }
}

run();
