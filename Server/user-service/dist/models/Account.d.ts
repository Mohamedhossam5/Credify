export interface AccountRecord {
    id: number;
    user_id: number;
    account_id: string;
    balance: number;
    created_at: string;
    updated_at: string;
}
declare class Account {
    static create(userId: number): Promise<AccountRecord>;
    static findByUserId(userId: number): Promise<AccountRecord | null>;
    static transferFunds(senderUserId: number, amount: number, receiverAccountId?: string, fee?: number): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export default Account;
