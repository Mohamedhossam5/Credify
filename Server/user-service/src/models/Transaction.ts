import pool from "../config/db";

export interface TransactionRecord {
  id: number;
  sender_id: number;
  sender_account_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  recipient_name: string;
  recipient_account: string;
  recipient_bank?: string;
  swift_code?: string;
  recipient_address?: string;
  reference?: string;
  created_at: string;
}

export interface CreateTransactionInput {
  senderId: number;
  senderAccountId: string;
  type: string;
  amount: number;
  recipientName: string;
  recipientAccount: string;
  recipientBank?: string;
  swiftCode?: string;
  recipientAddress?: string;
  reference?: string;
}

class Transaction {
  static async create(input: CreateTransactionInput): Promise<TransactionRecord> {
    const query = `
      INSERT INTO transactions (
        sender_id, sender_account_id, type, amount, 
        recipient_name, recipient_account, recipient_bank, 
        swift_code, recipient_address, reference
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      input.senderId, input.senderAccountId, input.type, input.amount,
      input.recipientName, input.recipientAccount, input.recipientBank || null,
      input.swiftCode || null, input.recipientAddress || null, input.reference || null
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByUserIdAndAccount(userId: number, accountId?: string, limit?: number): Promise<any[]> {
    let query = `
      SELECT t.*, u.first_name as sender_first_name, u.last_name as sender_last_name, u.email as sender_email 
      FROM transactions t
      LEFT JOIN users u ON t.sender_id = u.id
      WHERE t.sender_id = $1
    `;
    const values: any[] = [userId];

    if (accountId) {
      query += " OR t.recipient_account = $2";
      values.push(accountId);
    }
    
    query += " ORDER BY t.created_at DESC";

    if (limit) {
      query += ` LIMIT $${values.length + 1}`;
      values.push(limit);
    }

    const { rows } = await pool.query(query, values);
    return rows;
  }

  static async findAll(limit?: number): Promise<any[]> {
    let query = `
      SELECT t.*, u.first_name as sender_first_name, u.last_name as sender_last_name, u.email as sender_email 
      FROM transactions t
      LEFT JOIN users u ON t.sender_id = u.id
      ORDER BY t.created_at DESC
    `;
    const values: any[] = [];
    if (limit) {
      query += " LIMIT $1";
      values.push(limit);
    }
    const { rows } = await pool.query(query, values);
    return rows;
  }
}

export default Transaction;
