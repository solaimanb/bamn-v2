'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { MentorFilters } from '@/types/api';
import { useSearchParamsSync } from '@/hooks/useSearchParamsSync';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { FilterSelect } from './FilterSelect';
import {
  LocationFilter,
  Continent,
  Country,
  LOCATIONS,
  getLocationOptions,
  getResearchAreaOptions
} from '@/constants/filters';

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

  const [search, setSearch] = useState(searchParams.keyword || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(searchParams.tags || []);
  const [locationFilter, setLocationFilter] = useState<LocationFilter>({
    continent: searchParams.continent as Continent | undefined,
    country: searchParams.country as Country | undefined,
    city: searchParams.city
  });

  useSearchParamsSync();

  useEffect(() => {
    setSearch(searchParams.keyword || '');
  }, [searchParams.keyword]);

  useEffect(() => {
    const keyword = urlSearchParams?.get('keyword');
    if (keyword) {
      setSearch(keyword);
    }
  }, [urlSearchParams]);

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
    const newValue = e.target.value;
    setSearch(newValue);

    if (!newValue) {
      const filters: MentorFilters = {
        research_interests: selectedTags.length > 0 ? selectedTags : undefined,
        ...locationFilter
      };

      setSearchParams({
        tags: filters.research_interests,
        ...locationFilter
      });
    }
  }, [locationFilter, selectedTags, setSearchParams]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateSearchParams();
    }
  }, [updateSearchParams]);

  const handleTagSelect = useCallback((tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);
    setSearchParams({
      ...searchParams,
      tags: newTags.length > 0 ? newTags : undefined
    });
  }, [selectedTags, searchParams, setSearchParams]);

  const handleTagRemove = useCallback((tag: string, e?: React.MouseEvent<Element>) => {
    e?.stopPropagation(); // Prevent event bubbling
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    setSearchParams({
      ...searchParams,
      tags: newTags.length > 0 ? newTags : undefined
    });
  }, [selectedTags, searchParams, setSearchParams]);

  const handleLocationSelect = useCallback((value: string) => {
    const newFilter: LocationFilter = { ...locationFilter };

    if (locationFilter.continent && value in LOCATIONS.countries[locationFilter.continent]) {
      // Country selection
      newFilter.country = newFilter.country === value ? undefined : value as Country;
      newFilter.city = undefined;
    } else {
      // Continent selection
      newFilter.continent = newFilter.continent === value ? undefined : value as Continent;
      newFilter.country = undefined;
      newFilter.city = undefined;
    }

    setLocationFilter(newFilter);
    setSearchParams({
      ...searchParams,
      ...newFilter
    });
  }, [locationFilter, searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    setSelectedTags([]);
    setLocationFilter({});
    setSearchParams({
      keyword: searchParams.keyword
    });
  }, [searchParams, setSearchParams]);

  const activeFiltersCount = selectedTags.length + (locationFilter.continent ? 1 : 0);

  return (
    <div className="relative w-full space-y-2">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
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

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full shrink-0"
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="end">
            <div className="space-y-4">
              {/* Research Areas */}
              <div className="space-y-2">
                <Label>Research Areas</Label>
                <FilterSelect
                  options={getResearchAreaOptions()}
                  value={selectedTags}
                  placeholder="Search research areas..."
                  onSelect={handleTagSelect}
                  isSelected={(value) => selectedTags.includes(value)}
                />
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={(e: React.MouseEvent<SVGElement>) => handleTagRemove(tag, e)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Location */}
              <div className="space-y-2">
                <Label>Location</Label>
                <FilterSelect
                  options={getLocationOptions(locationFilter.continent)}
                  placeholder={locationFilter.continent ? "Search countries..." : "Search continents..."}
                  onSelect={handleLocationSelect}
                  isSelected={(value) =>
                    value === locationFilter.continent ||
                    value === locationFilter.country
                  }
                />
                {(locationFilter.continent || locationFilter.country) && (
                  <div className="flex flex-wrap gap-1">
                    {locationFilter.continent && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {locationFilter.continent}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleLocationSelect(locationFilter.continent!)}
                        />
                      </Badge>
                    )}
                    {locationFilter.country && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {locationFilter.country}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleLocationSelect(locationFilter.country!)}
                        />
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              {activeFiltersCount > 0 && (
                <>
                  <Separator />
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1 px-1">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => handleTagRemove(tag, e)}
            >
              {tag}
              <X
                className="h-3 w-3"
                onClick={(e: React.MouseEvent<SVGElement>) => {
                  e.stopPropagation();
                  handleTagRemove(tag, e);
                }}
              />
            </Badge>
          ))}
          {locationFilter.continent && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1"
            >
              {[
                locationFilter.continent,
                locationFilter.country,
                locationFilter.city,
              ]
                .filter(Boolean)
                .join(", ")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setLocationFilter({});
                  setSearchParams({
                    ...searchParams,
                    continent: undefined,
                    country: undefined,
                    city: undefined,
                  });
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}); 