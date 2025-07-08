import api from './api';
import { API_ROUTES, DEFAULT_PAGE_SIZE } from '../constants/api';
import { MentorFilters, PaginatedResponse, PaginationParams, MentorResponse, GlobeVisualization } from '../types/api';

export interface GlobeMentor {
  id: string;
  full_name: string;
  research_interests: string[];
  latitude: number;
  longitude: number;
}

export async function listMentors(
  filters?: MentorFilters,
  pagination: PaginationParams = { page: 1, page_size: DEFAULT_PAGE_SIZE }
): Promise<PaginatedResponse<MentorResponse>> {
  const params = {
    ...pagination,
    ...filters,
  };
  return api.get(API_ROUTES.MENTORS.LIST, { params });
}

export async function getMentorGlobeData(researchInterests?: string[]): Promise<GlobeVisualization[]> {
  const params = researchInterests ? { research_interests: researchInterests } : undefined;
  return api.get(API_ROUTES.MENTORS.GLOBE, { params });
}

export async function getOwnProfile(): Promise<MentorResponse> {
  return api.get(API_ROUTES.MENTORS.PROFILE);
}

export async function updateOwnProfile(data: Partial<MentorResponse>): Promise<MentorResponse> {
  return api.put(API_ROUTES.MENTORS.PROFILE, data);
} 