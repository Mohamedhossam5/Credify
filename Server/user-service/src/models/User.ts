import pool from "../config/db";

export interface UserRecord {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  password_hash?: string;
  phone_number: string;
  gender: string;
  id_number: string;
  birthdate: string;
  address: string | null;
  phone_verified: boolean;
  email_verified: boolean;
  kyc_status: string;
  role: string;
  created_at: string;
  updated_at: string;
  failed_login_attempts: number;
  is_locked: boolean;
}

interface CreateUserInput {
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  gender: string;
  idNumber: string;
  birthdate: string;
  address: string | null;
}

class User {
  static async create(input: CreateUserInput): Promise<UserRecord> {
    const query = `
      INSERT INTO users (first_name, middle_name, last_name, email, password_hash, phone_number, gender, id_number, birthdate, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, first_name, middle_name, last_name, email, phone_number, gender, id_number, birthdate, address, kyc_status, role, created_at, failed_login_attempts, is_locked
    `;
    const values = [
      input.firstName, input.middleName || null, input.lastName, input.email,
      input.passwordHash, input.phoneNumber, input.gender, input.idNumber,
      input.birthdate, input.address,
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
      "SELECT id, first_name, middle_name, last_name, email, phone_number, gender, id_number, birthdate, address, phone_verified, email_verified, kyc_status, role, created_at, failed_login_attempts, is_locked FROM users WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  }

  static async findAll(): Promise<any[]> {
    const { rows } = await pool.query(`
      SELECT u.id, u.first_name, u.middle_name, u.last_name, u.email, u.phone_number, u.gender, u.id_number, u.birthdate, u.address, u.kyc_status, u.role, u.created_at, u.is_locked, u.failed_login_attempts,
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

  static async updatePhoneVerified(userId: number): Promise<UserRecord | null> {
    const { rows } = await pool.query(
      "UPDATE users SET phone_verified = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *",
      [userId]
    );
    return rows[0] || null;
  }

  static async updateEmailVerified(userId: number): Promise<UserRecord | null> {
    const { rows } = await pool.query(
      "UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *",
      [userId]
    );
    return rows[0] || null;
  }

  static async findByPhoneNumber(phone: string): Promise<UserRecord | null> {
    const { rows } = await pool.query("SELECT * FROM users WHERE phone_number = $1", [phone]);
    return rows[0] || null;
  }

  static async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [passwordHash, userId]
    );
  }

  static async incrementFailedLogins(userId: number): Promise<void> {
    await pool.query(
      "UPDATE users SET failed_login_attempts = failed_login_attempts + 1, updated_at = NOW() WHERE id = $1",
      [userId]
    );
  }

  static async resetFailedLogins(userId: number): Promise<void> {
    await pool.query(
      "UPDATE users SET failed_login_attempts = 0, is_locked = false, updated_at = NOW() WHERE id = $1",
      [userId]
    );
  }

  static async lockAccount(userId: number): Promise<void> {
    await pool.query(
      "UPDATE users SET is_locked = true, updated_at = NOW() WHERE id = $1",
      [userId]
    );
  }

  static async unlockAccount(userId: number): Promise<void> {
    await pool.query(
      "UPDATE users SET is_locked = false, failed_login_attempts = 0, updated_at = NOW() WHERE id = $1",
      [userId]
    );
  }
}

export default User;
