import { Pool } from "pg";
import bcrypt from "bcryptjs";

async function run() {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash("password123", salt);

  const usersPool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: "credify_users",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  });

  const kycPool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: "credify_kyc",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  });

  // Clear existing (respecting FK order)
  await kycPool.query("DELETE FROM kyc_applications");
  await usersPool.query("DELETE FROM transactions");
  await usersPool.query("DELETE FROM card_deliveries").catch(() => {});
  await usersPool.query("DELETE FROM cards").catch(() => {});
  await usersPool.query("DELETE FROM accounts");
  await usersPool.query("DELETE FROM users");

  // ─── 1. Admin account (OTP bypassed by role) ─────────────────
  const adminRes = await usersPool.query(`
    INSERT INTO users (first_name, last_name, email, password_hash, phone_number, gender, id_number, birthdate, role, kyc_status, phone_verified, email_verified)
    VALUES ('Super', 'Admin', 'admin@example.com', $1, '+201000000000', 'MALE', '29001011234517', '1990-01-01', 'ADMIN', 'APPROVED', true, true)
    RETURNING id
  `, [hash]);

  await kycPool.query(`
    INSERT INTO kyc_applications (user_id, status, face_match_score, face_match_passed)
    VALUES ($1, 'APPROVED', 0.95, true)
  `, [adminRes.rows[0].id]);

  console.log("✓ Admin  → admin@example.com / password123");

  // ─── 2. Test User 1 (verified, ready for KYC) ───────────────
  const user1Res = await usersPool.query(`
    INSERT INTO users (first_name, last_name, email, password_hash, phone_number, gender, id_number, birthdate, role, kyc_status, phone_verified, email_verified)
    VALUES ('Ahmed', 'Hassan', 'testuser1@credify.com', $1, '+201111111111', 'MALE', '30001011234513', '2000-01-01', 'USER', 'PENDING', true, true)
    RETURNING id
  `, [hash]);

  console.log("✓ User 1 → testuser1@credify.com / password123  (phone+email verified, KYC pending)");

  // ─── 3. Test User 2 (verified, ready for KYC) ───────────────
  const user2Res = await usersPool.query(`
    INSERT INTO users (first_name, last_name, email, password_hash, phone_number, gender, id_number, birthdate, role, kyc_status, phone_verified, email_verified)
    VALUES ('Fatma', 'Ali', 'testuser2@credify.com', $1, '+201222222222', 'FEMALE', '30106152345678', '2001-06-15', 'USER', 'PENDING', true, true)
    RETURNING id
  `, [hash]);

  console.log("✓ User 2 → testuser2@credify.com / password123  (phone+email verified, KYC pending)");

  console.log("\n✅ Test data created. All accounts use password: password123");
  console.log("   Test users have phone+email pre-verified → login gives JWT directly (no OTP).");

  await usersPool.end();
  await kycPool.end();
  process.exit();
}

run();
