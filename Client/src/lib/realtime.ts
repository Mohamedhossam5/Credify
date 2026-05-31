import { queryClient } from './queryClient';
import toast from 'react-hot-toast';

// ─── Centralized Real-time Event Registry ───────────────────────
export const RealtimeEvent = {
  // Financial Events
  BALANCE_UPDATED: 'BALANCE_UPDATED',
  TRANSACTIONS_UPDATED: 'TRANSACTIONS_UPDATED',
  LOANS_UPDATED: 'LOANS_UPDATED',
  BILL_PAID: 'BILL_PAID',
  CARDS_UPDATED: 'CARDS_UPDATED',
  
  // Admin & System Events
  KYC_STATUS_UPDATED: 'KYC_STATUS_UPDATED',
  ADMIN_LOANS_UPDATED: 'ADMIN_LOANS_UPDATED',
  ADMIN_USERS_UPDATED: 'ADMIN_USERS_UPDATED',
  ADMIN_KYC_UPDATED: 'ADMIN_KYC_UPDATED'
} as const;

export type RealtimeEvent = typeof RealtimeEvent[keyof typeof RealtimeEvent];

// ─── Smart Query Key Mapping Layer ─────────────────────────────
// Maps clean high-level events to specific React Query keys to invalidate.
const EVENT_QUERY_MAPPING: Record<RealtimeEvent | string, string[]> = {
  [RealtimeEvent.BALANCE_UPDATED]: ['balance', 'account-balance'],
  [RealtimeEvent.TRANSACTIONS_UPDATED]: ['transactions', 'balance', 'account-balance'],
  [RealtimeEvent.LOANS_UPDATED]: ['my-loans'],
  [RealtimeEvent.BILL_PAID]: ['transactions', 'balance', 'account-balance'],
  [RealtimeEvent.CARDS_UPDATED]: ['dashboard-cards'],
  [RealtimeEvent.KYC_STATUS_UPDATED]: ['kycState'],
  [RealtimeEvent.ADMIN_LOANS_UPDATED]: ['admin-loans'],
  [RealtimeEvent.ADMIN_USERS_UPDATED]: ['admin-users'],
  [RealtimeEvent.ADMIN_KYC_UPDATED]: ['admin-kyc-users'],
  
  // Legacy fallback support for older string keys
  'balance': ['balance', 'account-balance'],
  'account-balance': ['balance', 'account-balance'],
  'transactions': ['transactions'],
  'my-loans': ['my-loans'],
  'dashboard-cards': ['dashboard-cards'],
  'kycState': ['kycState'],
  'admin-loans': ['admin-loans'],
  'admin-users': ['admin-users'],
  'admin-kyc-users': ['admin-kyc-users']
};

// Define sync channel
const SYNC_CHANNEL = 'credify_reactive_sync';
const syncChannel = typeof window !== 'undefined' ? new BroadcastChannel(SYNC_CHANNEL) : null;

// Keep track of recent publishes for deduplication (prevents execution storms)
const recentEvents = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 250; // Ignore identical events within 250ms

export const realtime = {
  /**
   * Publish a reactive update to all active components and tabs.
   * Leverages smart invalidation mapping and event deduplication.
   */
  publish(event: RealtimeEvent | string, optimisticData?: any) {
    const now = Date.now();
    const eventKey = `${event}_${JSON.stringify(optimisticData || '')}`;

    // 1. Middleware: Deduplication Layer
    const lastPublished = recentEvents.get(eventKey);
    if (lastPublished && (now - lastPublished) < DEDUPLICATION_WINDOW_MS) {
      console.log(`[Realtime Bus] Deduplicated duplicate event: ${event}`);
      return;
    }
    recentEvents.set(eventKey, now);

    console.group(`[Realtime Bus] 📡 Publishing Event: ${event}`);

    // 2. Resolve mapped queries to invalidate
    const queryKeysToInvalidate = EVENT_QUERY_MAPPING[event] || [event];
    
    // 3. Optimistic UI updates
    if (optimisticData !== undefined) {
      queryKeysToInvalidate.forEach(key => {
        console.log(`[Realtime Bus] Applying optimistic data for query key: [${key}]`);
        queryClient.setQueryData([key], optimisticData);
      });
    }

    // 4. Batch query invalidation locally
    queryKeysToInvalidate.forEach(key => {
      console.log(`[Realtime Bus] Invalidating local query key: [${key}]`);
      queryClient.invalidateQueries({ queryKey: [key] });
    });

    console.groupEnd();

    // 5. Broadcast clean, structured event to other tabs
    if (syncChannel) {
      syncChannel.postMessage({
        type: 'EVENT_BUS_SIGNAL',
        event,
        payload: optimisticData,
        timestamp: now
      });
    }
  },

  /**
   * Initialize the real-time tab synchronization listener.
   */
  init() {
    if (!syncChannel) return;

    syncChannel.onmessage = (messageEvent) => {
      const { type, event, payload, notification } = messageEvent.data;

      // Handle structured Event Bus signals
      if (type === 'EVENT_BUS_SIGNAL' && event) {
        console.group(`[Realtime Bus] 📥 Event Received from Tab: ${event}`);
        
        const queryKeysToInvalidate = EVENT_QUERY_MAPPING[event] || [event];
        
        if (payload !== undefined) {
          queryKeysToInvalidate.forEach(key => {
            queryClient.setQueryData([key], payload);
          });
        }

        queryKeysToInvalidate.forEach(key => {
          console.log(`[Realtime Bus] Invalidating remote query key: [${key}]`);
          queryClient.invalidateQueries({ queryKey: [key] });
        });

        console.groupEnd();
      }

      // Legacy fallback and Push notifications
      if (type === 'INVALIDATE_QUERY' && event) {
        const queryKeysToInvalidate = EVENT_QUERY_MAPPING[event] || [event];
        queryKeysToInvalidate.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }

      if (type === 'PUSH_NOTIFICATION' && notification) {
        // Display new notification instantly on other tabs!
        toast.success(notification.title + ': ' + notification.message, {
          icon: '🔔',
          duration: 4000,
        });
        window.dispatchEvent(new Event('notifications_read_updated'));
      }
    };

    // Reactively sync auth store across tabs using storage event
    window.addEventListener('storage', (storageEvent) => {
      if (storageEvent.key === 'credify_user') {
        try {
          const newUser = storageEvent.newValue ? JSON.parse(storageEvent.newValue) : null;
          import('../store/authStore').then(({ useAuthStore }) => {
            if (newUser) {
              useAuthStore.setState({ user: newUser });
            } else {
              useAuthStore.setState({ user: null, isAuthenticated: false, token: null });
            }
          });
        } catch (e) {
          console.error('[Realtime Sync] Failed to parse cross-tab user update', e);
        }
      }
      if (storageEvent.key === 'credify_token' && !storageEvent.newValue) {
        // Automatically logout on all tabs if logged out on one
        import('../store/authStore').then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
        });
      }
    });
  },

  /**
   * Broadcast a real-time notification to all tabs.
   */
  pushNotification(notification: { title: string; message: string }) {
    if (syncChannel) {
      syncChannel.postMessage({ type: 'PUSH_NOTIFICATION', notification });
    }
  }
};
