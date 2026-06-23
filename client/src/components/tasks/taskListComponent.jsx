import React, { useState } from "react";
import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table";
import { columns } from "../../hooks/table/useTable.jsx";
import  useAuthStore  from "../../store/authStore.js";
import { Search, ChevronDown, User } from "lucide-react";


const TaskListTable = ({ taskData }) => {

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
        <div className="overflow-x-auto overflow-y-auto rounded-2xl border border-slate-900 bg-slate-950/20 backdrop-blur-md shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-slate-900 bg-slate-950/40">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        className="w-full pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl transition-all duration-200 outline-none"
                        onChange={e => table.setGlobalFilter(String(e.target.value))}
                        placeholder="Search tasks..."
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                    <div className="flex items-center gap-2 bg-slate-900/30 border border-slate-800 rounded-xl px-3 py-1.5 hover:border-slate-700 transition-colors">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</span>
                        <div className="relative flex items-center">
                            <select
                                className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer appearance-none pr-5 font-medium"
                                value={(table.getColumn("priority")?.getFilterValue()) ?? ""}
                                onChange={e => table.getColumn("priority")?.setFilterValue(e.target.value)}
                            >
                                <option className="bg-slate-950 text-slate-200" value="">ALL</option>
                                <option className="bg-slate-950 text-slate-200" value="LOW">LOW</option>
                                <option className="bg-slate-950 text-slate-200" value="MEDIUM">MEDIUM</option>
                                <option className="bg-slate-950 text-slate-200" value="HIGH">HIGH</option>
                            </select>
                            <ChevronDown className="absolute right-0 pointer-events-none w-3.5 h-3.5 text-slate-400" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900/30 border border-slate-800 rounded-xl px-3 py-1.5 hover:border-slate-700 transition-colors">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</span>
                        <div className="relative flex items-center">
                            <select
                                className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer appearance-none pr-5 font-medium"
                                value={(table.getColumn("status")?.getFilterValue()) ?? ""}
                                onChange={e => table.getColumn("status")?.setFilterValue(e.target.value)}
                            >
                                <option className="bg-slate-950 text-slate-200" value="">ALL</option>
                                <option className="bg-slate-950 text-slate-200" value="TODO">TODO</option>
                                <option className="bg-slate-950 text-slate-200" value="COMPLETED">COMPLETED</option>
                                <option className="bg-slate-950 text-slate-200" value="IN_PROGRESS">IN PROGRESS</option>
                            </select>
                            <ChevronDown className="absolute right-0 pointer-events-none w-3.5 h-3.5 text-slate-400" />
                        </div>
                    </div>

                    <button
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                            assignedToMe
                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                                : "bg-slate-900/30 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900/50"
                        }`}
                        onClick={() => {
                            const nextValue = assignedToMe === null ? user.email : null;
                            setAssignedToMe(nextValue);
                            table.getColumn("assigned")?.setFilterValue(nextValue);
                        }}
                    >
                        <User className={`w-4 h-4 ${assignedToMe ? "text-indigo-400" : "text-slate-400"}`} />
                        <span>Assigned to me</span>
                    </button>
                </div>
            </div>
            <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-900/60 border-b border-slate-900">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (

                                <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>

                <tbody className="divide-y divide-slate-900/50 bg-slate-950/5">
                    {table.getRowModel().rows.map((row) => (
                        <tr
                            key={row.id}
                            className="
                            hover:bg-slate-900/40
                            transition-colors duration-150
                        "
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className="px-6 py-4 text-slate-300 font-medium whitespace-nowrap"
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
        </div >
    );
}

export default TaskListTable;