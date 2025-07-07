import api from './api';
import { API_ROUTES, AUTH_STORAGE_KEY } from '../constants/api';
import { User } from '../types/api';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { getUser } from './auth';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  current_role: string;
  institution: string;
  department: string;
  degrees: string[];
  research_interests: string[];
  continent: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface OAuthRegisterData extends Omit<RegisterData, 'password'> {
  auth_provider: 'google' | 'orcid';
  google_id?: string;
  orcid_id?: string;
}

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  user: User;
}

const cookieOptions = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const
};

// Email/Password Authentication
export async function login(email: string, password: string): Promise<User> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await api.post(API_ROUTES.AUTH.LOGIN, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }) as LoginResponse;

  const decoded = jwtDecode<JwtPayload>(response.access_token);
  const expires = new Date(decoded.exp * 1000);
  
  Cookies.set(AUTH_STORAGE_KEY, response.access_token, {
    ...cookieOptions,
    expires
  });
  
  return decoded.user;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await api.post(API_ROUTES.AUTH.REGISTER, data);
  return response.data as AuthResponse;
}

// OAuth Authentication
export async function registerWithOAuth(data: OAuthRegisterData): Promise<AuthResponse> {
  const response = await api.post(API_ROUTES.AUTH.OAUTH_REGISTER, data);
  return response.data as AuthResponse;
}

export async function loginWithGoogle(token: string): Promise<User> {
  const response = await api.post(API_ROUTES.AUTH.GOOGLE_LOGIN, { google_token: token }) as LoginResponse;
  
  const decoded = jwtDecode<JwtPayload>(response.access_token);
  const expires = new Date(decoded.exp * 1000);
  
  Cookies.set(AUTH_STORAGE_KEY, response.access_token, {
    ...cookieOptions,
    expires
  });
  
  return decoded.user;
}

export async function loginWithOrcid(token: string): Promise<User> {
  const response = await api.post(API_ROUTES.AUTH.ORCID_LOGIN, { orcid_token: token }) as LoginResponse;
  
  const decoded = jwtDecode<JwtPayload>(response.access_token);
  const expires = new Date(decoded.exp * 1000);
  
  Cookies.set(AUTH_STORAGE_KEY, response.access_token, {
    ...cookieOptions,
    expires
  });
  
  return decoded.user;
}

// Token Management
export function getStoredToken(): string | null {
  return Cookies.get(AUTH_STORAGE_KEY) || null;
}

export function clearStoredToken(): void {
  Cookies.remove(AUTH_STORAGE_KEY, cookieOptions);
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export function getCurrentUser(): User | null {
  return getUser() as User | null;
}

