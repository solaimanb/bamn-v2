'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Mentor } from '@/types/mentor';
import { GlobeVisualization } from '@/types/api';
import { useSearchStore, SearchParams } from '@/store/searchStore';
import { SearchBar } from '@/components/common/SearchBar';
import { FloatingMentorSection } from './_components/FloatingMentorSection';
import { listMentors, getMentorGlobeData } from '@/lib/mentorApi';
import MentorDialog from './_components/MentorDialog';

const MentorGlobeCesium = dynamic(() => import('./_components/MentorGlobeCesium'), {
  ssr: false,
});

type MentorLocation = Mentor | GlobeVisualization;

const selectMentors = (state: { mentors: Mentor[] }) => state.mentors;
const selectIsLoading = (state: { isLoading: boolean }) => state.isLoading;
const selectSearchParams = (state: { searchParams: SearchParams }) => state.searchParams;
const selectSetMentors = (state: { setMentors: (mentors: Mentor[]) => void }) => state.setMentors;
const selectSetLoading = (state: { setLoading: (isLoading: boolean) => void }) => state.setLoading;

export default function Home() {
  const [selectedMentor, setSelectedMentor] = useState<MentorLocation | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [globeMentors, setGlobeMentors] = useState<GlobeVisualization[]>([]);
  const mentors = useSearchStore(selectMentors);
  const isLoading = useSearchStore(selectIsLoading);
  const searchParams = useSearchStore(selectSearchParams);
  const setMentors = useSearchStore(selectSetMentors);
  const setLoading = useSearchStore(selectSetLoading);

  useEffect(() => {
    const loadGlobeMentors = async () => {
      try {
        const globeData = await getMentorGlobeData();
        setGlobeMentors(globeData);
      } catch (error) {
        console.error('Failed to load globe data:', error);
      }
    };

    loadGlobeMentors();
  }, []);

  useEffect(() => {
    const loadMentors = async () => {
      const hasSearchCriteria = Boolean(
        searchParams.keyword ||
        (searchParams.tags && searchParams.tags.length > 0) ||
        searchParams.continent ||
        searchParams.country ||
        searchParams.city
      );

      if (!hasSearchCriteria) {
        setMentors([]);
        return;
      }

      try {
        setLoading(true);
        const result = await listMentors({
          keyword: searchParams.keyword,
          research_interests: searchParams.tags,
          continent: searchParams.continent,
          country: searchParams.country,
          city: searchParams.city,
          page: 1,
          page_size: 10
        });

        setMentors(result.items);
      } catch (error) {
        console.error('Search error:', error);
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };

    loadMentors();
  }, [searchParams, setMentors, setLoading]);

  const handleMentorClick = (mentor: MentorLocation) => {
    setSelectedMentor(mentor);

    if (!('email' in mentor)) {
      setIsLoadingDetails(true);
      const loadFullMentorDetails = async () => {
        try {
          const result = await listMentors({
            keyword: mentor.full_name,
            page: 1,
            page_size: 1
          });
          if (result.items.length > 0) {
            setSelectedMentor(result.items[0]);
          }
        } catch (error) {
          console.error('Failed to load mentor details:', error);
        } finally {
          setIsLoadingDetails(false);
        }
      };
      loadFullMentorDetails();
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
        <SearchBar />
      </div>

      <FloatingMentorSection
        mentors={mentors}
        isLoading={isLoading}
        onMentorClick={handleMentorClick}
      />

      <div className="absolute inset-0">
        <MentorGlobeCesium
          mentors={mentors.length > 0 ? mentors : globeMentors}
          onMentorClick={handleMentorClick}
        />
      </div>

      <MentorDialog
        selectedMentor={selectedMentor}
        setSelectedMentor={setSelectedMentor}
        isLoading={isLoadingDetails}
      />
    </div>
  );
}
