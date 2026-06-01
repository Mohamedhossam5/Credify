"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
class User {
    static async create(input) {
        const query = `
      INSERT INTO users (first_name, middle_name, last_name, email, password_hash, phone_number, gender, id_number, birthdate, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, first_name, middle_name, last_name, email, phone_number, gender, id_number, birthdate, address, kyc_status, role, profile_picture, created_at, failed_login_attempts, is_locked
    `;
        const values = [
            input.firstName, input.middleName || null, input.lastName, input.email,
            input.passwordHash, input.phoneNumber, input.gender, input.idNumber,
            input.birthdate, input.address,
        ];
        const { rows } = await db_1.default.query(query, values);
        return rows[0];
    }
    static async findByEmail(email) {
        const { rows } = await db_1.default.query("SELECT * FROM users WHERE email = $1", [email]);
        return rows[0] || null;
    }
    static async findById(id) {
        const { rows } = await db_1.default.query("SELECT id, first_name, middle_name, last_name, email, phone_number, gender, id_number, birthdate, address, phone_verified, email_verified, kyc_status, role, profile_picture, created_at, failed_login_attempts, is_locked, is_frozen FROM users WHERE id = $1", [id]);
        return rows[0] || null;
    }
    static async findAll() {
        const { rows } = await db_1.default.query(`
      SELECT u.id, u.first_name, u.middle_name, u.last_name, u.email, u.phone_number, u.gender, u.id_number, u.birthdate, u.address, u.phone_verified, u.email_verified, u.kyc_status, u.role, u.profile_picture, u.created_at, u.is_locked, u.is_frozen, u.failed_login_attempts,
             a.account_id, a.balance
      FROM users u
      LEFT JOIN accounts a ON u.id = a.user_id
      ORDER BY u.created_at DESC
    `);
        return rows;
    }
    static async updateKycStatus(userId, status) {
        const { rows } = await db_1.default.query("UPDATE users SET kyc_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [status, userId]);
        return rows[0] || null;
    }
    static async updatePhoneVerified(userId) {
        const { rows } = await db_1.default.query("UPDATE users SET phone_verified = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *", [userId]);
        return rows[0] || null;
    }
    static async updateEmailVerified(userId) {
        const { rows } = await db_1.default.query("UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *", [userId]);
        return rows[0] || null;
    }
    static async findByPhoneNumber(phone) {
        const { rows } = await db_1.default.query("SELECT * FROM users WHERE phone_number = $1", [phone]);
        return rows[0] || null;
    }
    static async updatePassword(userId, passwordHash) {
        await db_1.default.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [passwordHash, userId]);
    }
    static async incrementFailedLogins(userId) {
        await db_1.default.query("UPDATE users SET failed_login_attempts = failed_login_attempts + 1, updated_at = NOW() WHERE id = $1", [userId]);
    }
    static async resetFailedLogins(userId) {
        await db_1.default.query("UPDATE users SET failed_login_attempts = 0, is_locked = false, updated_at = NOW() WHERE id = $1", [userId]);
    }
    static async lockAccount(userId) {
        await db_1.default.query("UPDATE users SET is_locked = true, updated_at = NOW() WHERE id = $1", [userId]);
    }
    static async unlockAccount(userId) {
        await db_1.default.query("UPDATE users SET is_locked = false, failed_login_attempts = 0, updated_at = NOW() WHERE id = $1", [userId]);
    }
    static async freezeAccount(userId) {
        await db_1.default.query("UPDATE users SET is_frozen = true, updated_at = NOW() WHERE id = $1", [userId]);
    }
    static async unfreezeAccount(userId) {
        await db_1.default.query("UPDATE users SET is_frozen = false, updated_at = NOW() WHERE id = $1", [userId]);
    }
    static async updateProfilePicture(userId, base64Image) {
        const { rows } = await db_1.default.query("UPDATE users SET profile_picture = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [base64Image, userId]);
        return rows[0] || null;
    }
}
exports.default = User;
