import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserRole as PrismaUserRole } from '@prisma/client'; 

interface User {
  lastName?: string;
  firstName?: string; 
  id: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  currentAddress?: string;
  role: PrismaUserRole; 
  avatar?: string;
  isVerified: boolean; 
  companyId?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User) => void; 
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      login: (user) => set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      }),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      }),

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...updates } 
          });
        }
      },
    }),
    {
      name: 'work-vault-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);