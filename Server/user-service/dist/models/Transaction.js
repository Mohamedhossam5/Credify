"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
class Transaction {
    static async create(input) {
        const query = `
      INSERT INTO transactions (
        sender_id, sender_account_id, type, amount, fee,
        recipient_name, recipient_account, recipient_bank, 
        swift_code, recipient_address, reference
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
        const values = [
            input.senderId, input.senderAccountId, input.type, input.amount,
            input.fee ?? 0,
            input.recipientName, input.recipientAccount, input.recipientBank || null,
            input.swiftCode || null, input.recipientAddress || null, input.reference || null
        ];
        const { rows } = await db_1.default.query(query, values);
        return rows[0];
    }
    static async findByUserIdAndAccount(userId, accountId, limit) {
        let query = `
      SELECT t.*, u.first_name as sender_first_name, u.last_name as sender_last_name, u.email as sender_email 
      FROM transactions t
      LEFT JOIN users u ON t.sender_id = u.id
      WHERE t.sender_id = $1
    `;
        const values = [userId];
        if (accountId) {
            query += " OR t.recipient_account = $2";
            values.push(accountId);
        }
        query += " ORDER BY t.created_at DESC";
        if (limit) {
            query += ` LIMIT $${values.length + 1}`;
            values.push(limit);
        }
        const { rows } = await db_1.default.query(query, values);
        return rows;
    }
    static async findAll(limit) {
        let query = `
      SELECT t.*, u.first_name as sender_first_name, u.last_name as sender_last_name, u.email as sender_email 
      FROM transactions t
      LEFT JOIN users u ON t.sender_id = u.id
      ORDER BY t.created_at DESC
    `;
        const values = [];
        if (limit) {
            query += " LIMIT $1";
            values.push(limit);
        }
        const { rows } = await db_1.default.query(query, values);
        return rows;
    }
}
exports.default = Transaction;
