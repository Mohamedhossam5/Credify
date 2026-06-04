import pool from "../config/db";

// ─── Types ───────────────────────────────────────────────────

export interface ChangeRequestRecord {
  id: number;
  request_id: string;
  user_id: number;
  change_type: string;
  current_value: string;
  new_value: string;
  status: string;
  documents: any[];
  created_at: string;
  updated_at: string;
}

export interface ChangeRequestMessageRecord {
  id: number;
  request_id: number;
  sender: string;
  message: string;
  documents: any[] | null;
  created_at: string;
}

export interface ChangeRequestWithUser extends ChangeRequestRecord {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  phone_number: string;
  profile_picture: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────

function generateRequestId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `#REQ-${num}`;
}

// Map change_type to the actual user table column
const CHANGE_TYPE_TO_COLUMN: Record<string, string | string[]> = {
  FULL_NAME: ["first_name", "middle_name", "last_name"],
  PHONE_NUMBER: "phone_number",
  EMAIL_ADDRESS: "email",
  RESIDENTIAL_ADDRESS: "address",
};

// ─── Model ───────────────────────────────────────────────────

class ChangeRequest {
  // ── Create Tables (run once) ────────────────────────────────
  static async createTables(): Promise<void> {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS change_requests (
        id SERIAL PRIMARY KEY,
        request_id VARCHAR(20) NOT NULL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        change_type VARCHAR(50) NOT NULL,
        current_value TEXT NOT NULL DEFAULT '',
        new_value TEXT NOT NULL DEFAULT '',
        status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
        documents JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS change_request_messages (
        id SERIAL PRIMARY KEY,
        request_id INTEGER NOT NULL REFERENCES change_requests(id) ON DELETE CASCADE,
        sender VARCHAR(20) NOT NULL,
        message TEXT NOT NULL DEFAULT '',
        documents JSONB DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_change_requests_user_id ON change_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_change_requests_status ON change_requests(status);
      CREATE INDEX IF NOT EXISTS idx_change_request_messages_request_id ON change_request_messages(request_id);
    `);
  }

  // ── Create ──────────────────────────────────────────────────
  static async create(input: {
    userId: number;
    changeType: string;
    currentValue: string;
    newValue: string;
    documents: any[];
  }): Promise<ChangeRequestRecord> {
    const requestId = generateRequestId();
    const { rows } = await pool.query(
      `INSERT INTO change_requests (request_id, user_id, change_type, current_value, new_value, status, documents)
       VALUES ($1, $2, $3, $4, $5, 'SUBMITTED', $6::jsonb)
       RETURNING *`,
      [requestId, input.userId, input.changeType, input.currentValue, input.newValue, JSON.stringify(input.documents)]
    );

    // Add initial system message
    await ChangeRequest.addMessage(rows[0].id, "SYSTEM", "Your change request has been submitted and is now under review.");

    return rows[0];
  }

  // ── Find by User ────────────────────────────────────────────
  static async findByUserId(userId: number): Promise<(ChangeRequestRecord & { admin_response?: string })[]> {
    const { rows } = await pool.query(
      `SELECT cr.*, 
              (SELECT message FROM change_request_messages crm 
               WHERE crm.request_id = cr.id AND sender IN ('ADMIN', 'SYSTEM')
               ORDER BY created_at DESC LIMIT 1) as admin_response
       FROM change_requests cr 
       WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }

  // ── Find active by user and type ────────────────────────────
  static async findActiveByUserAndType(userId: number, changeType: string): Promise<ChangeRequestRecord | null> {
    const { rows } = await pool.query(
      `SELECT * FROM change_requests
       WHERE user_id = $1 AND change_type = $2 AND status NOT IN ('APPROVED', 'REJECTED')
       ORDER BY created_at DESC LIMIT 1`,
      [userId, changeType]
    );
    return rows[0] || null;
  }

  // ── Find by ID ──────────────────────────────────────────────
  static async findById(id: number): Promise<ChangeRequestRecord | null> {
    const { rows } = await pool.query(
      `SELECT * FROM change_requests WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  // ── Find All (Admin) ───────────────────────────────────────
  static async findAll(): Promise<ChangeRequestWithUser[]> {
    const { rows } = await pool.query(
      `SELECT cr.*, u.first_name, u.middle_name, u.last_name, u.email, u.phone_number, u.profile_picture
       FROM change_requests cr
       JOIN users u ON cr.user_id = u.id
       ORDER BY
         CASE WHEN cr.status IN ('SUBMITTED', 'UNDER_REVIEW', 'WAITING_FOR_CUSTOMER') THEN 0 ELSE 1 END,
         cr.created_at DESC`
    );
    return rows;
  }

  // ── Update Status ──────────────────────────────────────────
  static async updateStatus(id: number, status: string): Promise<ChangeRequestRecord | null> {
    const { rows } = await pool.query(
      `UPDATE change_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return rows[0] || null;
  }

  // ── Add Documents ──────────────────────────────────────────
  static async addDocuments(id: number, newDocs: any[]): Promise<ChangeRequestRecord | null> {
    const { rows } = await pool.query(
      `UPDATE change_requests
       SET documents = documents || $1::jsonb, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [JSON.stringify(newDocs), id]
    );
    return rows[0] || null;
  }

  // ── Messages ───────────────────────────────────────────────
  static async addMessage(
    requestId: number,
    sender: string,
    message: string,
    documents?: any[]
  ): Promise<ChangeRequestMessageRecord> {
    const { rows } = await pool.query(
      `INSERT INTO change_request_messages (request_id, sender, message, documents)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING *`,
      [requestId, sender, message, documents ? JSON.stringify(documents) : null]
    );
    return rows[0];
  }

  static async getMessages(requestId: number): Promise<ChangeRequestMessageRecord[]> {
    const { rows } = await pool.query(
      `SELECT * FROM change_request_messages WHERE request_id = $1 ORDER BY created_at ASC`,
      [requestId]
    );
    return rows;
  }

  // ── Apply Change (on approval) ─────────────────────────────
  static async applyChange(request: ChangeRequestRecord): Promise<void> {
    const column = CHANGE_TYPE_TO_COLUMN[request.change_type];
    if (!column) return;

    if (Array.isArray(column)) {
      // FULL_NAME: newValue might be JSON or a simple string "First Last"
      let parsed = { firstName: "", middleName: "", lastName: "" };
      try {
        parsed = JSON.parse(request.new_value);
      } catch {
        const parts = request.new_value.trim().split(' ');
        parsed.firstName = parts[0] || '';
        parsed.lastName = parts.slice(1).join(' ') || '';
      }
      
      await pool.query(
        `UPDATE users SET first_name = $1, middle_name = $2, last_name = $3, updated_at = NOW() WHERE id = $4`,
        [parsed.firstName, parsed.middleName || null, parsed.lastName, request.user_id]
      );
    } else {
      await pool.query(
        `UPDATE users SET ${column} = $1, updated_at = NOW() WHERE id = $2`,
        [request.new_value, request.user_id]
      );
    }
  }
}

export default ChangeRequest;
