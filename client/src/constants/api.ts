export const API_ROUTES = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    OAUTH_REGISTER: '/auth/oauth/register',
    GOOGLE_LOGIN: '/auth/oauth/google/login',
    ORCID_LOGIN: '/auth/oauth/orcid/login',
  },
  
  // Mentor endpoints
  MENTORS: {
    LIST: '/mentors',
    GLOBE: '/mentors/globe',
    PROFILE: '/mentors/me',
    DETAIL: (id: string) => `/mentors/${id}`,
  },
  
  // Admin endpoints
  ADMIN: {
    LIST_MENTORS: '/admin/mentors',
    PENDING_MENTORS: '/admin/mentors/pending',
    APPROVE_MENTOR: (id: string) => `/admin/mentors/${id}/approve`,
    REJECT_MENTOR: (id: string) => `/admin/mentors/${id}/reject`,
  },
} as const;

export const DEFAULT_PAGE_SIZE = 10;

export const AUTH_STORAGE_KEY = 'token';

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  DEFAULT: 'An unexpected error occurred. Please try again later.',
} as const; 