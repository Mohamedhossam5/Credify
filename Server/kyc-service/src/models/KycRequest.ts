import pool from "../config/db";

export interface KycAdditionalRequest {
  id: number;
  user_id: number;
  message: string;
  status: string;
  document_file: string | null;
  created_at: string;
}

class KycRequest {
  static async create(userId: number, message: string): Promise<KycAdditionalRequest> {
    const { rows } = await pool.query(
      "INSERT INTO kyc_additional_requests (user_id, message) VALUES ($1, $2) RETURNING *",
      [userId, message]
    );
    return rows[0];
  }

  static async findPendingByUserId(userId: number): Promise<KycAdditionalRequest[]> {
    const { rows } = await pool.query(
      "SELECT * FROM kyc_additional_requests WHERE user_id = $1 AND status = 'PENDING' ORDER BY created_at DESC",
      [userId]
    );
    return rows;
  }

  static async findAllByUserId(userId: number): Promise<KycAdditionalRequest[]> {
    const { rows } = await pool.query(
      "SELECT * FROM kyc_additional_requests WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return rows;
  }

  static async findAllUploaded(): Promise<KycAdditionalRequest[]> {
    const { rows } = await pool.query(
      "SELECT * FROM kyc_additional_requests WHERE status = 'UPLOADED' ORDER BY created_at DESC"
    );
    return rows;
  }

  static async uploadDocument(requestId: number, documentPath: string): Promise<KycAdditionalRequest> {
    const { rows } = await pool.query(
      `UPDATE kyc_additional_requests 
       SET document_file = $1, status = 'UPLOADED'
       WHERE id = $2 RETURNING *`,
      [documentPath, requestId]
    );
    return rows[0];
  }

  static async deleteByUserId(userId: number): Promise<void> {
    await pool.query("DELETE FROM kyc_additional_requests WHERE user_id = $1", [userId]);
  }
}

export default KycRequest;
