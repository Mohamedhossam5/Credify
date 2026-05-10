import { api } from '../lib/api';

// ─── Types ───────────────────────────────────────────────────

export interface RegisterPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE';
  idNumber: string;
  birthdate: string;
  address?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface UserData {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  kycStatus: string;
  role: string;
  account?: {
    accountId: string;
    balance: number;
  } | null;
}

export interface RegisterResponse {
  message: string;
  user: UserData;
  token: string;
  nextStep: string;
}

export interface LoginResponse {
  message: string;
  otpRequired: boolean;
  email?: string;
  token?: string;
  user?: UserData;
}

export interface VerifyOtpResponse {
  message: string;
  user: UserData;
  token: string;
}

export interface VerificationStatusResponse {
  phoneVerified: boolean;
  emailVerified: boolean;
  nextStep: string | null;
}

// ─── API Calls ───────────────────────────────────────────────

export const authService = {
  /** Step 1 of registration: create user account */
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await api.post<RegisterResponse>('/auth/register', payload);
    return data;
  },

  /** Step 1 of login: validate credentials → triggers OTP email */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  /** Step 2 of login: verify the emailed OTP → get JWT + user */
  verifyOtp: async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    const { data } = await api.post<VerifyOtpResponse>('/auth/verify-otp', payload);
    return data;
  },

  /** Resend login OTP */
  resendOtp: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/resend-otp', { email });
    return data;
  },

  /** Send phone verification OTP (requires auth token) */
  sendPhoneOtp: async (): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/send-phone-otp');
    return data;
  },

  /** Verify phone OTP */
  verifyPhone: async (otp: string): Promise<{ message: string; phoneVerified: boolean; nextStep: string }> => {
    const { data } = await api.post('/auth/verify-phone', { otp });
    return data;
  },

  /** Send email verification OTP (requires auth token) */
  sendEmailOtp: async (): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/send-email-otp');
    return data;
  },

  /** Verify email OTP */
  verifyEmail: async (otp: string): Promise<{ message: string; emailVerified: boolean; nextStep: string }> => {
    const { data } = await api.post('/auth/verify-email', { otp });
    return data;
  },

  /** Get current verification status */
  getVerificationStatus: async (): Promise<VerificationStatusResponse> => {
    const { data } = await api.get<VerificationStatusResponse>('/auth/verification-status');
    return data;
  },

  /** Get current user profile */
  getMe: async (): Promise<{ user: UserData }> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};
