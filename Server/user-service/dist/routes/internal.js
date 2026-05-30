"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const Account_1 = __importDefault(require("../models/Account"));
const router = (0, express_1.Router)();
// GET /api/internal/users
router.get("/users", async (_req, res) => {
    try {
        const users = await User_1.default.findAll();
        res.json({ users });
    }
    catch (err) {
        console.error("[Internal] Error fetching users:", err.message);
        res.status(500).json({ error: "Internal server error." });
    }
});
// POST /api/internal/users/:id/kyc-status
// Generic endpoint to update a user's kyc_status from any service.
router.post("/users/:id/kyc-status", async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            res.status(400).json({ error: "Invalid user ID." });
            return;
        }
        const { status } = req.body || {};
        if (!status) {
            res.status(400).json({ error: "Missing 'status' in request body." });
            return;
        }
        await User_1.default.updateKycStatus(userId, status);
        res.json({ message: `User kyc_status updated to ${status}.` });
    }
    catch (err) {
        console.error("[Internal] Error updating KYC status:", err.message);
        res.status(500).json({ error: "Internal server error." });
    }
});
// POST /api/internal/users/:id/kyc-approved
// Kept separately because it also creates the bank account.
router.post("/users/:id/kyc-approved", async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        // Update user kyc_status
        await User_1.default.updateKycStatus(userId, "APPROVED");
        // Produce account if it doesn't already exist
        let account = await Account_1.default.findByUserId(userId);
        if (!account) {
            account = await Account_1.default.create(userId);
        }
        res.json({ message: "User KYC approved and account ready.", account });
    }
    catch (err) {
        console.error("[Internal] Error approving KYC:", err.message);
        res.status(500).json({ error: "Internal server error." });
    }
});
// GET /api/internal/users/:id/verification-status
router.get("/users/:id/verification-status", async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            res.status(400).json({ error: "Invalid user ID." });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        res.json({
            userId: user.id,
            phoneVerified: user.phone_verified,
            emailVerified: user.email_verified,
            fullyVerified: user.phone_verified && user.email_verified,
        });
    }
    catch (err) {
        console.error("[Internal] Error fetching verification status:", err.message);
        res.status(500).json({ error: "Internal server error." });
    }
});
// PUT /api/internal/users/:id/unlock
router.put("/users/:id/unlock", async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            res.status(400).json({ error: "Invalid user ID." });
            return;
        }
        await User_1.default.unlockAccount(userId);
        res.json({ message: "User account unlocked successfully." });
    }
    catch (err) {
        console.error("[Internal] Error unlocking account:", err.message);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.default = router;
