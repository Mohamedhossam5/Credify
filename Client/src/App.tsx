import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { useDynamicTitle } from './hooks/useDynamicTitle';
import { queryClient } from './lib/queryClient';
import ScrollToTop from './components/shared/ScrollToTop';

// Keep Layouts static (CRITICAL UI SHELLS)
import AuthLayout from './pages/auth/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Lazy load Pages ONLY
const Landing = React.lazy(() => import('./pages/landing/Landing'));
const AboutPage = React.lazy(() => import('./pages/landing/AboutPage'));
const PaymentsPage = React.lazy(() => import('./pages/landing/PaymentsPage'));
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Transactions = React.lazy(() => import('./pages/dashboard/Transactions'));
const TransfersPage = React.lazy(() => import('./pages/dashboard/TransfersPage'));
const BillPaymentPage = React.lazy(() => import('./pages/dashboard/BillPaymentPage'));
const DonationsPage = React.lazy(() => import('./pages/dashboard/DonationsPage'));
const AccountsPage = React.lazy(() => import('./pages/dashboard/AccountsPage'));
const ExchangePage = React.lazy(() => import('./pages/dashboard/ExchangePage'));
const SettingsPage = React.lazy(() => import('./pages/dashboard/SettingsPage'));
const LoansPage = React.lazy(() => import('./pages/dashboard/LoansPage'));
const PendingApprovalPage = React.lazy(() => import('./pages/auth/PendingApprovalPage'));
const RejectedPage = React.lazy(() => import('./pages/auth/RejectedPage'));

// Lazy load Admin Pages ONLY
const AdminDashboardPage = React.lazy(() => import('./pages/admin/dashboard/AdminDashboardPage'));
const AccountsAdminPage = React.lazy(() => import('./pages/admin/accounts/AccountsAdminPage'));
const TransactionsAdminPage = React.lazy(() => import('./pages/admin/transactions/TransactionsAdminPage'));
const AdminFraudPage = React.lazy(() => import('./pages/admin/fraud/AdminFraudPage'));
const KYCPage = React.lazy(() => import('./pages/admin/kyc/KYCPage'));
const SettingsAdminPage = React.lazy(() => import('./pages/admin/settings/SettingsAdminPage'));
const LoansAdminPage = React.lazy(() => import('./pages/admin/loans/LoansAdminPage'));

import { realtime } from './lib/realtime';

// Lightweight Fallback Spinner
const PageLoader = () => (
  <div className="w-full h-[50vh] flex items-center justify-center bg-transparent">
    <div className="w-8 h-8 border-4 border-[rgba(16,185,129,0.2)] border-t-[#10b981] rounded-full animate-spin"></div>
  </div>
);
const AppContent: React.FC = () => {
  useDynamicTitle();

  React.useEffect(() => {
    realtime.init();
  }, []);

  return (
    <Routes>
      {/* Public routes — keep outer Suspense for first load */}
      <Route path="/" element={<Suspense fallback={<PageLoader />}><Landing /></Suspense>} />
      <Route path="/about" element={<Suspense fallback={<PageLoader />}><AboutPage /></Suspense>} />
      <Route path="/payments" element={<Suspense fallback={<PageLoader />}><PaymentsPage /></Suspense>} />
      <Route path="/login" element={<AuthLayout />} />
      <Route path="/register" element={<AuthLayout />} />
      <Route path="/pending-approval" element={<Suspense fallback={<PageLoader />}><PendingApprovalPage /></Suspense>} />
      <Route path="/rejected" element={<Suspense fallback={<PageLoader />}><RejectedPage /></Suspense>} />

      {/* Dashboard Routes — layout stays mounted, only <Outlet> swaps */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="/transactions" element={<Suspense fallback={<PageLoader />}><Transactions /></Suspense>} />
        <Route path="/transfers" element={<Suspense fallback={<PageLoader />}><TransfersPage /></Suspense>} />
        <Route path="/bill-payment" element={<Suspense fallback={<PageLoader />}><BillPaymentPage /></Suspense>} />
        <Route path="/donations" element={<Suspense fallback={<PageLoader />}><DonationsPage /></Suspense>} />
        <Route path="/accounts" element={<Suspense fallback={<PageLoader />}><AccountsPage /></Suspense>} />
        <Route path="/exchange" element={<Suspense fallback={<PageLoader />}><ExchangePage /></Suspense>} />
        <Route path="/loans" element={<Suspense fallback={<PageLoader />}><LoansPage /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
      </Route>

      {/* Admin Routes — layout stays mounted, only <Outlet> swaps */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense>} />
        <Route path="accounts" element={<Suspense fallback={<PageLoader />}><AccountsAdminPage /></Suspense>} />
        <Route path="transactions" element={<Suspense fallback={<PageLoader />}><TransactionsAdminPage /></Suspense>} />
        <Route path="fraud" element={<Suspense fallback={<PageLoader />}><AdminFraudPage /></Suspense>} />
        <Route path="kyc" element={<Suspense fallback={<PageLoader />}><KYCPage /></Suspense>} />
        <Route path="loans" element={<Suspense fallback={<PageLoader />}><LoansAdminPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsAdminPage /></Suspense>} />
      </Route>
    </Routes>
  );
};



const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster position="top-right" />
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;