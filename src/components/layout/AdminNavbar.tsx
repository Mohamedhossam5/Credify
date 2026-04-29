import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  theme: string;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ onToggleSidebar, onToggleTheme, theme }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleNotif = () => setNotifOpen(!notifOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header id="admin-topbar">
      <button className="collapse-btn" onClick={onToggleSidebar} title="Toggle sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="search-wrap">
        <span className="search-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input type="text" id="global-search" placeholder="Search..." />
      </div>

      <div className="topbar-right">
        <div className="live-pill"><span className="live-dot"></span>Live</div>
        <div style={{ width: '1px', height: '22px', background: 'var(--border)', margin: '0 2px' }}></div>
        
        <button className="topbar-btn" onClick={onToggleTheme} title="Toggle theme">
          <svg id="theme-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {theme === 'dark' ? (
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            ) : (
              <>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </>
            )}
          </svg>
        </button>

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button className="topbar-btn" onClick={toggleNotif} title="Notifications" id="notif-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="notif-dot" id="notif-dot"></span>
          </button>
          
          <div className="notif-dropdown" id="notif-dropdown" style={{ display: notifOpen ? 'block' : 'none' }}>
            <div className="notif-header">
              <span className="notif-header-title">Notifications</span>
              <span className="notif-clear" onClick={() => setNotifOpen(false)}>Clear all</span>
            </div>
            <div id="notif-list">
              <div className="notif-item">
                <div className="notif-dot-icon" style={{ background: '#dc2626' }}></div>
                <div>
                  <div className="notif-text" style={{ fontWeight: 600 }}>Critical fraud alert: Yuki Tanaka — $25,000 wire blocked</div>
                  <div className="notif-time">2m ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '22px', background: 'var(--border)', margin: '0 2px' }} className="hidden sm:block"></div>
        
        <div className="avatar" style={{ width: '34px', height: '34px', fontSize: '12px', cursor: 'pointer' }} onClick={() => navigate('/admin/settings')}>
          MN
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
