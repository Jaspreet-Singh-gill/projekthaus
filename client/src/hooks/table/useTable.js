import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => info.getValue()
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => info.getValue()
    }),
    columnHelper.accessor("progress", {
        header: "Progress",
        cell: (info) => info.getValue()
    }),
    columnHelper.accessor("Assigned", {
        header: "Assigned To",
        cell: (info) => info.getValue()
    }),
    columnHelper.accessor("startDate", {
        header: "Start Date",
        cell: (info) => info.getValue()
    }),
    columnHelper.accessor("endDate", {
        header: "End Date",
        cell: (info) => info.getValue()
    }),
]