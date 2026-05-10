import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useDynamicTitle } from './hooks/useDynamicTitle';

// Keep Layouts static (CRITICAL UI SHELLS)
import AuthLayout from './pages/auth/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Lazy load Pages ONLY
const Landing = React.lazy(() => import('./pages/landing/Landing'));
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Transactions = React.lazy(() => import('./pages/dashboard/Transactions'));
const TransfersPage = React.lazy(() => import('./pages/dashboard/TransfersPage'));
const AccountsPage = React.lazy(() => import('./pages/dashboard/AccountsPage'));
const ExchangePage = React.lazy(() => import('./pages/dashboard/ExchangePage'));
const SettingsPage = React.lazy(() => import('./pages/dashboard/SettingsPage'));

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
        <Route path="/login" element={<AuthLayout />} />
        <Route path="/register" element={<AuthLayout />} />

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

// Create a centralized error handler for React Query
const handleQueryError = (error: any) => {
  // Since we normalized the error in Axios, `error` is now an ApiError
  const message = error?.message || 'An unexpected error occurred while fetching data.';
  
  // Prevent showing duplicate toasts for 401 (already handled in Axios interceptor)
  if (error?.status !== 401) {
    toast.error(message, { id: 'query-error' }); // Use ID to prevent duplicate toasts
  }
};

// Create a client with global error handling
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleQueryError,
  }),
  mutationCache: new MutationCache({
    onError: handleQueryError,
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents aggressive refetching during development
      retry: 1, // Retry failed requests once
      staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppContent />
      </BrowserRouter>
      {/* Devtools will only be visible in development */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
};

export default App;