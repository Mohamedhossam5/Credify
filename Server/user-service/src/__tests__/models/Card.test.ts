// Mock the DB pool so importing the module doesn't crash
jest.mock("../../config/db", () => ({
  __esModule: true,
  default: { query: jest.fn(), connect: jest.fn() },
}));

import Card from "../../models/Card";
import type { CardRecord } from "../../models/Card";

// ─── Card.toSafe ─────────────────────────────────────────────

describe("Card.toSafe", () => {
  const sampleCard: CardRecord = {
    id: 1,
    user_id: 42,
    card_type: "DEBIT",
    card_number: "5270123456781234",
    last_four: "1234",
    expiry_month: 6,
    expiry_year: 2031,
    cvv: "789",
    cardholder_name: "JOHN DOE",
    status: "ACTIVE",
    prepaid_balance: 0,
    linked_account_id: "CRD100000001",
    daily_limit: 10000,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };

  test("strips the CVV from the output", () => {
    const safe = Card.toSafe(sampleCard);
    expect(safe).not.toHaveProperty("cvv");
  });

  test("masks the card number as **** **** **** XXXX", () => {
    const safe = Card.toSafe(sampleCard);
    expect(safe.card_number_masked).toBe("**** **** **** 1234");
  });

  test("does NOT include the raw card_number field", () => {
    const safe = Card.toSafe(sampleCard);
    expect(safe).not.toHaveProperty("card_number");
  });

  test("preserves all other fields", () => {
    const safe = Card.toSafe(sampleCard);
    expect(safe.id).toBe(1);
    expect(safe.user_id).toBe(42);
    expect(safe.card_type).toBe("DEBIT");
    expect(safe.last_four).toBe("1234");
    expect(safe.expiry_month).toBe(6);
    expect(safe.expiry_year).toBe(2031);
    expect(safe.cardholder_name).toBe("JOHN DOE");
    expect(safe.status).toBe("ACTIVE");
    expect(safe.prepaid_balance).toBe(0);
    expect(safe.linked_account_id).toBe("CRD100000001");
    expect(safe.daily_limit).toBe(10000);
  });

  test("works correctly with a PREPAID card", () => {
    const prepaidCard: CardRecord = {
      ...sampleCard,
      card_type: "PREPAID",
      card_number: "5270999988887777",
      last_four: "7777",
      prepaid_balance: 5000,
      linked_account_id: null,
    };

    const safe = Card.toSafe(prepaidCard);
    expect(safe.card_number_masked).toBe("**** **** **** 7777");
    expect(safe.card_type).toBe("PREPAID");
    expect(safe.prepaid_balance).toBe(5000);
    expect(safe.linked_account_id).toBeNull();
  });
});
