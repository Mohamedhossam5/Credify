import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeService, type TransactionRecord } from '../services/finance.service';
import { useAuthStore } from '../store/authStore';

export type PaymentStatus = 'all' | 'received' | 'sent';

export interface Payment {
  id: string;
  date: string;
  time: string;
  name: string;
  desc: string;
  amount: string;
  status: 'received' | 'sent';
  initials: string;
  color: string;
}

// ─── Helpers ─────────────────────────────────────────────────

/** Turn a backend transaction into a UI-friendly Payment */
function mapTransaction(tx: TransactionRecord, currentAccountId?: string): Payment {
  const isSender = !currentAccountId || tx.sender_account_id !== currentAccountId
    ? false
    : true;
  // If the current user's account is the sender_account_id, it's a "sent" transaction.
  // If the current user's account appears as recipient_account, it's "received".
  // Also: if sender_account_id matches our account, we sent it.
  const isOutgoing = tx.sender_account_id === currentAccountId;
  const status: 'sent' | 'received' = isOutgoing ? 'sent' : 'received';

  const counterpartyName = isOutgoing
    ? tx.recipient_name
    : `${tx.sender_first_name || ''} ${tx.sender_last_name || ''}`.trim() || 'Unknown';

  const initials = counterpartyName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const amt = parseFloat(String(tx.amount));
  const formattedAmount = isOutgoing
    ? `-${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`
    : `+${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`;

  const date = new Date(tx.created_at);
  const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  const desc = isOutgoing ? 'Sent' : 'Received';

  // Generate a consistent gradient color from the counterparty name
  const hash = counterpartyName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hash * 7 + 120) % 360;
  const color = `linear-gradient(135deg, hsl(${hue1}, 70%, 50%), hsl(${hue2}, 70%, 45%))`;

  return {
    id: String(tx.id),
    date: dateStr,
    time: timeStr,
    name: counterpartyName,
    desc,
    amount: formattedAmount,
    status,
    initials,
    color,
  };
}

// ─── Hook ────────────────────────────────────────────────────

export const useTransactions = () => {
  const [txFilter, setTxFilter] = useState<PaymentStatus>('all');
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const user = useAuthStore((s) => s.user);
  const currentAccountId = user?.account?.accountId;

  // Fetch real transactions from the backend
  const { data: rawTransactions = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => financeService.getTransactions(),
    enabled: !!currentAccountId,
  });

  // Map backend records to UI-friendly Payments
  const allPayments = useMemo(() => {
    return rawTransactions.map((tx) => mapTransaction(tx, currentAccountId));
  }, [rawTransactions, currentAccountId]);

  // Apply filters
  const history = useMemo(() => {
    let data = allPayments;
    if (txFilter !== 'all') {
      data = data.filter((tx) => tx.status === txFilter);
    }
    if (txSearchQuery) {
      const q = txSearchQuery.toLowerCase();
      data = data.filter(
        (tx) =>
          tx.name.toLowerCase().includes(q) ||
          tx.desc.toLowerCase().includes(q)
      );
    }
    return data;
  }, [allPayments, txFilter, txSearchQuery]);

  // Recent payments (latest 5 for dashboard)
  const payments = useMemo(() => allPayments.slice(0, 5), [allPayments]);

  return {
    payments,
    isLoadingPayments: isLoadingHistory,
    history,
    isLoadingHistory,
    txFilter,
    setTxFilter,
    txSearchQuery,
    setTxSearchQuery,
  };
};
