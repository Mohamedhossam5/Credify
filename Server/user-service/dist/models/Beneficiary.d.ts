export interface BeneficiaryRecord {
    id: number;
    user_id: number;
    type: string;
    name: string;
    account_number: string;
    bank_name?: string;
    swift_code?: string;
    address?: string;
    created_at: string;
}
export interface CreateBeneficiaryInput {
    userId: number;
    type: string;
    name: string;
    accountNumber: string;
    bankName?: string;
    swiftCode?: string;
    address?: string;
}
declare class Beneficiary {
    static create(input: CreateBeneficiaryInput): Promise<BeneficiaryRecord>;
    static findByUserId(userId: number): Promise<BeneficiaryRecord[]>;
    static delete(id: number, userId: number): Promise<boolean>;
}
export default Beneficiary;
