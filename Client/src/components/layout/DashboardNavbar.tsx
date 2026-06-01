import React, { useState, useRef, useEffect, type JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { createPortal } from 'react-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

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
  const navigate = useNavigate();
  const pageId = location.pathname.split('/').pop() || 'dashboard';
  const user = useAuthStore((s) => s.user);
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isBellHovered, setIsBellHovered] = useState(false);
  const [kycUploadOpen, setKycUploadOpen] = useState(false);
  const [activeKycNotif, setActiveKycNotif] = useState<any>(null);
  const [kycUploadFile, setKycUploadFile] = useState<File | null>(null);
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // User initials from real data
  const userInitials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  const pageTitles: Record<string, string> = {
    dashboard: "Dashboard",
    transactions: "Transactions",
    transfers: "Transfers",
    'bill-payment': "Bill Payment",
    donations: "Donations",
    accounts: "My Accounts",
    exchange: "Exchange Rates",
    loans: "Loans",
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

  // ── Listen for global open kyc upload event ──
  useEffect(() => {
    const handleOpenKyc = (e: any) => {
      setActiveKycNotif({ metadata: { requestId: e.detail.id }, message: e.detail.message });
      setKycUploadOpen(true);
    };
    window.addEventListener('open-kyc-upload', handleOpenKyc);
    return () => window.removeEventListener('open-kyc-upload', handleOpenKyc);
  }, []);

  // ── Keyboard shortcut G -> N to toggle notifications ──
  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }

      const key = e.key.toLowerCase();
      const now = Date.now();

      if (lastKey === 'g' && key === 'n' && (now - lastKeyTime < 1000)) {
        setIsNotifOpen((prev) => !prev);
        lastKey = '';
      } else if (key === 'g') {
        lastKey = 'g';
        lastKeyTime = now;
      } else {
        lastKey = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Keyboard shortcut G -> N to toggle notifications ──
  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }

      const key = e.key.toLowerCase();
      const now = Date.now();

      if (lastKey === 'g' && key === 'n' && (now - lastKeyTime < 1000)) {
        setIsNotifOpen((prev) => !prev);
        lastKey = '';
      } else if (key === 'g') {
        lastKey = 'g';
        lastKeyTime = now;
      } else {
        lastKey = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNotifToggle = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  const handleMarkAllRead = () => {
    markAllRead();
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
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <svg
            className="icon-moon"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </div>

        {/* ── Notification Bell with Dropdown ── */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <div
            className="icon-btn"
            style={{ position: 'relative', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none' }}
            onClick={handleNotifToggle}
            onMouseEnter={() => setIsBellHovered(true)}
            onMouseLeave={() => setIsBellHovered(false)}
            onFocus={() => setIsBellHovered(true)}
            onBlur={() => setIsBellHovered(false)}
            tabIndex={0}
            aria-label="Notifications"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
            {unreadCount > 0 && (
              <div className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</div>
            )}
          </div>

          {/* ── Premium Hotkey Shortcut Tooltip ── */}
          {isBellHovered && !isNotifOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: '0',
              background: 'var(--bg-sidebar)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-card)',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              whiteSpace: 'nowrap',
              zIndex: 1000,
              animation: 'tooltipSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) both',
              pointerEvents: 'none',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-primary)' }}>
                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You have no unread notifications'}
              </span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <kbd style={{
                  background: 'var(--navy-light)',
                  border: '1px solid var(--glass-border)',
                  padding: '2px 6px',
                  borderRadius: '5px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}>G</kbd>
                <kbd style={{
                  background: 'var(--navy-light)',
                  border: '1px solid var(--glass-border)',
                  padding: '2px 6px',
                  borderRadius: '5px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}>N</kbd>
              </div>
              <style>{`
                @keyframes tooltipSlideIn {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </div>
          )}

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
                        if (notif.type === 'kyc_request') {
                          setActiveKycNotif(notif);
                          setKycUploadOpen(true);
                          setIsNotifOpen(false);
                        }
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

        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/settings')}>
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="avatar" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="avatar">{userInitials}</div>
          )}
        </div>
      </div>

      {/* KYC Upload Modal */}
      {kycUploadOpen && activeKycNotif && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setKycUploadOpen(false)}>
          <div style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '20px', width: '90%', maxWidth: '420px', border: '1px solid var(--border)', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 185, 0, 0.1)', color: 'var(--warn)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {activeKycNotif.message}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                Please upload the required document below to proceed.
              </p>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>Select Document Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setKycUploadFile(e.target.files?.[0] || null)}
                style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px dashed var(--border)', borderRadius: '10px', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setKycUploadOpen(false)} 
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!kycUploadFile || !activeKycNotif.metadata?.requestId) return;
                  setIsUploadingKyc(true);
                  try {
                    const fd = new FormData();
                    fd.append('document', kycUploadFile);
                    await api.post(`/kyc/requests/${activeKycNotif.metadata.requestId}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                    alert("Document uploaded successfully.");
                    setKycUploadOpen(false);
                    setKycUploadFile(null);
                  } catch (err) {
                    console.error("KYC Upload Error", err);
                    alert("Failed to upload document.");
                  } finally {
                    setIsUploadingKyc(false);
                  }
                }}
                disabled={!kycUploadFile || isUploadingKyc}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--accent)', border: 'none', color: '#fff', fontWeight: 700, cursor: (!kycUploadFile || isUploadingKyc) ? 'not-allowed' : 'pointer', opacity: (!kycUploadFile || isUploadingKyc) ? 0.6 : 1 }}
              >
                {isUploadingKyc ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default DashboardNavbar;
