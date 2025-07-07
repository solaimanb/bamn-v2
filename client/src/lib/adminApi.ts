import api from './api';
import { API_ROUTES } from '../constants/api';
import { MentorResponse } from '../types/api';

export async function listAllMentors(status?: 'pending' | 'approved' | 'rejected'): Promise<MentorResponse[]> {
  const params = status ? { status } : undefined;
  return api.get(API_ROUTES.ADMIN.LIST_MENTORS, { params });
}

export async function listPendingMentors(): Promise<MentorResponse[]> {
  return api.get(API_ROUTES.ADMIN.PENDING_MENTORS);
}

export async function approveMentor(mentorId: string): Promise<MentorResponse> {
  return api.put(API_ROUTES.ADMIN.APPROVE_MENTOR(mentorId));
}

export async function rejectMentor(mentorId: string): Promise<MentorResponse> {
  return api.put(API_ROUTES.ADMIN.REJECT_MENTOR(mentorId));
} 