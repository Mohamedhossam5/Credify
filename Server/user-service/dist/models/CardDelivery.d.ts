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
declare class CardDelivery {
    static create(cardId: number, userId: number, deliveryAddress: string, city: string, postalCode: string, contactPhone: string, notes?: string): Promise<CardDeliveryRecord>;
    static findByCardId(cardId: number): Promise<CardDeliveryRecord | null>;
    static findAllByUserId(userId: number): Promise<CardDeliveryRecord[]>;
    static updateStatus(deliveryId: number, status: DeliveryStatus): Promise<CardDeliveryRecord | null>;
    /** Check if there's already an active (non-delivered) delivery for this card */
    static hasActiveDelivery(cardId: number): Promise<boolean>;
}
export default CardDelivery;
