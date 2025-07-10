// Pagination types
export interface PaginationParams {
  page: number;
  page_size: number;
}

// Filter types
export interface MentorFilters {
  keyword?: string;
  continent?: string;
  country?: string;
  city?: string;
  research_interests?: string[];
  page?: number;
  page_size?: number;
}

interface BaseUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'mentor';
}

export interface User extends BaseUser {
  role: 'admin';
}

// Mentor types
export interface MentorBase {
  email: string;
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

export interface MentorResponse extends MentorBase {
  id: string;
  role: 'mentor';
  auth_provider: 'email' | 'google' | 'orcid';
  google_id?: string;
  orcid_id?: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface GlobeVisualization {
  id: string;
  full_name: string;
  research_interests: string[];
  latitude: number;
  longitude: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  response?: {
    status: number;
    data?: {
      detail?: string | Array<{
        msg: string;
        loc?: Array<string | number>;
        type?: string;
      }>;
      message?: string;
    };
  };
} 