import pool from "./src/config/db";

async function run() {
  try {
    // Add PENDING_ADMIN_REVIEW to kyc_status ENUM
    await pool.query("ALTER TYPE kyc_status ADD VALUE IF NOT EXISTS 'PENDING_ADMIN_REVIEW'");
    console.log("Successfully added PENDING_ADMIN_REVIEW to kyc_status Enum.");
  } catch (err) {
    console.error("Error migrating DB:", err);
  } finally {
    process.exit();
  }
}

run();
