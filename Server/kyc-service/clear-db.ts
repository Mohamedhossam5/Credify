import pool from "./src/config/db";

async function run() {
  try {
    await pool.query("DELETE FROM kyc_applications");
    console.log("Successfully wiped KYC DB records.");
  } catch (err) {
    console.error("Failed to wipe KYC DB", err);
  } finally {
    process.exit(0);
  }
}
run();
