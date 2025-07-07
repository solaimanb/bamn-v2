'use client';

import { useEffect, useState } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listAllMentors } from '@/lib/adminApi';
import { ApiError, MentorResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardPage() {
    const [mentors, setMentors] = useState<MentorResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMentors = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const allMentors = await listAllMentors();
            setMentors(allMentors);
        } catch (err) {
            const apiError = err as ApiError;
            console.error('Failed to fetch mentors:', apiError);
            setError(apiError.message || 'Failed to fetch mentors data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMentors();
    }, []);

    const totalMentors = mentors.length;
    const pendingMentors = mentors.filter(mentor => mentor.moderation_status === 'pending').length;
    const activeMentors = mentors.filter(mentor => mentor.moderation_status === 'approved').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <CardHeader className="p-0">
                    <CardTitle>Dashboard Overview</CardTitle>
                </CardHeader>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchMentors}
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <CardContent className="p-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Total Mentors Card */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Mentors
                            </p>
                            <p className="text-2xl font-bold">
                                {isLoading ? (
                                    <span className="animate-pulse">...</span>
                                ) : (
                                    totalMentors
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Pending Approvals Card */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Pending Approvals
                            </p>
                            <p className="text-2xl font-bold">
                                {isLoading ? (
                                    <span className="animate-pulse">...</span>
                                ) : (
                                    pendingMentors
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Active Mentors Card */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Active Mentors
                            </p>
                            <p className="text-2xl font-bold">
                                {isLoading ? (
                                    <span className="animate-pulse">...</span>
                                ) : (
                                    activeMentors
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </div>
    );
}