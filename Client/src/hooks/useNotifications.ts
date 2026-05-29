import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeService, type TransactionRecord } from '../services/finance.service';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

// ─── Types ───────────────────────────────────────────────────
export interface Notification {
  id: string;
  type: 'received' | 'sent' | 'system' | 'card' | 'security';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: 'arrow-down' | 'arrow-up' | 'shield' | 'card' | 'bell' | 'check';
  color: string; // CSS color string for the icon background
}

// ─── LocalStorage helpers ────────────────────────────────────
const STORAGE_KEY = 'credify_read_notifications';

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

// ─── Hook ────────────────────────────────────────────────────
export const useNotifications = () => {
  const user = useAuthStore((s) => s.user);
  const currentAccountId = user?.account?.accountId;

  // Fetch recent transactions
  const { data: rawTransactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => financeService.getTransactions(),
    enabled: !!currentAccountId,
  });

  // Fetch cards
  const { data: cardsData } = useQuery({
    queryKey: ['dashboard-cards'],
    queryFn: async () => {
      const { data } = await api.get<{ cards: any[] }>('/cards');
      return data.cards || [];
    },
  });

  // Build notifications from real data
  const notifications = useMemo<Notification[]>(() => {
    const readIds = getReadIds();
    const items: Notification[] = [];

    // 1. Transaction-based notifications (latest 10)
    const recentTx = rawTransactions.slice(0, 10);
    recentTx.forEach((tx: TransactionRecord) => {
      const isOutgoing = tx.sender_account_id === currentAccountId;
      const amt = parseFloat(String(tx.amount));
      const formattedAmt = amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const date = new Date(tx.created_at);

      if (isOutgoing) {
        const id = `tx-sent-${tx.id}`;
        items.push({
          id,
          type: 'sent',
          title: 'Money Sent',
          message: `You sent EGP ${formattedAmt} to ${tx.recipient_name}`,
          timestamp: date,
          read: readIds.has(id),
          icon: 'arrow-up',
          color: 'rgba(255, 77, 106, 0.15)',
        });
      } else {
        const senderName = `${tx.sender_first_name || ''} ${tx.sender_last_name || ''}`.trim() || 'Someone';
        const id = `tx-recv-${tx.id}`;
        items.push({
          id,
          type: 'received',
          title: 'Money Received',
          message: `You received EGP ${formattedAmt} from ${senderName}`,
          timestamp: date,
          read: readIds.has(id),
          icon: 'arrow-down',
          color: 'rgba(0, 232, 143, 0.15)',
        });
      }
    });

    // 2. Card notifications
    const cards = cardsData ?? [];
    cards.forEach((card: any) => {
      const id = `card-issued-${card.id}`;
      const date = new Date(card.created_at);
      items.push({
        id,
        type: 'card',
        title: 'Card Issued',
        message: `Your ${card.card_type} card ending in ${card.last_four} is now active`,
        timestamp: date,
        read: readIds.has(id),
        icon: 'card',
        color: 'rgba(26, 111, 255, 0.15)',
      });

      if (card.status === 'FROZEN') {
        const frozenId = `card-frozen-${card.id}`;
        items.push({
          id: frozenId,
          type: 'security',
          title: 'Card Frozen',
          message: `Your ${card.card_type} card ending in ${card.last_four} has been frozen`,
          timestamp: date,
          read: readIds.has(frozenId),
          icon: 'shield',
          color: 'rgba(255, 185, 0, 0.15)',
        });
      }
    });

    // 3. System notifications
    if (user) {
      const welcomeId = `sys-welcome-${user.id || 'user'}`;
      items.push({
        id: welcomeId,
        type: 'system',
        title: 'Welcome to Credify',
        message: `Your account is verified and ready to use. Start by exploring your dashboard.`,
        timestamp: new Date(Date.now() - 86400000 * 7), // 7 days ago
        read: readIds.has(welcomeId),
        icon: 'check',
        color: 'rgba(14, 203, 203, 0.15)',
      });

      if (user.kycStatus === 'APPROVED') {
        const kycId = `sys-kyc-approved-${user.id || 'user'}`;
        items.push({
          id: kycId,
          type: 'system',
          title: 'KYC Approved',
          message: 'Your identity verification has been approved. Full account access is now enabled.',
          timestamp: new Date(Date.now() - 86400000 * 5), // 5 days ago
          read: readIds.has(kycId),
          icon: 'shield',
          color: 'rgba(0, 232, 143, 0.15)',
        });
      }
    }

    // Sort by newest first
    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return items;
  }, [rawTransactions, cardsData, currentAccountId, user]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = useCallback((id: string) => {
    const ids = getReadIds();
    ids.add(id);
    saveReadIds(ids);
  }, []);

  const markAllRead = useCallback(() => {
    const ids = getReadIds();
    notifications.forEach((n) => ids.add(n.id));
    saveReadIds(ids);
  }, [notifications]);

  return { notifications, unreadCount, markAsRead, markAllRead };
};
