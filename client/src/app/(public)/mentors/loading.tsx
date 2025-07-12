import { Skeleton } from "@/components/ui/skeleton";

export default function MentorsLoading() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b">
                <div className="container py-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96 mt-2" />
                </div>
            </div>

            {/* Search and Filters */}
            <div className="container py-6">
                <div className="max-w-2xl mx-auto">
                    <Skeleton className="h-10 w-full rounded-lg" />
                </div>
            </div>

            {/* Mentors Grid */}
            <div className="container py-8">
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
                                <Skeleton className="h-5 w-24 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 