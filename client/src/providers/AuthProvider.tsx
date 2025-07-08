'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getUser } from '@/lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const user = getUser();
    if (user) {
      setAuth(user);
    }
    setLoading(false);
  }, [setAuth, setLoading]);

  return <>{children}</>;
} 