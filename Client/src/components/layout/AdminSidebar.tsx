import React, { useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import myImage from '../../assets/1.png';

// Preload map: hovering a sidebar item triggers the lazy-loaded chunk to download
const preloadMap: Record<string, () => void> = {
  '/admin/dashboard': () => import('../../pages/admin/dashboard/AdminDashboardPage'),
  '/admin/accounts': () => import('../../pages/admin/accounts/AccountsAdminPage'),
  '/admin/transactions': () => import('../../pages/admin/transactions/TransactionsAdminPage'),
  '/admin/kyc': () => import('../../pages/admin/kyc/KYCPage'),
  '/admin/change-requests': () => import('../../pages/admin/change-requests/ChangeRequestsAdminPage'),
  '/admin/settings': () => import('../../pages/admin/settings/SettingsAdminPage'),
};

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, mobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handlePreload = useCallback((path: string) => {
    preloadMap[path]?.();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div 
        id="admin-sidebar-overlay" 
        className={mobileOpen ? 'open' : ''} 
        onClick={onCloseMobile}
      ></div>

      <nav id="admin-sidebar" className={`${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ background: 'transparent' }}>
            <img src={myImage} alt="Credify" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          </div>
          <span className="logo-text">Credify</span>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section-label">Overview</div>
          
          <NavLink to="/admin/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile} onMouseEnter={() => handlePreload('/admin/dashboard')} onTouchStart={() => handlePreload('/admin/dashboard')}>
            <span className="nav-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
            </span>
            <span className="nav-label">Admin Dashboard</span>
          </NavLink>

          <div className="nav-section-label">Finance</div>
          
          <NavLink to="/admin/accounts" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile} onMouseEnter={() => handlePreload('/admin/accounts')} onTouchStart={() => handlePreload('/admin/accounts')}>
            <span className="nav-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </span>
            <span className="nav-label">Accounts</span>
          </NavLink>

          <NavLink to="/admin/transactions" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile} onMouseEnter={() => handlePreload('/admin/transactions')} onTouchStart={() => handlePreload('/admin/transactions')}>
            <span className="nav-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>
            </span>
            <span className="nav-label">Transactions</span>
          </NavLink>

          <NavLink to="/admin/loans" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile} onMouseEnter={() => handlePreload('/admin/loans')} onTouchStart={() => handlePreload('/admin/loans')}>
            <span className="nav-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg>
            </span>
            <span className="nav-label">Loans</span>
          </NavLink>

          <div className="nav-section-label">Security</div>

          <NavLink to="/admin/kyc" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile} onMouseEnter={() => handlePreload('/admin/kyc')} onTouchStart={() => handlePreload('/admin/kyc')}>
            <span className="nav-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><polyline points="16 11 17.5 12.5 21 9" /></svg>
            </span>
            <span className="nav-label">KYC Verification</span>
            <span className="nav-badge" id="kyc-badge">5</span>
          </NavLink>

          <NavLink to="/admin/change-requests" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile} onMouseEnter={() => handlePreload('/admin/change-requests')} onTouchStart={() => handlePreload('/admin/change-requests')}>
            <span className="nav-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </span>
            <span className="nav-label">Change Requests</span>
          </NavLink>

          <div className="nav-section-label">System</div>
          
          <NavLink to="/admin/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile} onMouseEnter={() => handlePreload('/admin/settings')} onTouchStart={() => handlePreload('/admin/settings')}>
            <span className="nav-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </span>
            <span className="nav-label">Settings</span>
          </NavLink>
        </div>

        <div className="sidebar-bottom" style={{ padding: '0 24px 20px 24px', marginTop: 'auto' }}>
          <div 
            className="nav-item" 
            onClick={handleLogout}
            style={{ color: '#ef4444', cursor: 'pointer' }}
          >
            <span className="nav-icon text-red-500">
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </span>
            <span className="nav-label font-medium">Log Out</span>
          </div>
        </div>

        <div className="sidebar-footer" onClick={() => { navigate('/admin/settings'); onCloseMobile(); }}>
          <div className="avatar">CA</div>
          <div className="user-info">
            <div className="user-name">Credify Admin</div>
            <div className="user-role">Admin</div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default AdminSidebar;
