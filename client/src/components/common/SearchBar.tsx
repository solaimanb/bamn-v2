'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { MentorFilters } from '@/types/api';
import { useSearchParamsSync } from '@/hooks/useSearchParamsSync';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationFilter {
  continent?: string;
  country?: string;
  city?: string;
}

interface SearchStoreState {
  searchParams: {
    keyword?: string;
    tags?: string[];
    continent?: string;
    country?: string;
    city?: string;
  };
  setSearchParams: (params: {
    keyword?: string;
    tags?: string[];
    continent?: string;
    country?: string;
    city?: string;
  }) => void;
}

const selectSearchParams = (state: SearchStoreState) => state.searchParams;
const selectSetSearchParams = (state: SearchStoreState) => state.setSearchParams;

export const SearchBar = memo(function SearchBar() {
  const searchParams = useSearchStore(selectSearchParams);
  const setSearchParams = useSearchStore(selectSetSearchParams);
  const urlSearchParams = useSearchParams();

  const [search, setSearch] = useState(urlSearchParams?.get('keyword') || '');
  const [selectedTags] = useState<string[]>(searchParams.tags || []);
  const [locationFilter] = useState<LocationFilter>({
    continent: searchParams.continent,
    country: searchParams.country,
    city: searchParams.city
  });

  useSearchParamsSync();

  const updateSearchParams = useCallback(() => {
    const searchFilters: MentorFilters = {
      keyword: search.startsWith('#') ? undefined : search || undefined,
      research_interests: selectedTags.length > 0 ? selectedTags : undefined,
      ...locationFilter
    };

    setSearchParams({
      keyword: searchFilters.keyword,
      tags: searchFilters.research_interests,
      ...locationFilter
    });
  }, [search, selectedTags, locationFilter, setSearchParams]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateSearchParams();
    }
  }, [updateSearchParams]);

  useEffect(() => {
    const keyword = urlSearchParams?.get('keyword');
    if (keyword) {
      setSearch(keyword);
    }
  }, [urlSearchParams]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          placeholder="Search mentors..."
          className="w-full h-12 pl-4 pr-12 rounded-full border bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Button
          size="icon"
          variant="secondary"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full hover:bg-accent"
          onClick={updateSearchParams}
        >
          <Search size={32} className="text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}); 