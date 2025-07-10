import { create } from 'zustand';
import { MentorResponse } from '@/types/api';

export type AuditLogEntry = {
  id: string;
  action: string;
  timestamp: string;
  user: string;
};

interface AdminState {
  pendingMentors: MentorResponse[];
  auditLog: AuditLogEntry[];
  setPendingMentors: (mentors: MentorResponse[]) => void;
  setAuditLog: (log: AuditLogEntry[]) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  pendingMentors: [],
  auditLog: [],
  setPendingMentors: (mentors) => set({ pendingMentors: mentors }),
  setAuditLog: (log) => set({ auditLog: log }),
})); 