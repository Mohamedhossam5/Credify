import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import toast from 'react-hot-toast';

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
export const queryClient = new QueryClient({
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
