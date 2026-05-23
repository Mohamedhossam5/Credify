"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
class Account {
    static async create(userId) {
        const accountId = 'CRD' + Math.floor(100000000 + Math.random() * 900000000).toString(); // CRD + 9 random digits
        const { rows } = await db_1.default.query("INSERT INTO accounts (user_id, account_id) VALUES ($1, $2) RETURNING *", [userId, accountId]);
        return rows[0];
    }
    static async findByUserId(userId) {
        const { rows } = await db_1.default.query("SELECT * FROM accounts WHERE user_id = $1", [userId]);
        return rows[0] || null;
    }
    static async transferFunds(senderUserId, amount, receiverAccountId, fee = 0) {
        const client = await db_1.default.connect();
        try {
            await client.query("BEGIN");
            // Verify sender and lock row
            const senderRes = await client.query("SELECT * FROM accounts WHERE user_id = $1 FOR UPDATE", [senderUserId]);
            if (senderRes.rows.length === 0) {
                throw new Error("Sender account not found.");
            }
            const senderAccount = senderRes.rows[0];
            const totalDebit = amount + fee;
            if (parseFloat(senderAccount.balance) < totalDebit) {
                throw new Error("Insufficient balance.");
            }
            // Deduct amount + fee from sender
            await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [totalDebit, senderAccount.id]);
            // Add to receiver if it's an internal transfer and receiver exists
            if (receiverAccountId) {
                const receiverRes = await client.query("SELECT * FROM accounts WHERE account_id = $1 FOR UPDATE", [receiverAccountId]);
                if (receiverRes.rows.length === 0) {
                    throw new Error("Recipient account not found in system.");
                }
                await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, receiverRes.rows[0].id]);
            }
            await client.query("COMMIT");
            return { success: true };
        }
        catch (e) {
            await client.query("ROLLBACK");
            return { success: false, error: e.message };
        }
        finally {
            client.release();
        }
    }
}
exports.default = Account;
