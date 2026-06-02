import { useMemo, useCallback, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeService, type TransactionRecord } from '../services/finance.service';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

// ─── Types ───────────────────────────────────────────────────
export interface Notification {
  id: string;
  type: 'received' | 'sent' | 'system' | 'card' | 'security' | 'kyc_request';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: 'arrow-down' | 'arrow-up' | 'shield' | 'card' | 'bell' | 'check';
  color: string; // CSS color string for the icon background
  metadata?: any;
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
  const [readUpdateTick, setReadUpdateTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setReadUpdateTick((t) => t + 1);
    window.addEventListener('notifications_read_updated', handleUpdate);
    return () => window.removeEventListener('notifications_read_updated', handleUpdate);
  }, []);

  // Fetch recent transactions
  const { data: rawTransactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => financeService.getTransactions(),
    enabled: !!currentAccountId,
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  // Fetch cards
  const { data: cardsData } = useQuery({
    queryKey: ['dashboard-cards'],
    queryFn: async () => {
      const { data } = await api.get<{ cards: any[] }>('/cards');
      return data.cards || [];
    },
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  // Fetch pending KYC requests
  const { data: kycRequests } = useQuery({
    queryKey: ['kyc-requests'],
    queryFn: async () => {
      const { data } = await api.get('/kyc/requests/my');
      return data.requests || [];
    },
    enabled: !!user,
    refetchInterval: 3000,
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

    // 4. KYC Requests
    if (kycRequests && kycRequests.length > 0) {
      kycRequests.forEach((req: any) => {
        const id = `kyc-req-${req.id}-${req.status}`;
        if (req.status === 'PENDING') {
          items.push({
            id,
            type: 'kyc_request',
            title: 'Action Required: Additional KYC',
            message: req.message,
            timestamp: new Date(req.created_at),
            read: readIds.has(id),
            icon: 'shield',
            color: 'rgba(255, 77, 106, 0.15)',
            metadata: { requestId: req.id }
          });
        } else if (req.status === 'UPLOADED') {
          items.push({
            id,
            type: 'system',
            title: 'Document Uploaded',
            message: 'Your additional document has been uploaded and is pending admin review.',
            timestamp: new Date(req.created_at),
            read: readIds.has(id),
            icon: 'check',
            color: 'rgba(0, 232, 143, 0.15)',
          });
        }
      });
    }

    // Sort by newest first
    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return items;
  }, [rawTransactions, cardsData, kycRequests, currentAccountId, user, readUpdateTick]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = useCallback((id: string) => {
    const ids = getReadIds();
    ids.add(id);
    saveReadIds(ids);
    window.dispatchEvent(new Event('notifications_read_updated'));
  }, []);

  const markAllRead = useCallback(() => {
    const ids = getReadIds();
    notifications.forEach((n) => ids.add(n.id));
    saveReadIds(ids);
    window.dispatchEvent(new Event('notifications_read_updated'));
  }, [notifications]);

  return { notifications, unreadCount, markAsRead, markAllRead };
};
