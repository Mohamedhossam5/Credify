import pool from "../config/db";

export interface KycRecord {
  id: number;
  user_id: number;
  status: string;
  national_id_front: string | null;
  national_id_back: string | null;
  face_selfie: string | null;
  proof_of_address: string | null;
  face_match_score: number | null;
  face_match_passed: boolean | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

class KycApplication {
  static async findOrCreate(userId: number): Promise<KycRecord> {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    const { rows } = await pool.query(
      "INSERT INTO kyc_applications (user_id) VALUES ($1) RETURNING *",
      [userId]
    );
    return rows[0];
  }

  static async findByUserId(userId: number): Promise<KycRecord | null> {
    const { rows } = await pool.query(
      "SELECT * FROM kyc_applications WHERE user_id = $1",
      [userId]
    );
    return rows[0] || null;
  }

  static async findAll(): Promise<KycRecord[]> {
    const { rows } = await pool.query("SELECT * FROM kyc_applications ORDER BY created_at DESC");
    return rows;
  }

  static async uploadNationalId(userId: number, frontPath: string, backPath: string): Promise<KycRecord> {
    const { rows } = await pool.query(
      `UPDATE kyc_applications 
       SET national_id_front = $1, national_id_back = $2, updated_at = NOW()
       WHERE user_id = $3 RETURNING *`,
      [frontPath, backPath, userId]
    );
    return rows[0];
  }

  static async uploadFaceSelfie(userId: number, selfiePath: string): Promise<KycRecord> {
    const { rows } = await pool.query(
      `UPDATE kyc_applications 
       SET face_selfie = $1, updated_at = NOW()
       WHERE user_id = $2 RETURNING *`,
      [selfiePath, userId]
    );
    return rows[0];
  }

  static async uploadProofOfAddress(userId: number, proofPath: string): Promise<KycRecord> {
    const { rows } = await pool.query(
      `UPDATE kyc_applications 
       SET proof_of_address = $1, updated_at = NOW()
       WHERE user_id = $2 RETURNING *`,
      [proofPath, userId]
    );
    return rows[0];
  }

  static async updateStatus(userId: number, status: string, rejectionReason: string | null = null): Promise<KycRecord> {
    const { rows } = await pool.query(
      `UPDATE kyc_applications 
       SET status = $1, rejection_reason = $2, updated_at = NOW()
       WHERE user_id = $3 RETURNING *`,
      [status, rejectionReason, userId]
    );
    return rows[0];
  }

  static async updateFaceVerification(userId: number, score: number, passed: boolean): Promise<KycRecord> {
    const { rows } = await pool.query(
      `UPDATE kyc_applications 
       SET face_match_score = $1, face_match_passed = $2, updated_at = NOW()
       WHERE user_id = $3 RETURNING *`,
      [score, passed, userId]
    );
    return rows[0];
  }

  static async areDocumentsComplete(userId: number): Promise<boolean> {
    const app = await this.findByUserId(userId);
    if (!app) return false;
    return !!(app.national_id_front && app.national_id_back && app.face_selfie && app.proof_of_address);
  }

  static async deleteByUserId(userId: number): Promise<void> {
    await pool.query("DELETE FROM kyc_applications WHERE user_id = $1", [userId]);
  }
}

export default KycApplication;
