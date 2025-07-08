export interface Mentor {
  id: string;
  email: string;
  full_name: string;
  current_role: string;
  institution: string;
  department: string;
  city: string;
  country: string;
  continent: string;
  latitude: number;
  longitude: number;
  degrees: string[];
  research_interests: string[];
  auth_provider: 'email' | 'google' | 'orcid';
  google_id?: string;
  orcid_id?: string;
  linkedin_url: string | null;
  profile_picture_url: string | null;
  moderation_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
} 