"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const router = (0, express_1.Router)();
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
const KYC_SERVICE_URL = process.env.KYC_SERVICE_URL || "http://localhost:3002";
// ─── GET /api/admin/dashboard ────────────────────────────────
router.get("/dashboard", async (req, res) => {
    try {
        const [usersRes, kycRes] = await Promise.all([
            fetch(`${USER_SERVICE_URL}/api/internal/users`),
            fetch(`${KYC_SERVICE_URL}/api/internal/kyc/all`)
        ]);
        if (!usersRes.ok || !kycRes.ok) {
            throw new Error("Failed to fetch data from internal services");
        }
        const { users = [] } = (await usersRes.json());
        const { records = [] } = (await kycRes.json());
        const merged = users.map((u) => {
            const kyc = records.find((k) => k.user_id === u.id);
            return {
                ...u,
                face_match_score: kyc ? kyc.face_match_score : null,
                face_match_passed: kyc ? kyc.face_match_passed : null,
                kyc_app_status: kyc ? kyc.status : 'PENDING',
                rejection_reason: kyc ? kyc.rejection_reason : null,
                // Document filenames for admin review
                national_id_front_file: kyc ? kyc.national_id_front_file : null,
                national_id_back_file: kyc ? kyc.national_id_back_file : null,
                face_selfie_file: kyc ? kyc.face_selfie_file : null,
                proof_of_address_file: kyc ? kyc.proof_of_address_file : null,
                digital_signature_file: kyc ? kyc.digital_signature_file : null,
            };
        });
        res.json({ users: merged });
    }
    catch (err) {
        console.error("[Admin API] Error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// ─── POST /api/admin/kyc/:userId/approve ─────────────────────
router.post("/kyc/:userId/approve", async (req, res) => {
    try {
        const upstream = await fetch(`${KYC_SERVICE_URL}/api/internal/kyc/${req.params.userId}/approve`, { method: "POST" });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        console.error("[Admin API] Approve error:", err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
});
// ─── POST /api/admin/kyc/:userId/reject ──────────────────────
router.post("/kyc/:userId/reject", express_2.default.json(), async (req, res) => {
    try {
        const upstream = await fetch(`${KYC_SERVICE_URL}/api/internal/kyc/${req.params.userId}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: req.body?.reason }),
        });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        console.error("[Admin API] Reject error:", err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
});
// ─── GET /api/admin/kyc/images/:filename ─────────────────────
router.get("/kyc/images/:filename", async (req, res) => {
    try {
        const upstream = await fetch(`${KYC_SERVICE_URL}/api/internal/kyc/images/${req.params.filename}`);
        if (!upstream.ok) {
            res.status(upstream.status).json({ error: "Image not found." });
            return;
        }
        const contentType = upstream.headers.get("content-type") || "application/octet-stream";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        const buffer = Buffer.from(await upstream.arrayBuffer());
        res.send(buffer);
    }
    catch (err) {
        console.error("[Admin API] Image proxy error:", err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
});
// ─── PUT /api/admin/users/:userId/unlock ─────────────────────
router.put("/users/:userId/unlock", async (req, res) => {
    try {
        const upstream = await fetch(`${USER_SERVICE_URL}/api/internal/users/${req.params.userId}/unlock`, { method: "PUT" });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        console.error("[Admin API] Unlock user error:", err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
});
// ─── PUT /api/admin/users/:userId/freeze ─────────────────────
router.put("/users/:userId/freeze", async (req, res) => {
    try {
        const upstream = await fetch(`${USER_SERVICE_URL}/api/internal/users/${req.params.userId}/freeze`, { method: "PUT" });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        console.error("[Admin API] Freeze user error:", err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
});
// ─── PUT /api/admin/users/:userId/unfreeze ───────────────────
router.put("/users/:userId/unfreeze", async (req, res) => {
    try {
        const upstream = await fetch(`${USER_SERVICE_URL}/api/internal/users/${req.params.userId}/unfreeze`, { method: "PUT" });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        console.error("[Admin API] Unfreeze user error:", err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
});
// ─── GET /api/admin/users/:userId/transactions ───────────────
router.get("/users/:userId/transactions", async (req, res) => {
    try {
        const upstream = await fetch(`${USER_SERVICE_URL}/api/internal/users/${req.params.userId}/transactions`);
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        console.error("[Admin API] Get user transactions error:", err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
});
// ─── Change Request Admin Routes ─────────────────────────────
// GET /api/admin/change-requests — list all change requests
router.get("/change-requests", async (_req, res) => {
    try {
        const upstream = await fetch(`${USER_SERVICE_URL}/api/change-requests/internal/all`);
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        console.error("[Admin API] Change requests list error:", err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
});
// GET /api/admin/change-requests/:id — get a single change request
router.get("/change-requests/:id", async (req, res) => {
    try {
        const upstream = await fetch(`${USER_SERVICE_URL}/api/change-requests/internal/${req.params.id}`);
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        console.error("[Admin API] Change request get error:", err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
});
// POST /api/admin/change-requests/:id/approve
router.post("/change-requests/:id/approve", async (req, res) => {
    try {
        const upstream = await fetch(`${USER_SERVICE_URL}/api/change-requests/internal/${req.params.id}/approve`, { method: "POST" });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        console.error("[Admin API] Change request approve error:", err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
});
// POST /api/admin/change-requests/:id/reject
router.post("/change-requests/:id/reject", express_2.default.json(), async (req, res) => {
    try {
        const upstream = await fetch(`${USER_SERVICE_URL}/api/change-requests/internal/${req.params.id}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: req.body?.reason }),
        });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        console.error("[Admin API] Change request reject error:", err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
});
// POST /api/admin/change-requests/:id/request-info
router.post("/change-requests/:id/request-info", express_2.default.json(), async (req, res) => {
    try {
        const upstream = await fetch(`${USER_SERVICE_URL}/api/change-requests/internal/${req.params.id}/request-info`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: req.body?.message }),
        });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        console.error("[Admin API] Change request request-info error:", err.message);
        res.status(502).json({ error: "Upstream service unavailable." });
    }
});
exports.default = router;
