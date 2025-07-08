import { create } from 'zustand';
import { Mentor } from '@/types/mentor';

interface SearchStore {
  mentors: Mentor[];
  setMentors: (mentors: Mentor[]) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  mentors: [],
  setMentors: (mentors) => set({ mentors }),
})); 