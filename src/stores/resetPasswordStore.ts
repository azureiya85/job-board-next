import { create } from 'zustand';

export type PageState = 'request_form' | 'request_submitted' | 'reset_form' | 'reset_success' | 'reset_error';

interface ResetPasswordState {
  pageState: PageState;
  isLoading: boolean;
  serverMessage: string | null;
  token: string | null;
  
  // Actions
  setPageState: (state: PageState) => void;
  setIsLoading: (loading: boolean) => void;
  setServerMessage: (message: string | null) => void;
  setToken: (token: string | null) => void;
  resetState: () => void;
}

export const useResetPasswordStore = create<ResetPasswordState>((set) => ({
  pageState: 'request_form',
  isLoading: false,
  serverMessage: null,
  token: null,
  
  setPageState: (state) => set({ pageState: state }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setServerMessage: (message) => set({ serverMessage: message }),
  setToken: (token) => set({ token }),
  resetState: () => set({
    pageState: 'request_form',
    isLoading: false,
    serverMessage: null,
    token: null,
  }),
}));