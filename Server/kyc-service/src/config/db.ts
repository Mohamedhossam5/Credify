import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "credify_kyc",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
});

pool.on("connect", () => {
  console.log("[KYC Service] Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("[KYC Service] Unexpected DB error:", err);
  process.exit(-1);
});

export default pool;
