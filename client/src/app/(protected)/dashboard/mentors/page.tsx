"use client"

import { useEffect } from "react"
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { useMentors } from "@/hooks/useMentors"

export default function MentorsPage() {
    const { mentors, isLoading, fetchMentors, handleApprove, handleReject, actionInProgress } = useMentors()

    useEffect(() => {
        fetchMentors()
    }, [fetchMentors])

    const columns = getColumns({ handleApprove, handleReject, actionInProgress })

    return (
        <div className="container mx-auto py-10">
            <DataTable
                columns={columns}
                data={mentors}
                onRefresh={fetchMentors}
                isLoading={isLoading}
            />
        </div>
    )
} 