"use client"

import { useEffect } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useMentors } from "@/hooks/useMentors"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"

export default function MentorsPage() {
    const { mentors, fetchMentors, isLoading } = useMentors()

    useEffect(() => {
        fetchMentors()
    }, [fetchMentors])

    return (
        <ErrorBoundary>
            <div className="h-full flex flex-col">
                <div className="shrink-0 flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Mentors</h2>
                        <p className="text-sm text-muted-foreground">
                            Here&apos;s a list of all mentors in the platform
                        </p>
                    </div>
                </div>
                <div className="flex-1 min-h-0">
                    <DataTable
                        columns={columns}
                        data={mentors}
                        onRefresh={fetchMentors}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </ErrorBoundary>
    )
} 