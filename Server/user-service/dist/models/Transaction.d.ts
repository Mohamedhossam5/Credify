export interface TransactionRecord {
    id: number;
    sender_id: number;
    sender_account_id: string;
    type: string;
    amount: number;
    fee: number;
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
    fee?: number;
    recipientName: string;
    recipientAccount: string;
    recipientBank?: string;
    swiftCode?: string;
    recipientAddress?: string;
    reference?: string;
}
declare class Transaction {
    static create(input: CreateTransactionInput): Promise<TransactionRecord>;
    static findByUserIdAndAccount(userId: number, accountId?: string, limit?: number): Promise<any[]>;
    static findAll(limit?: number): Promise<any[]>;
}
export default Transaction;
