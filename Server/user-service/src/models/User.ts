import pool from "../config/db";

export interface UserRecord {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash?: string;
  id_number: string;
  birthdate: string;
  address: string | null;
  kyc_status: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  idNumber: string;
  birthdate: string;
  address: string | null;
}

class User {
  static async create(input: CreateUserInput): Promise<UserRecord> {
    const query = `
      INSERT INTO users (first_name, last_name, email, password_hash, id_number, birthdate, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, first_name, last_name, email, id_number, birthdate, address, kyc_status, role, created_at
    `;
    const values = [
      input.firstName, input.lastName, input.email,
      input.passwordHash, input.idNumber, input.birthdate, input.address,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(email: string): Promise<UserRecord | null> {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] || null;
  }

  static async findById(id: number): Promise<UserRecord | null> {
    const { rows } = await pool.query(
      "SELECT id, first_name, last_name, email, id_number, birthdate, address, kyc_status, role, created_at FROM users WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  }

  static async findAll(): Promise<any[]> {
    const { rows } = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.id_number, u.birthdate, u.address, u.kyc_status, u.role, u.created_at,
             a.account_id, a.balance
      FROM users u
      LEFT JOIN accounts a ON u.id = a.user_id
      ORDER BY u.created_at DESC
    `);
    return rows;
  }

  static async updateKycStatus(userId: number, status: string): Promise<UserRecord | null> {
    const { rows } = await pool.query(
      "UPDATE users SET kyc_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, userId]
    );
    return rows[0] || null;
  }
}

export default User;
