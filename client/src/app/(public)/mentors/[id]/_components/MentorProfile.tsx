'use client';

import { memo } from 'react';
import { MapPin, Mail, Building2, GraduationCap, Globe, Calendar, MoveLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mentor } from '@/types/mentor';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface MentorProfileProps {
    mentor: Mentor;
}

export const MentorProfile = memo(function MentorProfile({ mentor }: MentorProfileProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleBackClick = () => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        const queryString = params.toString();
        if (queryString) {
            router.push(`/mentors?${queryString}`);
        } else {
            router.back();
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="container mx-auto max-w-5xl py-20">
            <div>
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{mentor.full_name}</h1>
                            <p className="text-xl text-muted-foreground">{mentor.current_role}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBackClick}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <MoveLeft size={20} className="mr-2" />
                            Back to Mentors
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-6">
                        {/* Location Card */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-semibold mb-4">Location</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm">
                                        <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                                        <span>{mentor.city}, {mentor.country}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Globe className="h-4 w-4 mr-3 text-muted-foreground" />
                                        <span>{mentor.continent}</span>
                                    </div>
                                    {mentor.latitude && mentor.longitude && (
                                        <div className="text-sm text-muted-foreground mt-2">
                                            Coordinates: {mentor.latitude}, {mentor.longitude}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Institution Card */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-semibold mb-4">Academic Information</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm">
                                        <Building2 className="h-4 w-4 mr-3 text-muted-foreground" />
                                        <span>{mentor.institution}</span>
                                    </div>
                                    {mentor.department && (
                                        <div className="flex items-center text-sm">
                                            <GraduationCap className="h-4 w-4 mr-3 text-muted-foreground" />
                                            <span>{mentor.department}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Research Interests Card */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-semibold mb-4">Research Interests</h2>
                                <div className="flex flex-wrap gap-2">
                                    {mentor.research_interests.map((interest: string, idx: number) => (
                                        <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="bg-secondary/30 text-secondary-foreground hover:bg-secondary/40"
                                        >
                                            {interest}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profile Status Card */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-semibold mb-4">Profile Information</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                                        <span>Joined {formatDate(mentor.created_at)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        {/* Degrees Card */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-semibold mb-4">Education</h2>
                                <div className="space-y-3">
                                    {mentor.degrees.map((degree, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm">{degree}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {mentor.bio && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="font-semibold mb-4">About</h2>
                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-muted-foreground whitespace-pre-wrap">{mentor.bio}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Contact Information */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-semibold mb-4">Contact Information</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm">
                                        <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                                        <a href={`mailto:${mentor.email}`} className="text-primary hover:underline">
                                            {mentor.email}
                                        </a>
                                    </div>
                                    {mentor.linkedin_url && (
                                        <div className="flex items-center text-sm">
                                            <svg className="h-4 w-4 mr-3 text-muted-foreground" viewBox="0 0 24 24">
                                                <path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                            </svg>
                                            <a
                                                href={mentor.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                LinkedIn Profile
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}); 