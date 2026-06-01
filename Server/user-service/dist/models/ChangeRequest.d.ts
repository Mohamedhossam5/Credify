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
declare class ChangeRequest {
    static createTables(): Promise<void>;
    static create(input: {
        userId: number;
        changeType: string;
        currentValue: string;
        newValue: string;
        documents: any[];
    }): Promise<ChangeRequestRecord>;
    static findByUserId(userId: number): Promise<ChangeRequestRecord[]>;
    static findActiveByUserAndType(userId: number, changeType: string): Promise<ChangeRequestRecord | null>;
    static findById(id: number): Promise<ChangeRequestRecord | null>;
    static findAll(): Promise<ChangeRequestWithUser[]>;
    static updateStatus(id: number, status: string): Promise<ChangeRequestRecord | null>;
    static addDocuments(id: number, newDocs: any[]): Promise<ChangeRequestRecord | null>;
    static addMessage(requestId: number, sender: string, message: string, documents?: any[]): Promise<ChangeRequestMessageRecord>;
    static getMessages(requestId: number): Promise<ChangeRequestMessageRecord[]>;
    static applyChange(request: ChangeRequestRecord): Promise<void>;
}
export default ChangeRequest;
