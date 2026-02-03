import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null, token?: string | null) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
  logout: () => void;
  hasPermission: (requiredRole: UserRole) => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  canManageUsers: () => boolean;
}

const roleHierarchy: Record<UserRole, number> = {
  system_admin: 3,
  admin: 2,
  user: 1,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      hasHydrated: false,

      setUser: (user, token = null) => {
        set({
          user,
          token,
          isAuthenticated: !!user,
          isLoading: false,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setHasHydrated: (state) => {
        set({ hasHydrated: state, isLoading: false });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      hasPermission: (requiredRole) => {
        const { user } = get();
        if (!user) return false;
        return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
      },

      canEdit: () => {
        const { user } = get();
        if (!user) return false;
        return user.role === 'system_admin' || user.role === 'admin';
      },

      canDelete: () => {
        const { user } = get();
        if (!user) return false;
        return user.role === 'system_admin' || user.role === 'admin';
      },

      canManageUsers: () => {
        const { user } = get();
        if (!user) return false;
        return user.role === 'system_admin';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
