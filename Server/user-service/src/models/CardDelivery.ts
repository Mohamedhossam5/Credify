import pool from "../config/db";

export type DeliveryStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";

export interface CardDeliveryRecord {
  id: number;
  card_id: number;
  user_id: number;
  delivery_address: string;
  city: string;
  postal_code: string;
  contact_phone: string;
  status: DeliveryStatus;
  notes: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
}

class CardDelivery {
  static async create(
    cardId: number,
    userId: number,
    deliveryAddress: string,
    city: string,
    postalCode: string,
    contactPhone: string,
    notes?: string
  ): Promise<CardDeliveryRecord> {
    // Estimated delivery: 5–7 business days from now
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 7);

    const { rows } = await pool.query(
      `INSERT INTO card_deliveries (
        card_id, user_id, delivery_address, city, postal_code,
        contact_phone, status, notes, estimated_delivery
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        cardId, userId, deliveryAddress, city, postalCode,
        contactPhone, "PENDING", notes || null, estimatedDate.toISOString(),
      ]
    );
    return rows[0];
  }

  static async findByCardId(cardId: number): Promise<CardDeliveryRecord | null> {
    const { rows } = await pool.query(
      "SELECT * FROM card_deliveries WHERE card_id = $1 ORDER BY created_at DESC LIMIT 1",
      [cardId]
    );
    return rows[0] || null;
  }

  static async findAllByUserId(userId: number): Promise<CardDeliveryRecord[]> {
    const { rows } = await pool.query(
      `SELECT cd.*, c.card_type, c.last_four
       FROM card_deliveries cd
       JOIN cards c ON cd.card_id = c.id
       WHERE cd.user_id = $1
       ORDER BY cd.created_at DESC`,
      [userId]
    );
    return rows;
  }

  static async updateStatus(deliveryId: number, status: DeliveryStatus): Promise<CardDeliveryRecord | null> {
    const { rows } = await pool.query(
      "UPDATE card_deliveries SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, deliveryId]
    );
    return rows[0] || null;
  }

  /** Check if there's already an active (non-delivered) delivery for this card */
  static async hasActiveDelivery(cardId: number): Promise<boolean> {
    const { rows } = await pool.query(
      "SELECT id FROM card_deliveries WHERE card_id = $1 AND status NOT IN ('DELIVERED') LIMIT 1",
      [cardId]
    );
    return rows.length > 0;
  }
}

export default CardDelivery;
