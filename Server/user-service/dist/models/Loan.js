"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
// ─── Interest Rate Tiers (Egypt CBE-aligned) ────────────────
// Rows: amount brackets, Columns: tenure brackets (months)
const RATE_TABLE = [
    {
        maxAmount: 50000,
        rates: { 6: 14, 12: 15, 24: 16, 36: 17, 48: 18, 60: 19 },
    },
    {
        maxAmount: 200000,
        rates: { 6: 13, 12: 14, 24: 15, 36: 16, 48: 17, 60: 18 },
    },
    {
        maxAmount: 500000,
        rates: { 6: 12, 12: 13, 24: 14, 36: 15, 48: 16, 60: 17 },
    },
    {
        maxAmount: Infinity,
        rates: { 6: 11, 12: 12, 24: 13, 36: 14, 48: 15, 60: 16 },
    },
];
const TENURE_BREAKPOINTS = [6, 12, 24, 36, 48, 60];
const ADMIN_FEE_RATE = 0; // 0% Admin Fee
class Loan {
    /**
     * Get the annual interest rate for a given amount and tenure.
     */
    static getInterestRate(amount, tenureMonths) {
        // Find the closest tenure breakpoint (round up)
        let tenureKey = TENURE_BREAKPOINTS[TENURE_BREAKPOINTS.length - 1];
        for (const bp of TENURE_BREAKPOINTS) {
            if (tenureMonths <= bp) {
                tenureKey = bp;
                break;
            }
        }
        // Find the amount tier
        for (const tier of RATE_TABLE) {
            if (amount <= tier.maxAmount) {
                return tier.rates[tenureKey];
            }
        }
        // Fallback (shouldn't happen)
        return 16;
    }
    /**
     * Calculate monthly payment using French amortization formula.
     * M = P * [r(1+r)^n] / [(1+r)^n - 1]
     */
    static calculateMonthlyPayment(principal, annualRate, months) {
        const r = annualRate / 100 / 12; // Monthly rate
        if (r === 0)
            return principal / months;
        const factor = Math.pow(1 + r, months);
        return principal * (r * factor) / (factor - 1);
    }
    /**
     * Full loan calculation preview.
     */
    static calculateLoan(amount, tenureMonths) {
        const interestRate = this.getInterestRate(amount, tenureMonths);
        const monthlyPayment = this.calculateMonthlyPayment(amount, interestRate, tenureMonths);
        const totalRepayment = monthlyPayment * tenureMonths;
        const totalInterest = totalRepayment - amount;
        const adminFee = Math.round(amount * ADMIN_FEE_RATE * 100) / 100;
        return {
            amount,
            tenureMonths,
            interestRate,
            monthlyPayment: Math.round(monthlyPayment * 100) / 100,
            totalRepayment: Math.round(totalRepayment * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100,
            adminFee,
            netDisbursement: Math.round((amount - adminFee) * 100) / 100,
        };
    }
    /**
     * Generate full amortization schedule.
     */
    static generateSchedule(principal, annualRate, months) {
        const r = annualRate / 100 / 12;
        const monthlyPayment = this.calculateMonthlyPayment(principal, annualRate, months);
        const schedule = [];
        let balance = principal;
        for (let i = 1; i <= months; i++) {
            const interestPortion = balance * r;
            const principalPortion = monthlyPayment - interestPortion;
            balance -= principalPortion;
            schedule.push({
                month: i,
                payment: Math.round(monthlyPayment * 100) / 100,
                principal: Math.round(principalPortion * 100) / 100,
                interest: Math.round(interestPortion * 100) / 100,
                balance: Math.max(0, Math.round(balance * 100) / 100),
            });
        }
        return schedule;
    }
    // ─── Database Operations ────────────────────────────────────
    static async create(userId, amount, tenureMonths, interestRate, monthlyPayment, totalRepayment, totalInterest, adminFee, purpose) {
        const { rows } = await db_1.default.query(`INSERT INTO loans (user_id, amount, tenure_months, interest_rate, monthly_payment, total_repayment, total_interest, admin_fee, purpose)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [userId, amount, tenureMonths, interestRate, monthlyPayment, totalRepayment, totalInterest, adminFee, purpose || null]);
        return rows[0];
    }
    static async findById(id) {
        const { rows } = await db_1.default.query("SELECT * FROM loans WHERE id = $1", [id]);
        return rows[0] || null;
    }
    static async findByUserId(userId) {
        const { rows } = await db_1.default.query("SELECT * FROM loans WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        return rows;
    }
    static async findAll(statusFilter) {
        let query = `
      SELECT l.*, u.first_name, u.last_name, u.email
      FROM loans l
      JOIN users u ON l.user_id = u.id
    `;
        const values = [];
        if (statusFilter && statusFilter !== 'ALL') {
            query += " WHERE l.status = $1";
            values.push(statusFilter);
        }
        query += " ORDER BY l.created_at DESC";
        const { rows } = await db_1.default.query(query, values);
        return rows;
    }
    static async updateStatus(id, status, rejectionReason) {
        const now = new Date().toISOString();
        let query;
        let values;
        if (status === 'APPROVED') {
            query = `UPDATE loans SET status = $1, approved_at = $2, updated_at = $2 WHERE id = $3 RETURNING *`;
            values = [status, now, id];
        }
        else if (status === 'REJECTED') {
            query = `UPDATE loans SET status = $1, rejection_reason = $2, updated_at = $3 WHERE id = $4 RETURNING *`;
            values = [status, rejectionReason || 'No reason provided', now, id];
        }
        else {
            query = `UPDATE loans SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *`;
            values = [status, now, id];
        }
        const { rows } = await db_1.default.query(query, values);
        return rows[0] || null;
    }
}
exports.default = Loan;
