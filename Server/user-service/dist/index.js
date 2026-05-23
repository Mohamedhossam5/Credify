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
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// ─── Global Middleware ───────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// ─── Routes ──────────────────────────────────────────────────
app.use("/api/auth", auth_1.default);
app.use("/api/internal", internal_1.default);
app.use("/api", finance_1.default);
app.use("/api/cards", cards_1.default);
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
