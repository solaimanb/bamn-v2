import { create } from 'zustand';

interface FilterState {
  keyword: string;
  tags: string[];
  continent: string | null;
  country: string | null;
  city: string | null;
  setKeyword: (keyword: string) => void;
  setTags: (tags: string[]) => void;
  setContinent: (continent: string | null) => void;
  setCountry: (country: string | null) => void;
  setCity: (city: string | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  keyword: '',
  tags: [],
  continent: null,
  country: null,
  city: null,
  setKeyword: (keyword) => set({ keyword }),
  setTags: (tags) => set({ tags }),
  setContinent: (continent) => set({ continent }),
  setCountry: (country) => set({ country }),
  setCity: (city) => set({ city }),
  resetFilters: () => set({ keyword: '', tags: [], continent: null, country: null, city: null }),
})); 