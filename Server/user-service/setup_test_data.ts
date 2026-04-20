import { Pool } from "pg";
import bcrypt from "bcryptjs";
import Account from "./src/models/Account";

async function run() {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash("password", salt);

  const usersPool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: "credify_users",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
  });

  const kycPool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: "credify_kyc",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
  });

  // Clear existing
  await usersPool.query("DELETE FROM accounts");
  await usersPool.query("DELETE FROM users");
  await kycPool.query("DELETE FROM kyc_applications");

  // Insert Admin
  const adminRes = await usersPool.query(`
    INSERT INTO users (first_name, last_name, email, password_hash, id_number, birthdate, role, kyc_status)
    VALUES ('Super', 'Admin', 'admin@example.com', $1, 'ID-ADMIN', '1990-01-01', 'ADMIN', 'APPROVED')
    RETURNING id
  `, [hash]);

  // Insert Admin KYC
  await kycPool.query(`
    INSERT INTO kyc_applications (user_id, status, face_match_score, face_match_passed)
    VALUES ($1, 'APPROVED', 0.123, true)
  `, [adminRes.rows[0].id]);

  // Insert User
  const userRes = await usersPool.query(`
    INSERT INTO users (first_name, last_name, email, password_hash, id_number, birthdate, role, kyc_status)
    VALUES ('John', 'Doe', 'user@example.com', $1, 'ID-12345', '1995-05-05', 'USER', 'APPROVED')
    RETURNING id
  `, [hash]);

  const userId = userRes.rows[0].id;

  // Insert User KYC
  await kycPool.query(`
    INSERT INTO kyc_applications (user_id, status, face_match_score, face_match_passed)
    VALUES ($1, 'APPROVED', 0.054, true)
  `, [userId]);

  // Create account directly using query instead of model relying on local pool
  const accountId = 'CRD' + Math.floor(100000000 + Math.random() * 900000000).toString();
  await usersPool.query(
    "INSERT INTO accounts (user_id, account_id, balance) VALUES ($1, $2, 5000.00)",
    [userId, accountId]
  );

  console.log("Mock data generated.");
  process.exit();
}

run();
