"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.generateToken = generateToken;
exports.requireActiveUser = requireActiveUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Access denied. No token provided." });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid or expired token." });
    }
}
function generateToken(user) {
    const payload = { id: user.id, email: user.email };
    const options = { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
}
async function requireActiveUser(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: "Access denied." });
        return;
    }
    try {
        const user = await User_1.default.findById(req.user.id);
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        if (user.is_frozen) {
            res.status(403).json({ error: "Your account is frozen. You cannot perform this action." });
            return;
        }
        next();
    }
    catch (err) {
        console.error("[requireActiveUser] Error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
}
