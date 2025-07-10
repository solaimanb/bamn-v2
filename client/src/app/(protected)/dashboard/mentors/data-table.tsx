"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Row,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useDebounce } from "@/hooks/useDebounce"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw, Settings2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onRefresh?: () => void
    isLoading?: boolean
}

interface TableRowProps<TData, TValue> {
    row: Row<TData>
    columns: ColumnDef<TData, TValue>[]
}

interface SkeletonRowProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
}

const TableRowComponent = <TData, TValue>({ row }: TableRowProps<TData, TValue>) => {
    return (
        <TableRow data-state={row.getIsSelected() && "selected"}>
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    );
};
TableRowComponent.displayName = 'TableRowComponent';

const MemoizedTableRow = React.memo(TableRowComponent) as typeof TableRowComponent;

const SkeletonRowComponent = <TData, TValue>({ columns }: SkeletonRowProps<TData, TValue>) => {
    return (
        <TableRow>
            {columns.map((_, index) => (
                <TableCell key={index}>
                    <Skeleton className="h-6 w-full" />
                </TableCell>
            ))}
        </TableRow>
    );
};
SkeletonRowComponent.displayName = 'SkeletonRowComponent';

const SkeletonRow = React.memo(SkeletonRowComponent) as typeof SkeletonRowComponent;

export function DataTable<TData, TValue>({
    columns,
    data,
    onRefresh,
    isLoading = false,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
        department: false
    })
    const [nameFilter, setNameFilter] = React.useState("")
    const [emailFilter, setEmailFilter] = React.useState("")
    const debouncedNameFilter = useDebounce(nameFilter, 300)
    const debouncedEmailFilter = useDebounce(emailFilter, 300)

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    })

    React.useEffect(() => {
        table.getColumn("full_name")?.setFilterValue(debouncedNameFilter)
    }, [debouncedNameFilter, table])

    React.useEffect(() => {
        table.getColumn("email")?.setFilterValue(debouncedEmailFilter)
    }, [debouncedEmailFilter, table])

    const { rows } = table.getRowModel()
    const parentRef = React.useRef<HTMLDivElement>(null)

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 45,
        overscan: 10,
    })

    // const exportToCSV = () => {
    //     const headers = columns.map((col: any) => col.header || col.accessorKey)
    //     const csvData = table.getFilteredRowModel().rows.map((row) =>
    //         columns.map((col: any) => {
    //             const value = row.getValue(col.accessorKey)
    //             return typeof value === 'object' ? JSON.stringify(value) : value
    //         })
    //     )

    //     const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
    //     const blob = new Blob([csv], { type: 'text/csv' })
    //     const url = window.URL.createObjectURL(blob)
    //     const a = document.createElement('a')
    //     a.href = url
    //     a.download = 'mentors.csv'
    //     a.click()
    //     window.URL.revokeObjectURL(url)
    // }

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="shrink-0 flex items-center gap-4 flex-wrap">
                <Input
                    placeholder="Filter by name..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="max-w-xs"
                />

                <Input
                    placeholder="Filter by email..."
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="max-w-xs"
                />

                <div className="flex gap-2 ml-auto">
                    {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button> */}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Settings2 className="mr-2 h-4 w-4" />
                                View
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value: boolean) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {onRefresh && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 rounded-md border">
                <div ref={parentRef} className="h-full overflow-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, index) => (
                                    <SkeletonRow key={index} columns={columns} />
                                ))
                            ) : (
                                rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const row = rows[virtualRow.index];
                                    return (
                                        <MemoizedTableRow
                                            key={row.id}
                                            row={row}
                                            columns={columns}
                                        />
                                    );
                                })
                            )}
                            {!isLoading && !rows.length && (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="shrink-0 flex items-center justify-between space-x-2">
                {isLoading ? (
                    <>
                        <Skeleton className="h-4 w-[200px]" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-[100px]" />
                            <Skeleton className="h-8 w-[100px]" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-sm text-muted-foreground">
                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                            {table.getFilteredRowModel().rows.length} row(s) selected.
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
} 