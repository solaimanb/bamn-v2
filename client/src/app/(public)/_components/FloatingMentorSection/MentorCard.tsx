'use client';

import { memo } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Mentor } from '@/types/mentor';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MentorCardProps {
  mentor: Mentor;
  onClick?: () => void;
}

export const MentorCard = memo(({ mentor, onClick }: MentorCardProps) => {
  return (
    <Link
      href={`/mentors/${mentor.id}`}
      className="block w-full text-left transition-all hover:scale-[1.02] focus:scale-[1.02] group"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <Card className="border-border hover:shadow-md transition-shadow">
        <CardContent>
          <h3 className="text-sm font-medium group-hover:text-primary truncate">
            {mentor.full_name}
          </h3>

          <p className="text-xs text-muted-foreground truncate">
            {mentor.current_role} at {mentor.institution}
          </p>

          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{mentor.city}, {mentor.country}</span>
          </div>

          {mentor.research_interests.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {mentor.research_interests.slice(0, 2).map((interest, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs font-medium"
                >
                  {interest}
                </Badge>
              ))}
              {mentor.research_interests.length > 2 && (
                <Badge
                  variant="secondary"
                  className="text-xs font-medium"
                >
                  +{mentor.research_interests.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
});

MentorCard.displayName = 'MentorCard'; 