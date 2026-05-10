import { api } from '../lib/api';

// ─── Types ───────────────────────────────────────────────────

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
  sender_first_name?: string;
  sender_last_name?: string;
  sender_email?: string;
}

export interface BalanceResponse {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    account: {
      accountId: string;
      balance: number;
    } | null;
  };
}

// ─── API Calls ───────────────────────────────────────────────

export const financeService = {
  /** Fetch user balance via /auth/me */
  getBalance: async (): Promise<{ accountId: string; balance: number } | null> => {
    const { data } = await api.get<BalanceResponse>('/auth/me');
    return data.user.account || null;
  },

  /** Fetch transactions (with optional limit) */
  getTransactions: async (limit?: number): Promise<TransactionRecord[]> => {
    const params = limit ? { limit: limit.toString() } : {};
    const { data } = await api.get<{ transactions: TransactionRecord[] }>('/transactions', { params });
    return data.transactions;
  },
};
