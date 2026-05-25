import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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
const AccountsPage = React.lazy(() => import('./pages/dashboard/AccountsPage'));
const ExchangePage = React.lazy(() => import('./pages/dashboard/ExchangePage'));
const SettingsPage = React.lazy(() => import('./pages/dashboard/SettingsPage'));
const PendingApprovalPage = React.lazy(() => import('./pages/auth/PendingApprovalPage'));
const RejectedPage = React.lazy(() => import('./pages/auth/RejectedPage'));

// Lazy load Admin Pages ONLY
const AdminDashboardPage = React.lazy(() => import('./pages/admin/dashboard/AdminDashboardPage'));
const AccountsAdminPage = React.lazy(() => import('./pages/admin/accounts/AccountsAdminPage'));
const TransactionsAdminPage = React.lazy(() => import('./pages/admin/transactions/TransactionsAdminPage'));
const AdminFraudPage = React.lazy(() => import('./pages/admin/fraud/AdminFraudPage'));
const KYCPage = React.lazy(() => import('./pages/admin/kyc/KYCPage'));
const SettingsAdminPage = React.lazy(() => import('./pages/admin/settings/SettingsAdminPage'));

// Lightweight Fallback Spinner
const PageLoader = () => (
  <div className="w-full h-[50vh] flex items-center justify-center bg-transparent">
    <div className="w-8 h-8 border-4 border-[rgba(16,185,129,0.2)] border-t-[#10b981] rounded-full animate-spin"></div>
  </div>
);
const AppContent: React.FC = () => {
  useDynamicTitle();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/login" element={<AuthLayout />} />
        <Route path="/register" element={<AuthLayout />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/rejected" element={<RejectedPage />} />

        {/* Dashboard Routes (Protected) */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          {/* Phase 2 Routes */}
          <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/accounts" element={<AccountsPage />} />

          {/* Phase 3 Routes */}
          <Route path="/exchange" element={<ExchangePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Admin Dashboard Routes (Protected) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="accounts" element={<AccountsAdminPage />} />
          <Route path="transactions" element={<TransactionsAdminPage />} />
          <Route path="fraud" element={<AdminFraudPage />} />
          <Route path="kyc" element={<KYCPage />} />
          <Route path="settings" element={<SettingsAdminPage />} />
        </Route>
      </Routes>
    </Suspense>
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
      {/* Devtools will only be visible in development */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
};

export default App;