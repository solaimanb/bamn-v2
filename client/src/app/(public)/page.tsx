'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Mentor } from '@/types/mentor';
import { GlobeVisualization } from '@/types/api';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchStore, SearchParams } from '@/store/searchStore';
import { SearchBar } from '@/components/common/SearchBar';
import { FloatingMentorSection } from './_components/FloatingMentorSection';
import { listMentors, getMentorGlobeData } from '@/lib/mentorApi';

const MentorGlobeCesium = dynamic(() => import('./_components/MentorGlobeCesium'), {
  ssr: false,
});

type MentorLocation = Mentor | GlobeVisualization;

const selectMentors = (state: { mentors: Mentor[] }) => state.mentors;
const selectIsLoading = (state: { isLoading: boolean }) => state.isLoading;
const selectSearchParams = (state: { searchParams: SearchParams }) => state.searchParams;
const selectSetMentors = (state: { setMentors: (mentors: Mentor[]) => void }) => state.setMentors;
const selectSetLoading = (state: { setLoading: (isLoading: boolean) => void }) => state.setLoading;

interface MentorDetailProps {
  mentor: MentorLocation;
  isLoadingDetails: boolean;
}

const MentorDetail = ({ mentor, isLoadingDetails }: MentorDetailProps) => {
  const isMentorFull = 'email' in mentor;

  if (!isMentorFull && isLoadingDetails) {
    return (
      <>
        <DialogTitle className="text-2xl font-semibold">
          {mentor.full_name}
        </DialogTitle>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Research Interests</p>
            <p>{mentor.research_interests.join(', ')}</p>
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <DialogTitle className="text-2xl font-semibold">
        {mentor.full_name}
      </DialogTitle>
      <div className="space-y-4">
        {isMentorFull ? (
          <>
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p>{mentor.current_role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Institution</p>
              <p>{mentor.institution}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p>{mentor.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p>{mentor.city}, {mentor.country}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p>{mentor.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Research Interests</p>
              <p>{mentor.research_interests.join(', ')}</p>
            </div>
          </>
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-500">Research Interests</p>
            <p>{mentor.research_interests.join(', ')}</p>
          </div>
        )}
      </div>
    </>
  );
};

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

  const handleDialogClose = () => {
    setSelectedMentor(null);
    setIsLoadingDetails(false);
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

      <Dialog open={!!selectedMentor} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedMentor && (
            <MentorDetail
              mentor={selectedMentor}
              isLoadingDetails={isLoadingDetails}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
