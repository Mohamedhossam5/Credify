import pool from "./db";

const migration = `
  DO $$ BEGIN
    CREATE TYPE kyc_status_enum AS ENUM (
      'PENDING',
      'DOCUMENTS_UPLOADED',
      'AI_VERIFICATION_IN_PROGRESS',
      'MANUAL_REVIEW',
      'APPROVED',
      'REJECTED'
    );
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  CREATE TABLE IF NOT EXISTS kyc_applications (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER       NOT NULL UNIQUE,
    status              kyc_status_enum DEFAULT 'PENDING',
    national_id_front   VARCHAR(500),
    national_id_back    VARCHAR(500),
    face_selfie         VARCHAR(500),
    proof_of_address    VARCHAR(500),
    face_match_score    DECIMAL(5,4),
    face_match_passed   BOOLEAN,
    rejection_reason    TEXT,
    created_at          TIMESTAMP     DEFAULT NOW(),
    updated_at          TIMESTAMP     DEFAULT NOW()
  );
`;

async function runMigration(): Promise<void> {
  try {
    await pool.query(migration);
    console.log("[Migration] kyc_applications table created successfully.");
  } catch (err: any) {
    console.error("[Migration] Failed:", err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
