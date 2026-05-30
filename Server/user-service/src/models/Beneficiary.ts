import pool from "../config/db";

export interface BeneficiaryRecord {
  id: number;
  user_id: number;
  type: string;
  name: string;
  account_number: string;
  bank_name?: string;
  swift_code?: string;
  address?: string;
  created_at: string;
}

export interface CreateBeneficiaryInput {
  userId: number;
  type: string;
  name: string;
  accountNumber: string;
  bankName?: string;
  swiftCode?: string;
  address?: string;
}

class Beneficiary {
  static async create(input: CreateBeneficiaryInput): Promise<BeneficiaryRecord> {
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
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByUserId(userId: number): Promise<BeneficiaryRecord[]> {
    const query = `
      SELECT * FROM beneficiaries
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const query = `
      DELETE FROM beneficiaries
      WHERE id = $1 AND user_id = $2
    `;
    const { rowCount } = await pool.query(query, [id, userId]);
    return (rowCount ?? 0) > 0;
  }
}

export default Beneficiary;
