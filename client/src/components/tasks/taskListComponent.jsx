import React from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { columns } from "../../hooks/table/useTable.js";


const TaskListTable = ({ taskData }) => {
    const table = useReactTable({
        data: taskData,
        columns,
        getCoreRowModel: getCoreRowModel()
    });

   return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
        <table className="w-full border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-800">
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th
                                key={header.id}
                                className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-700"
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

            <tbody className="bg-white dark:bg-gray-900">
                {table.getRowModel().rows.map((row) => (
                    <tr
                        key={row.id}
                        className="
                            border-b border-gray-200 dark:border-gray-700
                            odd:bg-white even:bg-gray-50
                            dark:odd:bg-gray-900 dark:even:bg-gray-800
                            hover:bg-blue-50 dark:hover:bg-gray-700
                            transition-colors
                        "
                    >
                        {row.getVisibleCells().map((cell) => (
                            <td
                                key={cell.id}
                                className="px-4 py-3 text-gray-600 dark:text-gray-300"
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
);
}

export default TaskListTable;