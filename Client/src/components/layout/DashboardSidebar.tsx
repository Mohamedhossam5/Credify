import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Preload map: hovering a sidebar item triggers the lazy-loaded chunk to download
const preloadMap: Record<string, () => void> = {
  '/dashboard': () => import('../../pages/dashboard/Dashboard'),
  '/transactions': () => import('../../pages/dashboard/Transactions'),
  '/transfers': () => import('../../pages/dashboard/TransfersPage'),
  '/bill-payment': () => import('../../pages/dashboard/BillPaymentPage'),
  '/accounts': () => import('../../pages/dashboard/AccountsPage'),
  '/exchange': () => import('../../pages/dashboard/ExchangePage'),
  '/settings': () => import('../../pages/dashboard/SettingsPage'),
};

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handlePreload = useCallback((path: string) => {
    preloadMap[path]?.();
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      onClose(); // Close sidebar on mobile after navigation
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div
        className="overlay"
        id="overlay"
        style={{ display: isOpen ? 'block' : 'none' }}
        onClick={onClose}
      ></div>

      <aside id="sidebar" className={isOpen ? 'open' : ''}>
        <div className="sidebar-logo">
          <div><img src="/1.svg" width="40px" alt="Credify" /></div>
          <span className="logo-text">Credify</span>
        </div>

        <nav className="nav-section">
          <div className="nav-group-label">Overview</div>

          <div
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigate('/dashboard')}
            onMouseEnter={() => handlePreload('/dashboard')}
            onTouchStart={() => handlePreload('/dashboard')}
          >
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="7" height="7" rx="2" />
              <rect x="14" y="3" width="7" height="7" rx="2" />
              <rect x="3" y="14" width="7" height="7" rx="2" />
              <rect x="14" y="14" width="7" height="7" rx="2" />
            </svg>
            Dashboard
          </div>

          <div
            className={`nav-item ${location.pathname === '/transactions' ? 'active' : ''}`}
            onClick={() => handleNavigate('/transactions')}
            onMouseEnter={() => handlePreload('/transactions')}
            onTouchStart={() => handlePreload('/transactions')}
          >
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
            Transactions
          </div>

          <div className="nav-divider"></div>

          <div className="nav-group-label">Actions</div>

          <div
            className={`nav-item ${location.pathname === '/transfers' ? 'active' : ''}`}
            onClick={() => handleNavigate('/transfers')}
            onMouseEnter={() => handlePreload('/transfers')}
            onTouchStart={() => handlePreload('/transfers')}
          >
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Transfers
          </div>

          <div
            className={`nav-item ${location.pathname === '/bill-payment' ? 'active' : ''}`}
            onClick={() => handleNavigate('/bill-payment')}
            onMouseEnter={() => handlePreload('/bill-payment')}
            onTouchStart={() => handlePreload('/bill-payment')}
          >
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            Bill Payment
          </div>

          <div
            className={`nav-item ${location.pathname === '/donations' ? 'active' : ''}`}
            onClick={() => handleNavigate('/donations')}
            onMouseEnter={() => handlePreload('/donations')}
            onTouchStart={() => handlePreload('/donations')}
          >
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Donations
          </div>

          <div
            className={`nav-item ${location.pathname === '/accounts' ? 'active' : ''}`}
            onClick={() => handleNavigate('/accounts')}
            onMouseEnter={() => handlePreload('/accounts')}
            onTouchStart={() => handlePreload('/accounts')}
          >
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <rect x="1" y="4" width="22" height="16" rx="3" />
              <path d="M1 10h22" />
            </svg>
            Cards & Accounts
          </div>

          <div
            className={`nav-item ${location.pathname === '/exchange' ? 'active' : ''}`}
            onClick={() => handleNavigate('/exchange')}
            onMouseEnter={() => handlePreload('/exchange')}
            onTouchStart={() => handlePreload('/exchange')}
          >
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Exchange Rates
          </div>

          <div className="nav-divider"></div>

          <div className="nav-group-label">Account</div>

          <div
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => handleNavigate('/settings')}
            onMouseEnter={() => handlePreload('/settings')}
            onTouchStart={() => handlePreload('/settings')}
          >
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="logout-btn" onClick={handleLogout}>
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Log Out
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
