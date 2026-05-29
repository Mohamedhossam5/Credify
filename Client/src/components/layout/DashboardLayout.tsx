import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import '../../styles/dashboard.css';
import '../../styles/phase2.css';
import '../../styles/phase3.css';

const DashboardLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);



  if (!isAuthenticated) return null;

  // ── Admin Guard ──
  // Admins must never land on the user dashboard — redirect them to their own.
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace state={{ bypassAuth: true }} />;
  }

  // ── KYC Approval Guard ──
  // Regular users must have APPROVED KYC.
  const kycApproved = user?.kycStatus === 'APPROVED';

  if (!kycApproved) {
    const kycStatus = user?.kycStatus || 'PENDING';

    if (kycStatus === 'PENDING_ADMIN_REVIEW') {
      return <Navigate to="/pending-approval" replace />;
    }

    if (kycStatus === 'REJECTED') {
      return <Navigate to="/rejected" replace />;
    }

    // PENDING — send to register to complete onboarding
    const step = !user?.phoneVerified ? 3 : !user?.emailVerified ? 4 : 5;
    useAuthStore.getState().setCurrentStep(step as any);
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="dashboard-root">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main id="main">
        <DashboardNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default DashboardLayout;

