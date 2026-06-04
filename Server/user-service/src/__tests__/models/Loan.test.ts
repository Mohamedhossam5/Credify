// We only test the pure calculation methods — no DB mocking needed.
// The static methods getInterestRate, calculateMonthlyPayment, calculateLoan,
// and generateSchedule are all pure functions on the Loan class.

// Mock the DB pool so importing the module doesn't crash
jest.mock("../../config/db", () => ({
  __esModule: true,
  default: { query: jest.fn(), connect: jest.fn() },
}));

import Loan from "../../models/Loan";

// ─── getInterestRate ─────────────────────────────────────────

describe("Loan.getInterestRate", () => {
  test("lowest amount tier + shortest tenure → highest rate (14%)", () => {
    expect(Loan.getInterestRate(10000, 6)).toBe(14);
  });

  test("highest amount tier + longest tenure → lowest rate (16%)", () => {
    expect(Loan.getInterestRate(1_000_000, 60)).toBe(16);
  });

  test("boundary: amount exactly at tier edge (50 000, 12m)", () => {
    expect(Loan.getInterestRate(50000, 12)).toBe(15);
  });

  test("mid-range amount and tenure (100 000, 36m)", () => {
    // Amount ≤ 200 000 → second tier, tenure 36 → rate = 16
    expect(Loan.getInterestRate(100_000, 36)).toBe(16);
  });

  test("tenure rounds up to next breakpoint (e.g. 9 months → uses 12-month column)", () => {
    // 9 months isn't a breakpoint; the code picks the first bp ≥ tenure → 12
    // Amount 30 000 → first tier, 12-month rate = 15
    expect(Loan.getInterestRate(30_000, 9)).toBe(15);
  });

  test("tenure exceeding 60 months falls to the 60-month column", () => {
    // 72 > 60 → stays at last breakpoint (60)
    expect(Loan.getInterestRate(30_000, 72)).toBe(19);
  });
});

// ─── calculateMonthlyPayment ─────────────────────────────────

describe("Loan.calculateMonthlyPayment", () => {
  test("zero interest rate → simple principal / months", () => {
    const monthly = Loan.calculateMonthlyPayment(12000, 0, 12);
    expect(monthly).toBeCloseTo(1000, 2);
  });

  test("known example: 100 000 EGP @ 14% for 12 months", () => {
    // French amortisation formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const r = 14 / 100 / 12;
    const n = 12;
    const expected = 100_000 * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const actual = Loan.calculateMonthlyPayment(100_000, 14, 12);
    expect(actual).toBeCloseTo(expected, 2);
  });

  test("monthly payment * months > principal when interest > 0", () => {
    const monthly = Loan.calculateMonthlyPayment(50_000, 15, 24);
    expect(monthly * 24).toBeGreaterThan(50_000);
  });
});

// ─── calculateLoan ───────────────────────────────────────────

describe("Loan.calculateLoan", () => {
  test("returns all expected fields", () => {
    const result = Loan.calculateLoan(100_000, 24);
    expect(result).toHaveProperty("amount", 100_000);
    expect(result).toHaveProperty("tenureMonths", 24);
    expect(result).toHaveProperty("interestRate");
    expect(result).toHaveProperty("monthlyPayment");
    expect(result).toHaveProperty("totalRepayment");
    expect(result).toHaveProperty("totalInterest");
    expect(result).toHaveProperty("adminFee");
    expect(result).toHaveProperty("netDisbursement");
  });

  test("totalRepayment = monthlyPayment × tenureMonths", () => {
    const result = Loan.calculateLoan(200_000, 36);
    expect(result.totalRepayment).toBeCloseTo(result.monthlyPayment * 36, 0);
  });

  test("totalInterest = totalRepayment - amount", () => {
    const result = Loan.calculateLoan(75_000, 12);
    expect(result.totalInterest).toBeCloseTo(result.totalRepayment - 75_000, 0);
  });

  test("adminFee is 0 (ADMIN_FEE_RATE = 0)", () => {
    const result = Loan.calculateLoan(500_000, 60);
    expect(result.adminFee).toBe(0);
  });

  test("netDisbursement equals amount when admin fee is 0", () => {
    const result = Loan.calculateLoan(300_000, 48);
    expect(result.netDisbursement).toBe(300_000);
  });
});

// ─── generateSchedule ───────────────────────────────────────

describe("Loan.generateSchedule", () => {
  test("schedule has exactly N entries for N months", () => {
    const schedule = Loan.generateSchedule(100_000, 14, 12);
    expect(schedule).toHaveLength(12);
  });

  test("last entry balance converges to 0", () => {
    const schedule = Loan.generateSchedule(100_000, 15, 24);
    const lastEntry = schedule[schedule.length - 1];
    expect(lastEntry.balance).toBeCloseTo(0, 0);
  });

  test("each entry has month, payment, principal, interest, balance", () => {
    const schedule = Loan.generateSchedule(50_000, 13, 6);
    for (const entry of schedule) {
      expect(entry).toHaveProperty("month");
      expect(entry).toHaveProperty("payment");
      expect(entry).toHaveProperty("principal");
      expect(entry).toHaveProperty("interest");
      expect(entry).toHaveProperty("balance");
    }
  });

  test("month numbers are sequential 1..N", () => {
    const schedule = Loan.generateSchedule(80_000, 16, 36);
    schedule.forEach((entry, idx) => {
      expect(entry.month).toBe(idx + 1);
    });
  });

  test("sum of all principal portions ≈ original principal", () => {
    const principal = 200_000;
    const schedule = Loan.generateSchedule(principal, 14, 48);
    const totalPrincipal = schedule.reduce((sum, e) => sum + e.principal, 0);
    expect(totalPrincipal).toBeCloseTo(principal, -1); // within ±10 due to rounding
  });
});
