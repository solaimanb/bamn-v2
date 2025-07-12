export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMentor } from '@/lib/mentorApi';
import { MentorProfile } from './_components/MentorProfile';

interface MentorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: MentorPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  if (!id) return {
    title: 'Mentor Profile',
    description: 'View mentor details and connect with them.',
  };

  try {
    const mentor = await getMentor(id);
    return {
      title: `${mentor.full_name} - Mentor Profile`,
      description: `${mentor.full_name} is a ${mentor.current_role} at ${mentor.institution}. Connect and learn about their expertise in ${mentor.research_interests.join(', ')}.`,
    };
  } catch {
    return {
      title: 'Mentor Profile',
      description: 'View mentor details and connect with them.',
    };
  }
}

export default async function MentorPage({ params }: MentorPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  if (!id) notFound();

  try {
    const mentor = await getMentor(id);
    return <MentorProfile mentor={mentor} />;
  } catch {
    notFound();
  }
} 