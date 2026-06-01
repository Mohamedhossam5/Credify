"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ChangeRequest_1 = __importDefault(require("../models/ChangeRequest"));
const User_1 = __importDefault(require("../models/User"));
const otp_1 = require("../services/otp");
const sms_1 = require("../services/sms");
const router = (0, express_1.Router)();
// ═══════════════════════════════════════════════════════════════
// USER-FACING ROUTES (require JWT authentication)
// ═══════════════════════════════════════════════════════════════
// ── POST /api/change-requests ─────────────────────────────────
// Create a new change request
router.post("/", auth_1.authenticate, auth_1.requireActiveUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { changeType, currentValue, newValue, documents } = req.body;
        if (!changeType || !newValue) {
            res.status(400).json({ error: "changeType and newValue are required." });
            return;
        }
        // Check for existing active request of the same type
        const existing = await ChangeRequest_1.default.findActiveByUserAndType(userId, changeType);
        if (existing) {
            res.status(409).json({
                error: "You already have an active change request for this field.",
                existingRequest: existing,
            });
            return;
        }
        const request = await ChangeRequest_1.default.create({
            userId,
            changeType,
            currentValue: currentValue || "",
            newValue,
            documents: documents || [],
        });
        res.status(201).json({ message: "Change request submitted.", request });
    }
    catch (err) {
        console.error("[ChangeRequests] Create error:", err.message);
        res.status(500).json({ error: "Failed to create change request." });
    }
});
// ── GET /api/change-requests ──────────────────────────────────
// List all requests for the authenticated user
router.get("/", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await ChangeRequest_1.default.findByUserId(userId);
        res.json({ requests });
    }
    catch (err) {
        console.error("[ChangeRequests] List error:", err.message);
        res.status(500).json({ error: "Failed to fetch change requests." });
    }
});
// ── POST /api/change-requests/send-otp ────────────────────────
// Send an OTP to the newly requested phone or email
router.post("/send-otp", auth_1.authenticate, auth_1.requireActiveUser, async (req, res) => {
    try {
        const { changeType, newValue } = req.body;
        if (!changeType || !newValue) {
            res.status(400).json({ error: "changeType and newValue are required." });
            return;
        }
        if (changeType === "PHONE_NUMBER" || changeType === "EMAIL_ADDRESS") {
            const purpose = `change-${changeType.toLowerCase()}`;
            const otp = (0, otp_1.generateKeyedOtp)(purpose, newValue);
            // MOCK: send via SMS service for both email and phone
            (0, sms_1.sendSms)(newValue, otp);
            res.json({ message: `Verification code sent to ${newValue}.` });
        }
        else {
            res.status(400).json({ error: "OTP not required for this change type." });
        }
    }
    catch (err) {
        console.error("[ChangeRequests] Send OTP error:", err.message);
        res.status(500).json({ error: "Failed to send verification code." });
    }
});
// ── POST /api/change-requests/verify-otp ──────────────────────
// Verify the OTP for the newly requested phone or email
router.post("/verify-otp", auth_1.authenticate, auth_1.requireActiveUser, async (req, res) => {
    try {
        const { changeType, newValue, otp } = req.body;
        if (!changeType || !newValue || !otp) {
            res.status(400).json({ error: "changeType, newValue, and otp are required." });
            return;
        }
        const purpose = `change-${changeType.toLowerCase()}`;
        const isValid = (0, otp_1.verifyKeyedOtp)(purpose, newValue, otp);
        if (!isValid) {
            res.status(401).json({ error: "Invalid or expired verification code." });
            return;
        }
        res.json({ message: "Verification successful." });
    }
    catch (err) {
        console.error("[ChangeRequests] Verify OTP error:", err.message);
        res.status(500).json({ error: "Failed to verify code." });
    }
});
// ── GET /api/change-requests/:id ──────────────────────────────
// Get a single request with messages
router.get("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const requestId = parseInt(req.params.id, 10);
        const request = await ChangeRequest_1.default.findById(requestId);
        if (!request || request.user_id !== userId) {
            res.status(404).json({ error: "Change request not found." });
            return;
        }
        const messages = await ChangeRequest_1.default.getMessages(requestId);
        res.json({ request, messages });
    }
    catch (err) {
        console.error("[ChangeRequests] Get error:", err.message);
        res.status(500).json({ error: "Failed to fetch change request." });
    }
});
// ── POST /api/change-requests/:id/documents ───────────────────
// Upload additional documents to a request
router.post("/:id/documents", auth_1.authenticate, auth_1.requireActiveUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const requestId = parseInt(req.params.id, 10);
        const { documents } = req.body;
        const request = await ChangeRequest_1.default.findById(requestId);
        if (!request || request.user_id !== userId) {
            res.status(404).json({ error: "Change request not found." });
            return;
        }
        if (!documents || !Array.isArray(documents) || documents.length === 0) {
            res.status(400).json({ error: "Documents array is required." });
            return;
        }
        const updated = await ChangeRequest_1.default.addDocuments(requestId, documents);
        // Add system message
        const docNames = documents.map((d) => d.originalName || d.name).join(", ");
        await ChangeRequest_1.default.addMessage(requestId, "USER", `Uploaded additional documents: ${docNames}`, documents);
        // If status was WAITING_FOR_CUSTOMER, move to UNDER_REVIEW
        if (request.status === "WAITING_FOR_CUSTOMER") {
            await ChangeRequest_1.default.updateStatus(requestId, "UNDER_REVIEW");
        }
        res.json({ message: "Documents uploaded.", request: updated });
    }
    catch (err) {
        console.error("[ChangeRequests] Upload docs error:", err.message);
        res.status(500).json({ error: "Failed to upload documents." });
    }
});
// ── POST /api/change-requests/:id/messages ────────────────────
// User sends a message
router.post("/:id/messages", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const requestId = parseInt(req.params.id, 10);
        const { message } = req.body;
        const request = await ChangeRequest_1.default.findById(requestId);
        if (!request || request.user_id !== userId) {
            res.status(404).json({ error: "Change request not found." });
            return;
        }
        const msg = await ChangeRequest_1.default.addMessage(requestId, "USER", message || "");
        res.json({ message: "Message sent.", data: msg });
    }
    catch (err) {
        console.error("[ChangeRequests] Message error:", err.message);
        res.status(500).json({ error: "Failed to send message." });
    }
});
// ═══════════════════════════════════════════════════════════════
// INTERNAL/ADMIN ROUTES (called by API gateway, no JWT needed)
// ═══════════════════════════════════════════════════════════════
// ── GET /api/internal/change-requests ─────────────────────────
router.get("/internal/all", async (_req, res) => {
    try {
        const requests = await ChangeRequest_1.default.findAll();
        res.json({ requests });
    }
    catch (err) {
        console.error("[ChangeRequests] Admin list error:", err.message);
        res.status(500).json({ error: "Failed to fetch change requests." });
    }
});
// ── GET /api/internal/change-requests/:id ─────────────────────
router.get("/internal/:id", async (req, res) => {
    try {
        const requestId = parseInt(req.params.id, 10);
        const request = await ChangeRequest_1.default.findById(requestId);
        if (!request) {
            res.status(404).json({ error: "Change request not found." });
            return;
        }
        const messages = await ChangeRequest_1.default.getMessages(requestId);
        // Also get user info
        const user = await User_1.default.findById(request.user_id);
        res.json({ request, messages, user });
    }
    catch (err) {
        console.error("[ChangeRequests] Admin get error:", err.message);
        res.status(500).json({ error: "Failed to fetch change request." });
    }
});
// ── POST /api/internal/change-requests/:id/approve ────────────
router.post("/internal/:id/approve", async (req, res) => {
    try {
        const requestId = parseInt(req.params.id, 10);
        const request = await ChangeRequest_1.default.findById(requestId);
        if (!request) {
            res.status(404).json({ error: "Change request not found." });
            return;
        }
        // Apply the change to the user record
        await ChangeRequest_1.default.applyChange(request);
        // Update status
        const updated = await ChangeRequest_1.default.updateStatus(requestId, "APPROVED");
        // Add system message
        await ChangeRequest_1.default.addMessage(requestId, "SYSTEM", "Your request has been approved. Your information has been updated successfully.");
        res.json({ message: "Request approved and changes applied.", request: updated });
    }
    catch (err) {
        console.error("[ChangeRequests] Approve error:", err.message);
        res.status(500).json({ error: "Failed to approve request." });
    }
});
// ── POST /api/internal/change-requests/:id/reject ─────────────
router.post("/internal/:id/reject", async (req, res) => {
    try {
        const requestId = parseInt(req.params.id, 10);
        const { reason } = req.body;
        const request = await ChangeRequest_1.default.findById(requestId);
        if (!request) {
            res.status(404).json({ error: "Change request not found." });
            return;
        }
        const updated = await ChangeRequest_1.default.updateStatus(requestId, "REJECTED");
        // Add admin message with rejection reason
        await ChangeRequest_1.default.addMessage(requestId, "ADMIN", reason || "Your request has been rejected.");
        res.json({ message: "Request rejected.", request: updated });
    }
    catch (err) {
        console.error("[ChangeRequests] Reject error:", err.message);
        res.status(500).json({ error: "Failed to reject request." });
    }
});
// ── POST /api/internal/change-requests/:id/request-info ───────
router.post("/internal/:id/request-info", async (req, res) => {
    try {
        const requestId = parseInt(req.params.id, 10);
        const { message } = req.body;
        const request = await ChangeRequest_1.default.findById(requestId);
        if (!request) {
            res.status(404).json({ error: "Change request not found." });
            return;
        }
        // Set status to waiting
        const updated = await ChangeRequest_1.default.updateStatus(requestId, "WAITING_FOR_CUSTOMER");
        // Add admin message
        await ChangeRequest_1.default.addMessage(requestId, "ADMIN", message || "We need additional information to proceed with your request.");
        res.json({ message: "Information requested.", request: updated });
    }
    catch (err) {
        console.error("[ChangeRequests] Request-info error:", err.message);
        res.status(500).json({ error: "Failed to request info." });
    }
});
exports.default = router;
