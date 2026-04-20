import pool from "../config/db";

export interface AccountRecord {
  id: number;
  user_id: number;
  account_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

class Account {
  static async create(userId: number): Promise<AccountRecord> {
    const accountId = 'CRD' + Math.floor(100000000 + Math.random() * 900000000).toString(); // CRD + 9 random digits

    const { rows } = await pool.query(
      "INSERT INTO accounts (user_id, account_id) VALUES ($1, $2) RETURNING *",
      [userId, accountId]
    );
    return rows[0];
  }

  static async findByUserId(userId: number): Promise<AccountRecord | null> {
    const { rows } = await pool.query(
      "SELECT * FROM accounts WHERE user_id = $1",
      [userId]
    );
    return rows[0] || null;
  }

  static async transferFunds(senderUserId: number, amount: number, receiverAccountId?: string): Promise<{ success: boolean; error?: string }> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Verify sender and lock row
      const senderRes = await client.query(
        "SELECT * FROM accounts WHERE user_id = $1 FOR UPDATE",
        [senderUserId]
      );
      if (senderRes.rows.length === 0) {
        throw new Error("Sender account not found.");
      }
      const senderAccount = senderRes.rows[0];

      if (parseFloat(senderAccount.balance) < amount) {
        throw new Error("Insufficient balance.");
      }

      // Deduct from sender
      await client.query(
        "UPDATE accounts SET balance = balance - $1 WHERE id = $2",
        [amount, senderAccount.id]
      );

      // Add to receiver if it's an internal transfer and receiver exists
      if (receiverAccountId) {
        const receiverRes = await client.query(
          "SELECT * FROM accounts WHERE account_id = $1 FOR UPDATE",
          [receiverAccountId]
        );
        if (receiverRes.rows.length === 0) {
          throw new Error("Recipient account not found in system.");
        }
        await client.query(
          "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
          [amount, receiverRes.rows[0].id]
        );
      }

      await client.query("COMMIT");
      return { success: true };
    } catch (e: any) {
      await client.query("ROLLBACK");
      return { success: false, error: e.message };
    } finally {
      client.release();
    }
  }
}

export default Account;
