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
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const url_1 = require("url");
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
const KYC_SERVICE_URL = process.env.KYC_SERVICE_URL || "http://localhost:3002";
// ─── Global Middleware ───────────────────────────────────────
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: "Too many requests, please try again later." },
});
app.use(limiter);
// ─── Serve Frontend ──────────────────────────────────────────
app.use(express_1.default.static(path_1.default.join(__dirname, "../../../frontend")));
// ─── Helper: Forward JSON requests ──────────────────────────
async function forwardJSON(serviceUrl, apiPath, req, res) {
    try {
        const headers = { "Content-Type": "application/json" };
        if (req.headers.authorization) {
            headers["Authorization"] = req.headers.authorization;
        }
        const opts = { method: req.method, headers };
        if (["POST", "PUT", "PATCH"].includes(req.method)) {
            opts.body = JSON.stringify(req.body);
        }
        const upstream = await fetch(`${serviceUrl}${apiPath}`, opts);
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        console.error(`[Gateway] Error forwarding to ${serviceUrl}${apiPath}:`, err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
}
// ─── Helper: Forward multipart (file upload) requests ───────
function forwardMultipart(serviceUrl, apiPath, req, res) {
    try {
        const target = new url_1.URL(apiPath, serviceUrl);
        const options = {
            hostname: target.hostname,
            port: target.port || 80,
            path: target.pathname + target.search,
            method: req.method,
            headers: {
                ...req.headers,
                host: target.host,
            },
        };
        const proxyReq = http_1.default.request(options, (proxyRes) => {
            let body = "";
            proxyRes.on("data", (chunk) => { body += chunk; });
            proxyRes.on("end", () => {
                try {
                    res.status(proxyRes.statusCode || 500).json(JSON.parse(body));
                }
                catch {
                    res.status(proxyRes.statusCode || 500).send(body);
                }
            });
        });
        proxyReq.on("error", (err) => {
            console.error(`[Gateway] Proxy error for ${apiPath}:`, err.message);
            res.status(502).json({ error: "Upstream service unavailable." });
        });
        req.pipe(proxyReq);
    }
    catch (err) {
        console.error(`[Gateway] Error forwarding upload to ${serviceUrl}${apiPath}:`, err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
}
// ─── Auth Routes -> User Service ─────────────────────────────
app.use("/api/auth", express_1.default.json());
app.post("/api/auth/register", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/register", req, res));
app.post("/api/auth/login", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/login", req, res));
app.post("/api/auth/verify-otp", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/verify-otp", req, res));
app.post("/api/auth/resend-otp", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/resend-otp", req, res));
app.post("/api/auth/send-phone-otp", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/send-phone-otp", req, res));
app.post("/api/auth/verify-phone", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/verify-phone", req, res));
app.post("/api/auth/send-email-otp", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/send-email-otp", req, res));
app.post("/api/auth/verify-email", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/verify-email", req, res));
app.get("/api/auth/verification-status", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/verification-status", req, res));
app.get("/api/auth/me", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/me", req, res));
app.post("/api/auth/forgot-password", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/forgot-password", req, res));
app.post("/api/auth/verify-reset-otp", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/verify-reset-otp", req, res));
app.post("/api/auth/reset-password", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/reset-password", req, res));
// ─── Finance Routes -> User Service ──────────────────────────
app.get("/api/fx-rates", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, "/api/fx-rates", req, res));
app.post("/api/transfer/initiate", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, "/api/transfer/initiate", req, res));
app.post("/api/transfer/confirm", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, "/api/transfer/confirm", req, res));
app.get("/api/transactions", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, req.originalUrl, req, res));
// ─── Card Routes -> User Service ─────────────────────────────
app.post("/api/cards/request", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, "/api/cards/request", req, res));
app.get("/api/cards", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, "/api/cards", req, res));
app.get("/api/cards/:cardId", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, `/api/cards/${req.params.cardId}`, req, res));
app.post("/api/cards/:cardId/freeze", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, `/api/cards/${req.params.cardId}/freeze`, req, res));
app.post("/api/cards/:cardId/cancel", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, `/api/cards/${req.params.cardId}/cancel`, req, res));
app.post("/api/cards/:cardId/set-limit", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, `/api/cards/${req.params.cardId}/set-limit`, req, res));
app.post("/api/cards/load", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, "/api/cards/load", req, res));
app.post("/api/cards/unload", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, "/api/cards/unload", req, res));
app.post("/api/cards/transfer", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, "/api/cards/transfer", req, res));
app.get("/api/cards/deliveries/all", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, "/api/cards/deliveries/all", req, res));
app.post("/api/cards/:cardId/delivery", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, `/api/cards/${req.params.cardId}/delivery`, req, res));
app.get("/api/cards/:cardId/delivery", express_1.default.json(), (req, res) => forwardJSON(USER_SERVICE_URL, `/api/cards/${req.params.cardId}/delivery`, req, res));
// ─── KYC Routes -> KYC Service ───────────────────────────────
app.get("/api/kyc/status", express_1.default.json(), (req, res) => forwardJSON(KYC_SERVICE_URL, "/api/kyc/status", req, res));
app.post("/api/kyc/verify", express_1.default.json(), (req, res) => forwardJSON(KYC_SERVICE_URL, "/api/kyc/verify", req, res));
app.post("/api/kyc/upload/national-id", (req, res) => forwardMultipart(KYC_SERVICE_URL, "/api/kyc/upload/national-id", req, res));
app.post("/api/kyc/upload/face-selfie", (req, res) => forwardMultipart(KYC_SERVICE_URL, "/api/kyc/upload/face-selfie", req, res));
app.post("/api/kyc/upload/proof-of-address", (req, res) => forwardMultipart(KYC_SERVICE_URL, "/api/kyc/upload/proof-of-address", req, res));
// ─── Admin Routes ──────────────────────────────────────────────
app.use("/api/admin", admin_1.default);
// ─── Health Check ────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "api-gateway", upstreams: { userService: USER_SERVICE_URL, kycService: KYC_SERVICE_URL } });
});
// ─── SPA Fallback ────────────────────────────────────────────
app.get("*", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../../frontend/index.html"));
});
// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[API Gateway] Running on port ${PORT}`);
    console.log(`  -> User Service:  ${USER_SERVICE_URL}`);
    console.log(`  -> KYC Service:   ${KYC_SERVICE_URL}`);
    console.log(`  -> Frontend:      http://localhost:${PORT}`);
});
