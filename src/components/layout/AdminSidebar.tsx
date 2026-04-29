import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, mobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();

  return (
    <>
      <div 
        id="admin-sidebar-overlay" 
        className={mobileOpen ? 'open' : ''} 
        onClick={onCloseMobile}
      ></div>

      <nav id="admin-sidebar" className={`${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="#2563eb" />
              <path d="M10 18C10 13.58 13.58 10 18 10C20.21 10 22.21 10.9 23.66 12.34L21.54 14.46C20.65 13.57 19.39 13 18 13C15.24 13 13 15.24 13 18C13 20.76 15.24 23 18 23C19.39 23 20.65 22.43 21.54 21.54L23.66 23.66C22.21 25.1 20.21 26 18 26C13.58 26 10 22.42 10 18Z" fill="white" />
            </svg>
          </div>
          <span className="logo-text">Credify</span>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section-label">Overview</div>
          
          <NavLink to="/admin/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <span className="nav-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
            </span>
            <span className="nav-label">Admin Dashboard</span>
          </NavLink>

          <div className="nav-section-label">Finance</div>
          
          <NavLink to="/admin/accounts" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <span className="nav-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </span>
            <span className="nav-label">Accounts</span>
          </NavLink>

          <NavLink to="/admin/transactions" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <span className="nav-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>
            </span>
            <span className="nav-label">Transactions</span>
          </NavLink>

          <div className="nav-section-label">Security</div>
          
          <NavLink to="/admin/fraud" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <span className="nav-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </span>
            <span className="nav-label">Fraud Detection</span>
            <span className="nav-badge" id="fraud-badge">3</span>
          </NavLink>

          <NavLink to="/admin/kyc" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <span className="nav-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><polyline points="16 11 17.5 12.5 21 9" /></svg>
            </span>
            <span className="nav-label">KYC Verification</span>
            <span className="nav-badge" id="kyc-badge">5</span>
          </NavLink>

          <div className="nav-section-label">System</div>
          
          <NavLink to="/admin/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <span className="nav-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </span>
            <span className="nav-label">Settings</span>
          </NavLink>
        </div>

        <div className="sidebar-footer" onClick={() => { navigate('/admin/settings'); onCloseMobile(); }}>
          <div className="avatar">MN</div>
          <div className="user-info">
            <div className="user-name">Mahmoud Nady</div>
            <div className="user-role">Admin</div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default AdminSidebar;
