import { create } from 'zustand';

export type Mentor = {
  id: string;
  email: string;
  full_name: string;
  profile_picture_url?: string | null;
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
  linkedin_url?: string | null;
  moderation_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string | null;
};

export type AuditLogEntry = {
  id: string;
  action: string;
  timestamp: string;
  user: string;
};

interface AdminState {
  pendingMentors: Mentor[];
  auditLog: AuditLogEntry[];
  setPendingMentors: (mentors: Mentor[]) => void;
  setAuditLog: (log: AuditLogEntry[]) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  pendingMentors: [],
  auditLog: [],
  setPendingMentors: (mentors) => set({ pendingMentors: mentors }),
  setAuditLog: (log) => set({ auditLog: log }),
})); 