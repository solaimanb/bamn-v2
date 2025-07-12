import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MoveLeft } from "lucide-react";

export default function MentorProfileLoading() {
    return (
        <div className="container mx-auto max-w-5xl py-20">
            <div>
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <Skeleton className="h-9 w-64 mb-2" />
                            <Skeleton className="h-7 w-48" />
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                            disabled
                        >
                            <MoveLeft size={20} className="mr-2" />
                            Back to Mentors
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column - Info Cards */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <Skeleton className="h-5 w-40 mb-4" />
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Skeleton className="h-4 w-4 mr-3" />
                                        <Skeleton className="h-4 flex-1" />
                                    </div>
                                    <div className="flex items-center">
                                        <Skeleton className="h-4 w-4 mr-3" />
                                        <Skeleton className="h-4 flex-1" />
                                    </div>
                                    <div className="flex items-center">
                                        <Skeleton className="h-4 w-4 mr-3" />
                                        <Skeleton className="h-4 flex-1" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Skeleton className="h-5 w-40 mb-4" />
                                <div className="flex flex-wrap gap-2">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Bio and Other Info */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardContent className="p-6">
                                <Skeleton className="h-5 w-20 mb-4" />
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}