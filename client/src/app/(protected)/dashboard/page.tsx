'use client';

import { useEffect, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, UserCheck, Clock, UserX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMentors } from '@/hooks/useMentors';
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = memo(({
    title,
    value,
    isLoading,
    icon: Icon,
    variant = 'default'
}: {
    title: string;
    value: number;
    isLoading: boolean;
    icon: React.ElementType;
    variant?: 'success' | 'warning' | 'error' | 'default';
}) => {
    const variantStyles = {
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/25 dark:text-amber-400',
        error: 'bg-rose-100 text-rose-700 dark:bg-rose-900/25 dark:text-rose-400',
        default: 'bg-muted text-muted-foreground'
    };

    return (
        <div className="rounded-lg border bg-card p-6 transition-all hover:shadow-md">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className={`rounded-full p-2 ${variantStyles[variant]}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                </div>
                {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                ) : (
                    <h2 className="text-2xl lg:text-3xl font-black">
                        {value}
                    </h2>
                )}
            </div>
        </div>
    );
});
StatCard.displayName = 'StatCard';

const DashboardHeader = memo(({ isLoading, onRefresh }: { isLoading: boolean; onRefresh: () => void }) => (
    <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-xl font-bold tracking-tight">Overview</h2>
            <p className="text-sm text-muted-foreground">
                Here&apos;s a quick overview of the platform
            </p>
        </div>
        <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
        >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
        </Button>
    </div>
));
DashboardHeader.displayName = 'DashboardHeader';

const StatsGrid = memo(({ stats, isLoading }: {
    stats: {
        totalMentors: number;
        pendingMentors: number;
        activeMentors: number;
        rejectedMentors: number;
    };
    isLoading: boolean;
}) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
            title="Active Mentors"
            value={stats.activeMentors}
            isLoading={isLoading}
            icon={UserCheck}
            variant="success"
        />
        <StatCard
            title="Pending Review"
            value={stats.pendingMentors}
            isLoading={isLoading}
            icon={Clock}
            variant="warning"
        />
        <StatCard
            title="Rejected"
            value={stats.rejectedMentors}
            isLoading={isLoading}
            icon={UserX}
            variant="error"
        />
        <StatCard
            title="Total Mentors"
            value={stats.totalMentors}
            isLoading={isLoading}
            icon={Users}
        />
    </div>
));
StatsGrid.displayName = 'StatsGrid';

export default function DashboardPage() {
    const { mentors, isLoading, error, fetchMentors } = useMentors();

    useEffect(() => {
        fetchMentors();
    }, [fetchMentors]);

    const stats = useMemo(() => ({
        totalMentors: mentors.length,
        pendingMentors: mentors.filter(mentor => mentor.moderation_status === 'pending').length,
        activeMentors: mentors.filter(mentor => mentor.moderation_status === 'approved').length,
        rejectedMentors: mentors.filter(mentor => mentor.moderation_status === 'rejected').length
    }), [mentors]);

    return (
        <>
            <DashboardHeader isLoading={isLoading} onRefresh={() => fetchMentors(true)} />

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}

            <StatsGrid stats={stats} isLoading={isLoading} />
        </>
    );
}