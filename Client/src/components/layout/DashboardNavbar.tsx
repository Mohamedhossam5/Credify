import React from 'react';
import { useLocation } from 'react-router-dom';

interface DashboardNavbarProps {
  onToggleSidebar: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const pageId = location.pathname.split('/')[1] || 'dashboard';

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

  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    html.setAttribute("data-theme", isDark ? "light" : "dark");
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
        <div className="icon-btn relative text-[var(--text-primary)]">
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
          <div className="notification-dot"></div>
        </div>
        <div className="avatar">MH</div>
      </div>
    </div>
  );
};

export default DashboardNavbar;
