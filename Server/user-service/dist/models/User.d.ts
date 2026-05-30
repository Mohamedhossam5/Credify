export interface UserRecord {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    email: string;
    password_hash?: string;
    phone_number: string;
    gender: string;
    id_number: string;
    birthdate: string;
    address: string | null;
    phone_verified: boolean;
    email_verified: boolean;
    kyc_status: string;
    role: string;
    created_at: string;
    updated_at: string;
    failed_login_attempts: number;
    is_locked: boolean;
}
interface CreateUserInput {
    firstName: string;
    middleName: string | null;
    lastName: string;
    email: string;
    passwordHash: string;
    phoneNumber: string;
    gender: string;
    idNumber: string;
    birthdate: string;
    address: string | null;
}
declare class User {
    static create(input: CreateUserInput): Promise<UserRecord>;
    static findByEmail(email: string): Promise<UserRecord | null>;
    static findById(id: number): Promise<UserRecord | null>;
    static findAll(): Promise<any[]>;
    static updateKycStatus(userId: number, status: string): Promise<UserRecord | null>;
    static updatePhoneVerified(userId: number): Promise<UserRecord | null>;
    static updateEmailVerified(userId: number): Promise<UserRecord | null>;
    static findByPhoneNumber(phone: string): Promise<UserRecord | null>;
    static updatePassword(userId: number, passwordHash: string): Promise<void>;
    static incrementFailedLogins(userId: number): Promise<void>;
    static resetFailedLogins(userId: number): Promise<void>;
    static lockAccount(userId: number): Promise<void>;
    static unlockAccount(userId: number): Promise<void>;
}
export default User;
