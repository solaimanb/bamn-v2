import { create } from 'zustand';
import { Mentor } from '@/types/mentor';
import { isEqual } from 'lodash';

export interface SearchParams {
  keyword?: string;
  tags?: string[];
  continent?: string;
  country?: string;
  city?: string;
}

interface SearchStore {
  mentors: Mentor[];
  isLoading: boolean;
  searchParams: SearchParams;
  shouldRefresh: boolean;
  setMentors: (mentors: Mentor[]) => void;
  setLoading: (isLoading: boolean) => void;
  setSearchParams: (params: SearchParams) => void;
  setShouldRefresh: (shouldRefresh: boolean) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  mentors: [],
  isLoading: false,
  searchParams: {},
  shouldRefresh: true,
  setMentors: (mentors) => set((state) => {
    if (isEqual(state.mentors, mentors)) return state;
    return { mentors };
  }),
  setLoading: (isLoading) => set((state) => {
    if (state.isLoading === isLoading) return state;
    return { isLoading };
  }),
  setSearchParams: (params) => set((state) => {
    const currentParams = state.searchParams;
    if (isEqual(currentParams, params)) return state;
    return {
      searchParams: params,
      shouldRefresh: true
    };
  }),
  setShouldRefresh: (shouldRefresh) => set((state) => {
    if (state.shouldRefresh === shouldRefresh) return state;
    return { shouldRefresh };
  }),
  clearSearch: () => set((state) => {
    if (!state.mentors.length && !Object.keys(state.searchParams).length) return state;
    return {
      searchParams: {},
      mentors: [],
      shouldRefresh: true,
      isLoading: false
    };
  }),
})); 