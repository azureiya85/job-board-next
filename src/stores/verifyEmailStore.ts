import { create } from 'zustand';

export type VerificationStatus = 'pending' | 'success' | 'error' | 'verifying';

interface VerifyEmailState {
  verificationStatus: VerificationStatus;
  countdown: number;
  isResending: boolean;
  pendingEmail: string | null;
  errorMessage: string;
  token: string | null;
  
  // Actions
  setVerificationStatus: (status: VerificationStatus) => void;
  setCountdown: (count: number) => void;
  setIsResending: (resending: boolean) => void;
  setPendingEmail: (email: string | null) => void;
  setErrorMessage: (message: string) => void;
  setToken: (token: string | null) => void;
  decrementCountdown: () => void;
  resetCountdown: (count?: number) => void;
  resetState: () => void;
}

export const useVerifyEmailStore = create<VerifyEmailState>((set, get) => ({
  verificationStatus: 'pending',
  countdown: 30,
  isResending: false,
  pendingEmail: null,
  errorMessage: '',
  token: null,
  
  setVerificationStatus: (status) => set({ verificationStatus: status }),
  setCountdown: (count) => set({ countdown: count }),
  setIsResending: (resending) => set({ isResending: resending }),
  setPendingEmail: (email) => set({ pendingEmail: email }),
  setErrorMessage: (message) => set({ errorMessage: message }),
  setToken: (token) => set({ token }),
  
  decrementCountdown: () => {
    const currentCount = get().countdown;
    if (currentCount > 0) {
      set({ countdown: currentCount - 1 });
    }
  },
  
  resetCountdown: (count = 30) => set({ countdown: count }),
  
  resetState: () => set({
    verificationStatus: 'pending',
    countdown: 30,
    isResending: false,
    pendingEmail: null,
    errorMessage: '',
    token: null,
  }),
}));