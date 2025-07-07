import { jwtDecode } from 'jwt-decode';
import { redirect } from 'next/navigation';
import type { User, MentorResponse } from '@/types/api';
import { AUTH_STORAGE_KEY } from '@/constants/api';
import Cookies from 'js-cookie';

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  user: User | MentorResponse;
}

export function getUser() {
  const token = Cookies.get(AUTH_STORAGE_KEY);
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp * 1000 < Date.now()) {
      Cookies.remove(AUTH_STORAGE_KEY);
      return null;
    }
    return decoded.user;
  } catch {
    Cookies.remove(AUTH_STORAGE_KEY);
    return null;
  }
}

export function protectClientPage() {
  const user = getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export function protectClientAdminPage() {
  const user = getUser();

  if (!user) {
    redirect('/login');
    return null;
  }

  if (user.role !== 'admin') {
    redirect('/forbidden');
    return null;
  }

  return user;
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp * 1000 < Date.now()) {
      throw new Error('Token expired');
    }
    return {
      id: decoded.user.id,
      role: decoded.user.role,
      full_name: decoded.user.full_name,
    };
  } catch {
    throw new Error('Invalid token');
  }
} 