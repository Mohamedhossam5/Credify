"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
class Card {
    // ─── Helpers ────────────────────────────────────────────────
    /** Generate a realistic 16-digit card number starting with 5270 (Credify prefix) */
    static generateCardNumber() {
        const prefix = "5270";
        let number = prefix;
        for (let i = 0; i < 12; i++) {
            number += Math.floor(Math.random() * 10).toString();
        }
        return number;
    }
    /** Generate a 3-digit CVV */
    static generateCvv() {
        return Math.floor(100 + Math.random() * 900).toString();
    }
    /** Mask card number: **** **** **** 1234 */
    static maskCardNumber(cardNumber) {
        return "**** **** **** " + cardNumber.slice(-4);
    }
    /** Strip CVV and mask card number for API responses */
    static toSafe(card) {
        return {
            id: card.id,
            user_id: card.user_id,
            card_type: card.card_type,
            card_number_masked: Card.maskCardNumber(card.card_number),
            last_four: card.last_four,
            expiry_month: card.expiry_month,
            expiry_year: card.expiry_year,
            cardholder_name: card.cardholder_name,
            status: card.status,
            prepaid_balance: card.prepaid_balance,
            linked_account_id: card.linked_account_id,
            daily_limit: card.daily_limit,
            created_at: card.created_at,
            updated_at: card.updated_at,
        };
    }
    // ─── CRUD ───────────────────────────────────────────────────
    static async create(userId, cardType, cardholderName, linkedAccountId, dailyLimit = 10000) {
        const cardNumber = Card.generateCardNumber();
        const lastFour = cardNumber.slice(-4);
        const cvv = Card.generateCvv();
        // Expiry: 5 years from now
        const now = new Date();
        const expiryMonth = now.getMonth() + 1; // 1-12
        const expiryYear = now.getFullYear() + 5;
        const { rows } = await db_1.default.query(`INSERT INTO cards (
        user_id, card_type, card_number, last_four, expiry_month, expiry_year,
        cvv, cardholder_name, status, prepaid_balance, linked_account_id, daily_limit
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`, [
            userId, cardType, cardNumber, lastFour, expiryMonth, expiryYear,
            cvv, cardholderName, "ACTIVE", 0.00, linkedAccountId, dailyLimit,
        ]);
        return rows[0];
    }
    static async findById(cardId) {
        const { rows } = await db_1.default.query("SELECT * FROM cards WHERE id = $1", [cardId]);
        return rows[0] || null;
    }
    static async findByUserId(userId) {
        const { rows } = await db_1.default.query("SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        return rows;
    }
    static async findActiveByUserIdAndType(userId, cardType) {
        const { rows } = await db_1.default.query("SELECT * FROM cards WHERE user_id = $1 AND card_type = $2 AND status != 'CANCELLED'", [userId, cardType]);
        return rows;
    }
    // ─── Status management ──────────────────────────────────────
    static async updateStatus(cardId, status) {
        const { rows } = await db_1.default.query("UPDATE cards SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [status, cardId]);
        return rows[0] || null;
    }
    static async updateDailyLimit(cardId, limit) {
        const { rows } = await db_1.default.query("UPDATE cards SET daily_limit = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [limit, cardId]);
        return rows[0] || null;
    }
    // ─── Prepaid balance operations ─────────────────────────────
    /**
     * Load funds from the user's main account into a prepaid card.
     * Uses a DB transaction to ensure atomicity.
     */
    static async loadPrepaid(userId, cardId, amount) {
        const client = await db_1.default.connect();
        try {
            await client.query("BEGIN");
            // Lock the user's main account
            const accountRes = await client.query("SELECT * FROM accounts WHERE user_id = $1 FOR UPDATE", [userId]);
            if (accountRes.rows.length === 0) {
                throw new Error("Main account not found.");
            }
            const account = accountRes.rows[0];
            if (parseFloat(account.balance) < amount) {
                throw new Error("Insufficient balance in main account.");
            }
            // Lock the prepaid card
            const cardRes = await client.query("SELECT * FROM cards WHERE id = $1 AND user_id = $2 AND card_type = 'PREPAID' AND status = 'ACTIVE' FOR UPDATE", [cardId, userId]);
            if (cardRes.rows.length === 0) {
                throw new Error("Prepaid card not found or is not active.");
            }
            // Deduct from main account
            await client.query("UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2", [amount, account.id]);
            // Credit to prepaid card
            await client.query("UPDATE cards SET prepaid_balance = prepaid_balance + $1, updated_at = NOW() WHERE id = $2", [amount, cardId]);
            await client.query("COMMIT");
            // Fetch updated balances
            const updatedAccount = await db_1.default.query("SELECT balance FROM accounts WHERE id = $1", [account.id]);
            const updatedCard = await db_1.default.query("SELECT prepaid_balance FROM cards WHERE id = $1", [cardId]);
            return {
                success: true,
                newPrepaidBalance: parseFloat(updatedCard.rows[0].prepaid_balance),
                newAccountBalance: parseFloat(updatedAccount.rows[0].balance),
            };
        }
        catch (e) {
            await client.query("ROLLBACK");
            return { success: false, error: e.message };
        }
        finally {
            client.release();
        }
    }
    /**
     * Unload / withdraw funds from a prepaid card back to the user's main account.
     */
    static async unloadPrepaid(userId, cardId, amount) {
        const client = await db_1.default.connect();
        try {
            await client.query("BEGIN");
            // Lock the prepaid card
            const cardRes = await client.query("SELECT * FROM cards WHERE id = $1 AND user_id = $2 AND card_type = 'PREPAID' AND status = 'ACTIVE' FOR UPDATE", [cardId, userId]);
            if (cardRes.rows.length === 0) {
                throw new Error("Prepaid card not found or is not active.");
            }
            const card = cardRes.rows[0];
            if (parseFloat(card.prepaid_balance) < amount) {
                throw new Error("Insufficient prepaid card balance.");
            }
            // Lock the user's main account
            const accountRes = await client.query("SELECT * FROM accounts WHERE user_id = $1 FOR UPDATE", [userId]);
            if (accountRes.rows.length === 0) {
                throw new Error("Main account not found.");
            }
            // Deduct from prepaid card
            await client.query("UPDATE cards SET prepaid_balance = prepaid_balance - $1, updated_at = NOW() WHERE id = $2", [amount, cardId]);
            // Credit to main account
            await client.query("UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2", [amount, accountRes.rows[0].id]);
            await client.query("COMMIT");
            // Fetch updated balances
            const updatedAccount = await db_1.default.query("SELECT balance FROM accounts WHERE id = $1", [accountRes.rows[0].id]);
            const updatedCard = await db_1.default.query("SELECT prepaid_balance FROM cards WHERE id = $1", [cardId]);
            return {
                success: true,
                newPrepaidBalance: parseFloat(updatedCard.rows[0].prepaid_balance),
                newAccountBalance: parseFloat(updatedAccount.rows[0].balance),
            };
        }
        catch (e) {
            await client.query("ROLLBACK");
            return { success: false, error: e.message };
        }
        finally {
            client.release();
        }
    }
    /**
     * Transfer funds between two prepaid cards owned by the same user.
     */
    static async transferBetweenPrepaid(userId, fromCardId, toCardId, amount) {
        const client = await db_1.default.connect();
        try {
            await client.query("BEGIN");
            // Lock both cards (order by ID to prevent deadlock)
            const [firstId, secondId] = fromCardId < toCardId ? [fromCardId, toCardId] : [toCardId, fromCardId];
            const firstRes = await client.query("SELECT * FROM cards WHERE id = $1 AND user_id = $2 AND card_type = 'PREPAID' AND status = 'ACTIVE' FOR UPDATE", [firstId, userId]);
            const secondRes = await client.query("SELECT * FROM cards WHERE id = $1 AND user_id = $2 AND card_type = 'PREPAID' AND status = 'ACTIVE' FOR UPDATE", [secondId, userId]);
            if (firstRes.rows.length === 0 || secondRes.rows.length === 0) {
                throw new Error("One or both prepaid cards not found or not active.");
            }
            // Find the source card
            const sourceCard = fromCardId === firstId ? firstRes.rows[0] : secondRes.rows[0];
            if (parseFloat(sourceCard.prepaid_balance) < amount) {
                throw new Error("Insufficient balance on source prepaid card.");
            }
            // Execute transfer
            await client.query("UPDATE cards SET prepaid_balance = prepaid_balance - $1, updated_at = NOW() WHERE id = $2", [amount, fromCardId]);
            await client.query("UPDATE cards SET prepaid_balance = prepaid_balance + $1, updated_at = NOW() WHERE id = $2", [amount, toCardId]);
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
exports.default = Card;
