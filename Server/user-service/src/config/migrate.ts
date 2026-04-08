import pool from "./db";

const migration = `
  CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    first_name    VARCHAR(100)  NOT NULL,
    last_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  UNIQUE NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    id_number     VARCHAR(50)   UNIQUE NOT NULL,
    birthdate     DATE          NOT NULL,
    address       TEXT,
    kyc_status    VARCHAR(30)   DEFAULT 'PENDING',
    created_at    TIMESTAMP     DEFAULT NOW(),
    updated_at    TIMESTAMP     DEFAULT NOW()
  );
`;

async function runMigration(): Promise<void> {
  try {
    await pool.query(migration);
    console.log("[Migration] users table created successfully.");
  } catch (err: any) {
    console.error("[Migration] Failed:", err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
