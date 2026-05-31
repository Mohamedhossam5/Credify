"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
class Beneficiary {
    static async create(input) {
        const query = `
      INSERT INTO beneficiaries (
        user_id, type, name, account_number, bank_name, swift_code, address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, account_number) DO UPDATE
      SET name = EXCLUDED.name, 
          type = EXCLUDED.type, 
          bank_name = EXCLUDED.bank_name, 
          swift_code = EXCLUDED.swift_code, 
          address = EXCLUDED.address
      RETURNING *
    `;
        const values = [
            input.userId,
            input.type,
            input.name,
            input.accountNumber,
            input.bankName || null,
            input.swiftCode || null,
            input.address || null
        ];
        const { rows } = await db_1.default.query(query, values);
        return rows[0];
    }
    static async findByUserId(userId) {
        const query = `
      SELECT * FROM beneficiaries
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
        const { rows } = await db_1.default.query(query, [userId]);
        return rows;
    }
    static async delete(id, userId) {
        const query = `
      DELETE FROM beneficiaries
      WHERE id = $1 AND user_id = $2
    `;
        const { rowCount } = await db_1.default.query(query, [id, userId]);
        return (rowCount ?? 0) > 0;
    }
}
exports.default = Beneficiary;
