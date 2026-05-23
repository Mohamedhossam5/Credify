export type CardType = "DEBIT" | "PREPAID";
export type CardStatus = "ACTIVE" | "FROZEN" | "CANCELLED";
export interface CardRecord {
    id: number;
    user_id: number;
    card_type: CardType;
    card_number: string;
    last_four: string;
    expiry_month: number;
    expiry_year: number;
    cvv: string;
    cardholder_name: string;
    status: CardStatus;
    prepaid_balance: number;
    linked_account_id: string | null;
    daily_limit: number;
    created_at: string;
    updated_at: string;
}
export interface SafeCardRecord {
    id: number;
    user_id: number;
    card_type: CardType;
    card_number_masked: string;
    last_four: string;
    expiry_month: number;
    expiry_year: number;
    cardholder_name: string;
    status: CardStatus;
    prepaid_balance: number;
    linked_account_id: string | null;
    daily_limit: number;
    created_at: string;
    updated_at: string;
}
declare class Card {
    /** Generate a realistic 16-digit card number starting with 5270 (Credify prefix) */
    private static generateCardNumber;
    /** Generate a 3-digit CVV */
    private static generateCvv;
    /** Mask card number: **** **** **** 1234 */
    private static maskCardNumber;
    /** Strip CVV and mask card number for API responses */
    static toSafe(card: CardRecord): SafeCardRecord;
    static create(userId: number, cardType: CardType, cardholderName: string, linkedAccountId: string | null, dailyLimit?: number): Promise<CardRecord>;
    static findById(cardId: number): Promise<CardRecord | null>;
    static findByUserId(userId: number): Promise<CardRecord[]>;
    static findActiveByUserIdAndType(userId: number, cardType: CardType): Promise<CardRecord[]>;
    static updateStatus(cardId: number, status: CardStatus): Promise<CardRecord | null>;
    static updateDailyLimit(cardId: number, limit: number): Promise<CardRecord | null>;
    /**
     * Load funds from the user's main account into a prepaid card.
     * Uses a DB transaction to ensure atomicity.
     */
    static loadPrepaid(userId: number, cardId: number, amount: number): Promise<{
        success: boolean;
        error?: string;
        newPrepaidBalance?: number;
        newAccountBalance?: number;
    }>;
    /**
     * Unload / withdraw funds from a prepaid card back to the user's main account.
     */
    static unloadPrepaid(userId: number, cardId: number, amount: number): Promise<{
        success: boolean;
        error?: string;
        newPrepaidBalance?: number;
        newAccountBalance?: number;
    }>;
    /**
     * Transfer funds between two prepaid cards owned by the same user.
     */
    static transferBetweenPrepaid(userId: number, fromCardId: number, toCardId: number, amount: number): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export default Card;
