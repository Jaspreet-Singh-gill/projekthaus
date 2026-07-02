import React, { useState } from "react";
import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table";

import useAuthStore from "../../store/authStore.js";
import { Search, ChevronDown, User } from "lucide-react";


const TaskListTable = ({ taskData, columns }) => {

    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const { user } = useAuthStore();
    const [assignedToMe, setAssignedToMe] = useState(null);
    const table = useReactTable({
        data: taskData,
        columns,
        state: { sorting, globalFilter, columnFilters },
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                        className="w-full pl-9 pr-3 py-1.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-colors"
                        onChange={e => table.setGlobalFilter(String(e.target.value))}
                        placeholder="Search tasks..."
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Priority</span>
                        <div className="relative flex items-center">
                            <select
                                className="bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer appearance-none pr-5 font-medium"
                                value={(table.getColumn("priority")?.getFilterValue()) ?? ""}
                                onChange={e => table.getColumn("priority")?.setFilterValue(e.target.value)}
                            >
                                <option className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200" value="">All</option>
                                <option className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200" value="LOW">Low</option>
                                <option className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200" value="MEDIUM">Medium</option>
                                <option className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200" value="HIGH">High</option>
                            </select>
                            <ChevronDown className="absolute right-0 pointer-events-none w-3.5 h-3.5 text-slate-400" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</span>
                        <div className="relative flex items-center">
                            <select
                                className="bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer appearance-none pr-5 font-medium"
                                value={(table.getColumn("status")?.getFilterValue()) ?? ""}
                                onChange={e => table.getColumn("status")?.setFilterValue(e.target.value)}
                            >
                                <option className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200" value="">All</option>
                                <option className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200" value="TODO">Todo</option>
                                <option className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200" value="COMPLETED">Completed</option>
                                <option className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200" value="IN_PROGRESS">In Progress</option>
                            </select>
                            <ChevronDown className="absolute right-0 pointer-events-none w-3.5 h-3.5 text-slate-400" />
                        </div>
                    </div>

                    <button
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border cursor-pointer ${assignedToMe
                            ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/80"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                            }`}
                        onClick={() => {
                            const nextValue = assignedToMe === null ? user.email : null;
                            setAssignedToMe(nextValue);
                            table.getColumn("assigned")?.setFilterValue(nextValue);
                        }}
                        type="button"
                    >
                        <User className={`w-4 h-4 ${assignedToMe ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                        <span>Assigned to me</span>
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors select-none"
                                    >
                                        <div className="flex items-center gap-1">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: ' ▴',
                                                desc: ' ▾',
                                            }[header.column.getIsSorted()] ?? null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-950/5">
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors duration-150"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="px-6 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap"
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TaskListTable;