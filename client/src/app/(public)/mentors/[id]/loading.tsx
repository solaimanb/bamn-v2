import { Skeleton } from "@/components/ui/skeleton";

export default function MentorProfileLoading() {
    return (
        <div className="pt-20">
            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Header with Avatar and Basic Info */}
                <div className="flex items-start gap-4 mb-8">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1">
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-6 w-48 mb-1" />
                        <Skeleton className="h-4 w-40 mb-1" />
                        <div className="flex items-center gap-2 mt-1">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="mb-8">
                    <Skeleton className="h-6 w-24 mb-3" />
                    <div className="border-l-2 pl-4">
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>

                {/* Description Section */}
                <div className="mb-8">
                    <Skeleton className="h-6 w-32 mb-3" />
                    <div className="border-l-2 pl-4 space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>

                {/* Research Keywords and Location Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                        {/* Research Keywords */}
                        <div>
                            <Skeleton className="h-6 w-40 mb-3" />
                            <div className="flex flex-wrap gap-2">
                                {[...Array(8)].map((_, i) => (
                                    <Skeleton key={i} className="h-6 w-20" />
                                ))}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <Skeleton className="h-6 w-40 mb-3" />
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    </div>

                    {/* Location Map */}
                    <div>
                        <Skeleton className="h-6 w-28 mb-3" />
                        <div className="shadow-lg rounded-lg overflow-hidden border p-1">
                            <Skeleton className="h-52 w-full" />
                            <div className="p-3 text-center space-y-2">
                                <Skeleton className="h-5 w-32 mx-auto" />
                                <Skeleton className="h-4 w-24 mx-auto" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}