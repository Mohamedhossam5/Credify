"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = __importDefault(require("./routes/auth"));
const internal_1 = __importDefault(require("./routes/internal"));
const finance_1 = __importDefault(require("./routes/finance"));
const cards_1 = __importDefault(require("./routes/cards"));
const loans_1 = __importDefault(require("./routes/loans"));
const change_requests_1 = __importDefault(require("./routes/change-requests"));
const ChangeRequest_1 = __importDefault(require("./models/ChangeRequest"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// ─── Global Middleware ───────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json({ limit: "50mb" }));
// ─── Auto-create tables ─────────────────────────────────────
ChangeRequest_1.default.createTables().catch((err) => console.error("[User Service] Failed to create change_requests tables:", err.message));
// ─── Routes ──────────────────────────────────────────────────
app.use("/api/auth", auth_1.default);
app.use("/api/internal", internal_1.default);
app.use("/api", finance_1.default);
app.use("/api/cards", cards_1.default);
app.use("/api/loans", loans_1.default);
app.use("/api/change-requests", change_requests_1.default);
// ─── Health Check ────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "user-service" });
});
// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found." });
});
const db_1 = __importDefault(require("./config/db"));
async function runStartupPatches() {
    try {
        console.log("[Startup] Checking and applying database patches for User Service...");
        await db_1.default.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
    `);
        console.log("[Startup] Database patches applied successfully.");
    }
    catch (err) {
        console.error("[Startup] Failed to apply database patches:", err.message);
    }
}
// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, async () => {
    await runStartupPatches();
    console.log(`[User Service] Running on port ${PORT}`);
});
