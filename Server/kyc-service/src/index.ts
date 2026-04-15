import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import kycRoutes from "./routes/kyc";
import internalRoutes from "./routes/internal";

const app = express();
const PORT = process.env.PORT || 3002;

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Global Middleware ───────────────────────────────────────

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────

app.use("/api/kyc", kycRoutes);
app.use("/api/internal", internalRoutes);

// ─── Health Check ────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "kyc-service" });
});

// ─── 404 Handler ─────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ─── Start Server ────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[KYC Service] Running on port ${PORT}`);
});
