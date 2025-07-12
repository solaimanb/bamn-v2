'use client';

import { useEffect, useRef, useCallback, memo } from 'react';
import Link from 'next/link';
import { useSearchStore, SearchParams } from '@/store/searchStore';
import { SearchBar } from '@/components/common/SearchBar';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';
import { listMentors } from '@/lib/mentorApi';
import { Mentor } from '@/types/mentor';
import { useSearchParams } from 'next/navigation';

const MentorCard = memo(function MentorCard({ mentor }: { mentor: Mentor }) {
  return (
    <Link
      href={`/mentors/${mentor.id}`}
      className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 className="text-lg font-semibold mb-2">{mentor.full_name}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {mentor.current_role} at {mentor.institution}
      </p>
      <div className="space-y-2">
        <p className="text-sm">
          <span className="font-medium">Department:</span> {mentor.department}
        </p>
        <p className="text-sm flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{mentor.city}, {mentor.country}</span>
        </p>
        <div className="mt-4">
          <p className="text-sm font-medium mb-1">Research Interests</p>
          <div className="flex flex-wrap gap-1">
            {mentor.research_interests.map((interest, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
});

const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-lg border bg-card p-6 shadow-sm space-y-3"
        >
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex flex-wrap gap-1 pt-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
});

const selectMentors = (state: { mentors: Mentor[] }) => state.mentors;
const selectIsLoading = (state: { isLoading: boolean }) => state.isLoading;
const selectSetMentors = (state: { setMentors: (mentors: Mentor[]) => void }) => state.setMentors;
const selectSetLoading = (state: { setLoading: (isLoading: boolean) => void }) => state.setLoading;
const selectSetSearchParams = (state: { setSearchParams: (params: SearchParams) => void }) => state.setSearchParams;

export default function MentorsPage() {
  const mentors = useSearchStore(selectMentors);
  const isLoading = useSearchStore(selectIsLoading);
  const setMentors = useSearchStore(selectSetMentors);
  const setLoading = useSearchStore(selectSetLoading);
  const setSearchParams = useSearchStore(selectSetSearchParams);
  const searchParams = useSearchParams();

  const searchInProgress = useRef(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    const params: SearchParams = {};
    const keyword = searchParams?.get('keyword');
    const tags = searchParams?.get('tags');
    const continent = searchParams?.get('continent');
    const country = searchParams?.get('country');
    const city = searchParams?.get('city');

    if (keyword) params.keyword = keyword;
    if (tags) params.tags = tags.split(',');
    if (continent) params.continent = continent;
    if (country) params.country = country;
    if (city) params.city = city;

    if (Object.keys(params).length > 0) {
      setSearchParams(params);
    }
  }, [searchParams, setSearchParams]);

  const performSearch = useCallback(async (params: SearchParams) => {
    if (searchInProgress.current) return;
    if (!params.keyword && (!params.tags || params.tags.length === 0)) {
      setMentors([]);
      return;
    }

    try {
      searchInProgress.current = true;
      setLoading(true);
      const result = await listMentors({
        keyword: params.keyword,
        research_interests: params.tags,
        continent: params.continent,
        country: params.country,
        city: params.city,
        page: 1,
        page_size: 10
      });

      setMentors(result.items);
    } catch (error) {
      console.error('Search error:', error);
      setMentors([]);
    } finally {
      setLoading(false);
      searchInProgress.current = false;
    }
  }, [setMentors, setLoading]);

  useEffect(() => {
    const params: SearchParams = {};
    const keyword = searchParams?.get('keyword');
    const tags = searchParams?.get('tags');
    const continent = searchParams?.get('continent');
    const country = searchParams?.get('country');
    const city = searchParams?.get('city');

    if (keyword) params.keyword = keyword;
    if (tags) params.tags = tags.split(',');
    if (continent) params.continent = continent;
    if (country) params.country = country;
    if (city) params.city = city;

    performSearch(params);
  }, [searchParams, performSearch]);

  return (
    <div className='py-20'>
      <div className="container mx-auto text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mentors</h1>
        <p className="text-muted-foreground">
          Find and connect with mentors from around the world
        </p>
      </div>

      <div className="container mx-auto py-6">
        <div className="max-w-xl mx-auto">
          <SearchBar />
        </div>
      </div>

      <div className="container mx-auto">
        {isLoading ? (
          <LoadingSkeleton />
        ) : mentors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No mentors found. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 