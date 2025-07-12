'use client';

import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Mentor } from '@/types/mentor';
import { MentorCard } from '@/app/(public)/_components/FloatingMentorSection/MentorCard';
import { useSearchStore } from '@/store/searchStore';

interface FloatingMentorSectionProps {
  mentors: Mentor[];
  isLoading?: boolean;
  onMentorClick?: (mentor: Mentor) => void;
}

export const FloatingMentorSection = memo(({
  mentors,
  isLoading = false,
  onMentorClick
}: FloatingMentorSectionProps) => {
  const { searchParams: storeParams } = useSearchStore();

  const displayedMentors = mentors.slice(0, 2);

  const buildSearchQuery = () => {
    const params = new URLSearchParams();

    if (storeParams.keyword) params.set('keyword', storeParams.keyword);
    if (storeParams.tags?.length) params.set('tags', storeParams.tags.join(','));
    if (storeParams.continent) params.set('continent', storeParams.continent);
    if (storeParams.country) params.set('country', storeParams.country);
    if (storeParams.city) params.set('city', storeParams.city);

    const query = params.toString();
    return query ? `?${query}` : '';
  };

  const hasSearchCriteria = Boolean(
    storeParams.keyword ||
    (storeParams.tags && storeParams.tags.length > 0) ||
    storeParams.continent ||
    storeParams.country ||
    storeParams.city
  );

  if (!hasSearchCriteria) {
    return null;
  }

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed left-4 bottom-4 z-10 w-80 space-y-2"
    >
      <div className="rounded-xl border bg-card p-4 shadow-lg">
        <div className="mb-4">
          <h2 className="font-semibold">Search Results</h2>
          <p className="text-sm text-muted-foreground">
            Connect with mentors around the world
          </p>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="h-32 rounded-lg bg-muted animate-pulse"
              />
            ))
          ) : displayedMentors.length > 0 ? (
            displayedMentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onClick={() => onMentorClick?.(mentor)}
              />
            ))
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No mentors found. Try adjusting your search.
            </div>
          )}
        </div>

        {(isLoading || displayedMentors.length > 0) && (
          <div className="mt-4">
            <Link href={`/mentors${buildSearchQuery()}`} className="w-full">
              <Button
                variant="outline"
                className="w-full"
              >
                See all mentors
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
});

FloatingMentorSection.displayName = 'FloatingMentorSection'; 