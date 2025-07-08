'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Mentor } from '@/types/mentor';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useSearchStore } from '@/store/searchStore';
import { SearchBar } from '@/components/common/SearchBar';

const MentorGlobe = dynamic(() => import('./_components/MentorGlobe'), {
  ssr: false,
});

export default function Home() {
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const mentors = useSearchStore(state => state.mentors);

  const handleMentorClick = (mentor: Mentor) => {
    setSelectedMentor(mentor);
  };

  return (
    <div className="min-h-screen relative">
      {/* Search bar container */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
        <SearchBar />
      </div>

      {/* Globe container */}
      <div className="absolute inset-0">
        <MentorGlobe mentors={mentors} onMentorClick={handleMentorClick} />
      </div>

      <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedMentor && (
            <>
              <DialogTitle className="text-2xl font-semibold">
                {selectedMentor.full_name}
              </DialogTitle>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p>{selectedMentor.current_role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Institution</p>
                  <p>{selectedMentor.institution}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p>{selectedMentor.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p>{selectedMentor.city}, {selectedMentor.country}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{selectedMentor.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Research Interests</p>
                  <p>{selectedMentor.research_interests.join(', ')}</p>
                </div>
                {selectedMentor.linkedin_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                    <a
                      href={selectedMentor.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
