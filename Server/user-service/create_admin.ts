import pool from "./src/config/db";
import bcrypt from "bcryptjs";

async function run() {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash("admin123", salt);

  console.log("Creating Admin Account...");

  try {
    const { rows: existing } = await pool.query("SELECT * FROM users WHERE email = 'admin@credify.com'");
    if (existing.length > 0) {
      console.log("Admin account already exists!");
      process.exit(0);
    }

    const adminRes = await pool.query(`
      INSERT INTO users (first_name, last_name, email, password_hash, id_number, birthdate, role, kyc_status)
      VALUES ('Super', 'Admin', 'admin@credify.com', $1, 'ADMIN-0001', '1980-01-01', 'ADMIN', 'APPROVED')
      RETURNING id
    `, [hash]);

    console.log("Admin inserted.");


    console.log("Admin account successfully created!");
    console.log("Email: admin@credify.com");
    console.log("Password: admin123");

  } catch (e) {
    console.error("Error creating admin:", e);
  } finally {
    process.exit();
  }
}

run();
