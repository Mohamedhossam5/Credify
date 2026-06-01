export interface LoanRecord {
    id: number;
    user_id: number;
    amount: number;
    tenure_months: number;
    interest_rate: number;
    monthly_payment: number;
    total_repayment: number;
    total_interest: number;
    admin_fee: number;
    purpose: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
    rejection_reason: string | null;
    approved_at: string | null;
    disbursed_at: string | null;
    created_at: string;
    updated_at: string;
}
declare class Loan {
    /**
     * Get the annual interest rate for a given amount and tenure.
     */
    static getInterestRate(amount: number, tenureMonths: number): number;
    /**
     * Calculate monthly payment using French amortization formula.
     * M = P * [r(1+r)^n] / [(1+r)^n - 1]
     */
    static calculateMonthlyPayment(principal: number, annualRate: number, months: number): number;
    /**
     * Full loan calculation preview.
     */
    static calculateLoan(amount: number, tenureMonths: number): {
        amount: number;
        tenureMonths: number;
        interestRate: number;
        monthlyPayment: number;
        totalRepayment: number;
        totalInterest: number;
        adminFee: number;
        netDisbursement: number;
    };
    /**
     * Generate full amortization schedule.
     */
    static generateSchedule(principal: number, annualRate: number, months: number): any[];
    static create(userId: number, amount: number, tenureMonths: number, interestRate: number, monthlyPayment: number, totalRepayment: number, totalInterest: number, adminFee: number, purpose?: string): Promise<LoanRecord>;
    static findById(id: number): Promise<LoanRecord | null>;
    static findByUserId(userId: number): Promise<LoanRecord[]>;
    static findAll(statusFilter?: string): Promise<any[]>;
    static updateStatus(id: number, status: string, rejectionReason?: string): Promise<LoanRecord | null>;
}
export default Loan;
