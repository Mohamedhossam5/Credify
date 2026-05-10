import { useAuthStore } from '../store/authStore';

// Re-export the store as a hook for backward compatibility.
// Components that used `const { login, logout, isAuthenticated } = useAuth()` will keep working.
export const useAuth = () => {
  const { isAuthenticated, login, logout, token, user, setSession, clearSession } = useAuthStore();
  return { isAuthenticated, login, logout, token, user, setSession, clearSession };
};
