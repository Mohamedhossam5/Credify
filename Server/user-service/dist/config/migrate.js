"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
const migration = `
  CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    first_name    VARCHAR(100)  NOT NULL,
    middle_name   VARCHAR(100),
    last_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  UNIQUE NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    phone_number  VARCHAR(20)   NOT NULL,
    phone_verified BOOLEAN      NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN      NOT NULL DEFAULT FALSE,
    gender        VARCHAR(10)   NOT NULL DEFAULT 'MALE',
    id_number     VARCHAR(50)   UNIQUE NOT NULL,
    birthdate     DATE          NOT NULL,
    address       TEXT,
    kyc_status    VARCHAR(30)   DEFAULT 'PENDING',
    role          VARCHAR(20)   DEFAULT 'USER',
    profile_picture TEXT,
    failed_login_attempts INTEGER DEFAULT 0,
    is_locked     BOOLEAN       DEFAULT FALSE,
    is_frozen     BOOLEAN       NOT NULL DEFAULT FALSE,
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
    fee NUMERIC(12,2) NOT NULL DEFAULT 0,
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

  CREATE TABLE IF NOT EXISTS cards (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER       NOT NULL REFERENCES users(id),
    card_type         VARCHAR(10)   NOT NULL CHECK (card_type IN ('DEBIT', 'PREPAID')),
    card_number       VARCHAR(16)   UNIQUE NOT NULL,
    last_four         VARCHAR(4)    NOT NULL,
    expiry_month      INTEGER       NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
    expiry_year       INTEGER       NOT NULL,
    cvv               VARCHAR(4)    NOT NULL,
    cardholder_name   VARCHAR(200)  NOT NULL,
    status            VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FROZEN', 'CANCELLED')),
    prepaid_balance   NUMERIC(15,2) DEFAULT 0.00,
    linked_account_id VARCHAR(50),
    daily_limit       NUMERIC(15,2) DEFAULT 10000.00,
    created_at        TIMESTAMP     DEFAULT NOW(),
    updated_at        TIMESTAMP     DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
  CREATE INDEX IF NOT EXISTS idx_cards_type_status ON cards(user_id, card_type, status);

  CREATE TABLE IF NOT EXISTS card_deliveries (
    id                SERIAL PRIMARY KEY,
    card_id           INTEGER       NOT NULL REFERENCES cards(id),
    user_id           INTEGER       NOT NULL REFERENCES users(id),
    delivery_address  TEXT          NOT NULL,
    city              VARCHAR(100)  NOT NULL,
    postal_code       VARCHAR(20)   NOT NULL,
    contact_phone     VARCHAR(30)   NOT NULL,
    status            VARCHAR(20)   NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED')),
    notes             TEXT,
    estimated_delivery TIMESTAMP,
    created_at        TIMESTAMP     DEFAULT NOW(),
    updated_at        TIMESTAMP     DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_card_deliveries_card_id ON card_deliveries(card_id);
  CREATE INDEX IF NOT EXISTS idx_card_deliveries_user_id ON card_deliveries(user_id);

  CREATE TABLE IF NOT EXISTS beneficiaries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100),
    swift_code VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, account_number)
  );

  ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT FALSE;

  CREATE TABLE IF NOT EXISTS loans (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER       NOT NULL REFERENCES users(id),
    amount            NUMERIC(15,2) NOT NULL,
    tenure_months     INTEGER       NOT NULL,
    interest_rate     NUMERIC(5,2)  NOT NULL,
    monthly_payment   NUMERIC(15,2) NOT NULL,
    total_repayment   NUMERIC(15,2) NOT NULL,
    total_interest    NUMERIC(15,2) NOT NULL,
    admin_fee         NUMERIC(15,2) NOT NULL DEFAULT 0,
    purpose           TEXT,
    status            VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING','APPROVED','REJECTED','ACTIVE','COMPLETED')),
    rejection_reason  TEXT,
    approved_at       TIMESTAMP,
    disbursed_at      TIMESTAMP,
    created_at        TIMESTAMP     DEFAULT NOW(),
    updated_at        TIMESTAMP     DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
  CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
`;
async function runMigration() {
    try {
        await db_1.default.query(migration);
        console.log("[Migration] Database migrated successfully.");
    }
    catch (err) {
        console.error("[Migration] Failed:", err.message);
    }
    finally {
        await db_1.default.end();
    }
}
runMigration();
