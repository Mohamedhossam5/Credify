import React, { useState, useRef, useEffect, type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuthStore } from '../../store/authStore';

interface DashboardNavbarProps {
  onToggleSidebar: () => void;
}

// ─── Notification icon components ────────────────────────────
const NotifIcon: React.FC<{ icon: string; color: string }> = ({ icon, color }) => {
  const iconMap: Record<string, JSX.Element> = {
    'arrow-down': (
      <svg width="14" height="14" fill="none" stroke="#00e88f" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M19 12l-7 7-7-7M12 19V5" />
      </svg>
    ),
    'arrow-up': (
      <svg width="14" height="14" fill="none" stroke="#ff4d6a" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M5 12l7-7 7 7M12 5v14" />
      </svg>
    ),
    'shield': (
      <svg width="14" height="14" fill="none" stroke="#1a6fff" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    'card': (
      <svg width="14" height="14" fill="none" stroke="#8b5cf6" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="3" /><path d="M1 10h22" />
      </svg>
    ),
    'bell': (
      <svg width="14" height="14" fill="none" stroke="var(--teal)" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    'check': (
      <svg width="14" height="14" fill="none" stroke="#0ecbcb" strokeWidth="2.5" viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  };
  return (
    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {iconMap[icon] || iconMap['bell']}
    </div>
  );
};

// ─── Time ago helper ─────────────────────────────────────────
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const pageId = location.pathname.split('/')[1] || 'dashboard';
  const user = useAuthStore((s) => s.user);
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // User initials from real data
  const userInitials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  const pageTitles: Record<string, string> = {
    dashboard: "Dashboard",
    transactions: "Transactions",
    transfers: "Transfers",
    accounts: "My Accounts",
    exchange: "Exchange Rates",
    settings: "Settings",
  };

  const title = pageTitles[pageId] || "Dashboard";

  const now = new Date();
  const dateString = now.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Theme toggle with persistence ──
  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("credify_theme", newTheme);
  };

  // ── Close notification dropdown on outside click ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  const handleNotifToggle = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  const handleMarkAllRead = () => {
    markAllRead();
    // Force a re-render by closing and reopening
    setIsNotifOpen(false);
    setTimeout(() => setIsNotifOpen(true), 50);
  };

  return (
    <div className="topbar">
      <div>
        <div id="topbar-title" className="page-title text-[var(--text-primary)]">{title}</div>
        <div className="page-date" id="topbar-date">{dateString}</div>
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" id="mobile-toggle" onClick={onToggleSidebar}>
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <div
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          <svg
            className="icon-sun"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="5" />
            <path
              d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            />
          </svg>
          <svg
            className="icon-moon"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>

        {/* ── Notification Bell with Dropdown ── */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <div
            className="icon-btn"
            style={{ position: 'relative', color: 'var(--text-primary)', cursor: 'pointer' }}
            onClick={handleNotifToggle}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
              />
            </svg>
            {unreadCount > 0 && (
              <div className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</div>
            )}
          </div>

          {/* ── Notification Dropdown Panel ── */}
          {isNotifOpen && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <span className="notif-dropdown-title">Notifications</span>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-dropdown-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <svg width="32" height="32" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: '8px', opacity: 0.5 }}>
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span>No notifications yet</span>
                  </div>
                ) : (
                  notifications.slice(0, 12).map((notif) => (
                    <div
                      key={notif.id}
                      className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                      onClick={() => {
                        if (!notif.read) markAsRead(notif.id);
                      }}
                    >
                      <NotifIcon icon={notif.icon} color={notif.color} />
                      <div className="notif-item-content">
                        <div className="notif-item-title">{notif.title}</div>
                        <div className="notif-item-message">{notif.message}</div>
                        <div className="notif-item-time">{timeAgo(notif.timestamp)}</div>
                      </div>
                      {!notif.read && <div className="notif-unread-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="avatar">{userInitials}</div>
      </div>
    </div>
  );
};

export default DashboardNavbar;
