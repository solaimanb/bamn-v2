import { create } from 'zustand';
import { MentorResponse, User } from '../types/api';

export type AuthenticatedUser = User | MentorResponse;

interface AuthState {
  user: AuthenticatedUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (user: AuthenticatedUser, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isAdmin: () => boolean;
  isMentor: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  login: (user, token) => set({ user, token, loading: false, error: null }),
  logout: () => set({ user: null, token: null, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  isAdmin: () => {
    const { user } = get();
    return Boolean(user && 'role' in user && user.role === 'admin');
  },
  isMentor: () => {
    const { user } = get();
    return Boolean(user && 'moderation_status' in user);
  },
})); 