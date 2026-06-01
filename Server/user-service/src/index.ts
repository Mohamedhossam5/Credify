import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import internalRoutes from "./routes/internal";
import financeRoutes from "./routes/finance";
import cardRoutes from "./routes/cards";
import loanRoutes from "./routes/loans";
import changeRequestRoutes from "./routes/change-requests";
import ChangeRequest from "./models/ChangeRequest";

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Global Middleware ───────────────────────────────────────

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));

// ─── Auto-create tables ─────────────────────────────────────

ChangeRequest.createTables().catch((err) =>
  console.error("[User Service] Failed to create change_requests tables:", err.message)
);

// ─── Routes ──────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/internal", internalRoutes);
app.use("/api", financeRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/change-requests", changeRequestRoutes);

// ─── Health Check ────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "user-service" });
});

// ─── 404 Handler ─────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

import pool from "./config/db";

async function runStartupPatches() {
  try {
    console.log("[Startup] Checking and applying database patches for User Service...");
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
    `);
    console.log("[Startup] Database patches applied successfully.");
  } catch (err: any) {
    console.error("[Startup] Failed to apply database patches:", err.message);
  }
}

// ─── Start Server ────────────────────────────────────────────

app.listen(PORT, async () => {
  await runStartupPatches();
  console.log(`[User Service] Running on port ${PORT}`);
});
