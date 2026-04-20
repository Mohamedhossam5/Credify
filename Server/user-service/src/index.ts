import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import internalRoutes from "./routes/internal";
import financeRoutes from "./routes/finance";

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Global Middleware ───────────────────────────────────────

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/internal", internalRoutes);
app.use("/api", financeRoutes);

// ─── Health Check ────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "user-service" });
});

// ─── 404 Handler ─────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ─── Start Server ────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[User Service] Running on port ${PORT}`);
});
