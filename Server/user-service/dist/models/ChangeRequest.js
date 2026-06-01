"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
// ─── Helpers ─────────────────────────────────────────────────
function generateRequestId() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `#REQ-${num}`;
}
// Map change_type to the actual user table column
const CHANGE_TYPE_TO_COLUMN = {
    FULL_NAME: ["first_name", "middle_name", "last_name"],
    PHONE_NUMBER: "phone_number",
    EMAIL_ADDRESS: "email",
    RESIDENTIAL_ADDRESS: "address",
};
// ─── Model ───────────────────────────────────────────────────
class ChangeRequest {
    // ── Create Tables (run once) ────────────────────────────────
    static async createTables() {
        await db_1.default.query(`
      CREATE TABLE IF NOT EXISTS change_requests (
        id SERIAL PRIMARY KEY,
        request_id VARCHAR(20) NOT NULL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        change_type VARCHAR(50) NOT NULL,
        current_value TEXT NOT NULL DEFAULT '',
        new_value TEXT NOT NULL DEFAULT '',
        status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
        documents JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS change_request_messages (
        id SERIAL PRIMARY KEY,
        request_id INTEGER NOT NULL REFERENCES change_requests(id) ON DELETE CASCADE,
        sender VARCHAR(20) NOT NULL,
        message TEXT NOT NULL DEFAULT '',
        documents JSONB DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_change_requests_user_id ON change_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_change_requests_status ON change_requests(status);
      CREATE INDEX IF NOT EXISTS idx_change_request_messages_request_id ON change_request_messages(request_id);
    `);
    }
    // ── Create ──────────────────────────────────────────────────
    static async create(input) {
        const requestId = generateRequestId();
        const { rows } = await db_1.default.query(`INSERT INTO change_requests (request_id, user_id, change_type, current_value, new_value, status, documents)
       VALUES ($1, $2, $3, $4, $5, 'SUBMITTED', $6::jsonb)
       RETURNING *`, [requestId, input.userId, input.changeType, input.currentValue, input.newValue, JSON.stringify(input.documents)]);
        // Add initial system message
        await ChangeRequest.addMessage(rows[0].id, "SYSTEM", "Your change request has been submitted and is now under review.");
        return rows[0];
    }
    // ── Find by User ────────────────────────────────────────────
    static async findByUserId(userId) {
        const { rows } = await db_1.default.query(`SELECT * FROM change_requests WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
        return rows;
    }
    // ── Find active by user and type ────────────────────────────
    static async findActiveByUserAndType(userId, changeType) {
        const { rows } = await db_1.default.query(`SELECT * FROM change_requests
       WHERE user_id = $1 AND change_type = $2 AND status NOT IN ('APPROVED', 'REJECTED')
       ORDER BY created_at DESC LIMIT 1`, [userId, changeType]);
        return rows[0] || null;
    }
    // ── Find by ID ──────────────────────────────────────────────
    static async findById(id) {
        const { rows } = await db_1.default.query(`SELECT * FROM change_requests WHERE id = $1`, [id]);
        return rows[0] || null;
    }
    // ── Find All (Admin) ───────────────────────────────────────
    static async findAll() {
        const { rows } = await db_1.default.query(`SELECT cr.*, u.first_name, u.middle_name, u.last_name, u.email, u.phone_number, u.profile_picture
       FROM change_requests cr
       JOIN users u ON cr.user_id = u.id
       ORDER BY
         CASE WHEN cr.status IN ('SUBMITTED', 'UNDER_REVIEW', 'WAITING_FOR_CUSTOMER') THEN 0 ELSE 1 END,
         cr.created_at DESC`);
        return rows;
    }
    // ── Update Status ──────────────────────────────────────────
    static async updateStatus(id, status) {
        const { rows } = await db_1.default.query(`UPDATE change_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [status, id]);
        return rows[0] || null;
    }
    // ── Add Documents ──────────────────────────────────────────
    static async addDocuments(id, newDocs) {
        const { rows } = await db_1.default.query(`UPDATE change_requests
       SET documents = documents || $1::jsonb, updated_at = NOW()
       WHERE id = $2 RETURNING *`, [JSON.stringify(newDocs), id]);
        return rows[0] || null;
    }
    // ── Messages ───────────────────────────────────────────────
    static async addMessage(requestId, sender, message, documents) {
        const { rows } = await db_1.default.query(`INSERT INTO change_request_messages (request_id, sender, message, documents)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING *`, [requestId, sender, message, documents ? JSON.stringify(documents) : null]);
        return rows[0];
    }
    static async getMessages(requestId) {
        const { rows } = await db_1.default.query(`SELECT * FROM change_request_messages WHERE request_id = $1 ORDER BY created_at ASC`, [requestId]);
        return rows;
    }
    // ── Apply Change (on approval) ─────────────────────────────
    static async applyChange(request) {
        const column = CHANGE_TYPE_TO_COLUMN[request.change_type];
        if (!column)
            return;
        if (Array.isArray(column)) {
            // FULL_NAME: newValue might be JSON or a simple string "First Last"
            let parsed = { firstName: "", middleName: "", lastName: "" };
            try {
                parsed = JSON.parse(request.new_value);
            }
            catch {
                const parts = request.new_value.trim().split(' ');
                parsed.firstName = parts[0] || '';
                parsed.lastName = parts.slice(1).join(' ') || '';
            }
            await db_1.default.query(`UPDATE users SET first_name = $1, middle_name = $2, last_name = $3, updated_at = NOW() WHERE id = $4`, [parsed.firstName, parsed.middleName || null, parsed.lastName, request.user_id]);
        }
        else {
            await db_1.default.query(`UPDATE users SET ${column} = $1, updated_at = NOW() WHERE id = $2`, [request.new_value, request.user_id]);
        }
    }
}
exports.default = ChangeRequest;
