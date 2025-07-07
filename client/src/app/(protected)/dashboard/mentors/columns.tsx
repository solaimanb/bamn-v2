"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MentorResponse } from "@/types/api"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

interface DataTableColumnProps {
    handleApprove: (mentorId: string) => Promise<void>
    handleReject: (mentorId: string) => Promise<void>
    actionInProgress: string | null
}

export const getColumns = ({ handleApprove, handleReject, actionInProgress }: DataTableColumnProps): ColumnDef<MentorResponse>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "full_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "institution",
        header: "Institution",
    },
    {
        accessorKey: "department",
        header: "Department",
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => `${row.original.city}, ${row.original.country}`,
    },
    {
        accessorKey: "moderation_status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.moderation_status
            return (
                <Badge variant="outline" className={
                    status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-red-50 text-red-700 border-red-200'
                }>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const mentor = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(mentor.id)}
                        >
                            Copy mentor ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {mentor.moderation_status === 'pending' && (
                            <>
                                <DropdownMenuItem
                                    onClick={() => handleApprove(mentor.id)}
                                    disabled={actionInProgress === mentor.id}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleReject(mentor.id)}
                                    disabled={actionInProgress === mentor.id}
                                >
                                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                    Reject
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuItem>View details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
] 