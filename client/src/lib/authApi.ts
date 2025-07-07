import api from './api';
import { API_ROUTES, AUTH_STORAGE_KEY } from '../constants/api';
import { User } from '../types/api';

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

// Email/Password Authentication
export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await api.post(API_ROUTES.AUTH.LOGIN, formData) as LoginResponse;
  localStorage.setItem(AUTH_STORAGE_KEY, response.access_token);
  return response;
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

export async function loginWithGoogle(token: string): Promise<LoginResponse> {
  const response = await api.post(API_ROUTES.AUTH.GOOGLE_LOGIN, { google_token: token }) as LoginResponse;
  localStorage.setItem(AUTH_STORAGE_KEY, response.access_token);
  return response;
}

export async function loginWithOrcid(token: string): Promise<LoginResponse> {
  const response = await api.post(API_ROUTES.AUTH.ORCID_LOGIN, { orcid_token: token }) as LoginResponse;
  localStorage.setItem(AUTH_STORAGE_KEY, response.access_token);
  return response;
}

// Token Management
export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEY);
}

export function clearStoredToken(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export async function getCurrentUser(): Promise<User> {
  return api.get(API_ROUTES.MENTORS.PROFILE) as Promise<User>;
} 