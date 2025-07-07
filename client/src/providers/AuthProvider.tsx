'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getUser } from '@/lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const user = getUser();
    if (user) {
      setAuth(user);
    }
  }, [setAuth]);

  return <>{children}</>;
} 