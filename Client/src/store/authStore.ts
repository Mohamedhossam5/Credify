import { create } from 'zustand';
import { type RegisterStep1Data, type RegisterStep2Data } from '../schemas/auth';
import { type UserData } from '../services/auth.service';

type KycState = 'idle' | 'processing' | 'approved' | 'rejected';

// ─── Onboarding steps ────────────────────────────────────────
// 1 = personal details, 2 = security/credentials,
// 3 = phone verification, 4 = email verification, 5 = KYC upload
type OnboardingStep = 1 | 2 | 3 | 4 | 5;

interface AuthState {
  // Registration wizard
  step1Data: RegisterStep1Data | null;
  step2Data: RegisterStep2Data | null;
  currentStep: OnboardingStep;
  kycState: KycState;

  // Session
  token: string | null;
  user: UserData | null;
  isAuthenticated: boolean;

  // Login OTP
  loginEmail: string | null;
  otpRequired: boolean;

  // Actions — registration
  setStep1Data: (data: RegisterStep1Data) => void;
  setStep2Data: (data: RegisterStep2Data) => void;
  setCurrentStep: (step: OnboardingStep) => void;
  setKycState: (state: KycState) => void;

  // Actions — session
  setSession: (token: string, user: UserData) => void;
  setUser: (user: UserData) => void;
  clearSession: () => void;

  // Actions — login OTP
  setOtpRequired: (email: string) => void;
  clearOtp: () => void;

  // Convenience
  login: () => void;
  logout: () => void;
  reset: () => void;
}

// Hydrate token from localStorage on startup
const storedToken = localStorage.getItem('credify_token');
const storedUser = (() => {
  try {
    const raw = localStorage.getItem('credify_user');
    return raw ? (JSON.parse(raw) as UserData) : null;
  } catch {
    return null;
  }
})();

export const useAuthStore = create<AuthState>((set) => ({
  // Registration wizard
  step1Data: null,
  step2Data: null,
  currentStep: 1,
  kycState: 'idle',

  // Session — hydrated from localStorage
  token: storedToken,
  user: storedUser,
  isAuthenticated: !!storedToken,

  // Login OTP
  loginEmail: null,
  otpRequired: false,

  // ── Registration actions ───────────────────────────────────
  setStep1Data: (data) => set({ step1Data: data }),
  setStep2Data: (data) => set({ step2Data: data }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setKycState: (state) => set({ kycState: state }),

  // ── Session actions ────────────────────────────────────────
  setSession: (token, user) => {
    localStorage.setItem('credify_token', token);
    localStorage.setItem('credify_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  setUser: (user) => {
    localStorage.setItem('credify_user', JSON.stringify(user));
    set({ user });
  },

  clearSession: () => {
    localStorage.removeItem('credify_token');
    localStorage.removeItem('credify_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  // ── Login OTP actions ──────────────────────────────────────
  setOtpRequired: (email) => set({ loginEmail: email, otpRequired: true }),
  clearOtp: () => set({ loginEmail: null, otpRequired: false }),

  // ── Convenience ────────────────────────────────────────────
  login: () => set({ isAuthenticated: true }),
  logout: () => {
    localStorage.removeItem('credify_token');
    localStorage.removeItem('credify_user');
    set({ token: null, user: null, isAuthenticated: false, loginEmail: null, otpRequired: false });
  },
  reset: () => set({
    step1Data: null, step2Data: null, currentStep: 1 as OnboardingStep, kycState: 'idle',
  }),
}));
