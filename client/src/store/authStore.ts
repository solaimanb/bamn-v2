import { create } from 'zustand';
import { MentorResponse, User } from '../types/api';

export type AuthenticatedUser = User | MentorResponse;

interface AuthState {
  user: AuthenticatedUser | null;
  loading: boolean;
  error: string | null;
  setAuth: (user: AuthenticatedUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isAdmin: () => boolean;
  isMentor: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  setAuth: (user) => set({ user, loading: false, error: null }),
  logout: () => set({ user: null, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  isAdmin: () => {
    const { user } = get();
    return Boolean(user && user.role === 'admin');
  },
  isMentor: () => {
    const { user } = get();
    return Boolean(user && user.role === 'mentor');
  },
})); 