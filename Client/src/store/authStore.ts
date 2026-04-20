import { create } from 'zustand';
import { type RegisterStep1Data, type RegisterStep2Data } from '../schemas/auth';

type KycState = 'idle' | 'processing' | 'approved' | 'rejected';

interface AuthState {
  step1Data: RegisterStep1Data | null;
  step2Data: RegisterStep2Data | null;
  currentStep: number;
  kycState: KycState;
  
  setStep1Data: (data: RegisterStep1Data) => void;
  setStep2Data: (data: RegisterStep2Data) => void;
  setCurrentStep: (step: number) => void;
  setKycState: (state: KycState) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  step1Data: null,
  step2Data: null,
  currentStep: 1,
  kycState: 'idle',
  
  setStep1Data: (data) => set({ step1Data: data }),
  setStep2Data: (data) => set({ step2Data: data }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setKycState: (state) => set({ kycState: state }),
  reset: () => set({ step1Data: null, step2Data: null, currentStep: 1, kycState: 'idle' }),
}));
