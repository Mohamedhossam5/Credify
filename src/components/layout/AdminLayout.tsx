import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import '../../styles/admin.css';

const AdminLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  const location = useLocation();
  const [isBypassed, setIsBypassed] = useState(location.state?.bypassAuth === true);

  useEffect(() => {
    if (location.state?.bypassAuth) {
      setIsBypassed(true);
    }
  }, [location.state]);

  // Apply theme to html tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // If not authenticated and no bypass flag, redirect to login
  if (!isAuthenticated && !isBypassed) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="admin-body">
      <div id="admin-app">
        <AdminSidebar 
          collapsed={collapsed} 
          mobileOpen={mobileOpen} 
          onCloseMobile={() => setMobileOpen(false)} 
        />
        
        <div id="admin-main">
          <AdminNavbar 
            onToggleSidebar={toggleSidebar} 
            onToggleTheme={toggleTheme} 
            theme={theme} 
          />
          <main id="admin-content">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
