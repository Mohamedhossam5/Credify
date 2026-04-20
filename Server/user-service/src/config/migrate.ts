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
    role          VARCHAR(20)   DEFAULT 'USER',
    created_at    TIMESTAMP     DEFAULT NOW(),
    updated_at    TIMESTAMP     DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER       NOT NULL,
    account_id    VARCHAR(50)   UNIQUE NOT NULL,
    balance       NUMERIC(10,2) DEFAULT 0.00,
    created_at    TIMESTAMP     DEFAULT NOW(),
    updated_at    TIMESTAMP     DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    sender_account_id VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'COMPLETED',

    recipient_name VARCHAR(100) NOT NULL,
    recipient_account VARCHAR(100) NOT NULL,
    
    recipient_bank VARCHAR(100),
    swift_code VARCHAR(50),      
    recipient_address TEXT,     
    reference TEXT,              

    created_at TIMESTAMP DEFAULT NOW()
  );
`;

async function runMigration(): Promise<void> {
  try {
    await pool.query(migration);
    console.log("[Migration] Database migrated successfully.");
  } catch (err: any) {
    console.error("[Migration] Failed:", err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
