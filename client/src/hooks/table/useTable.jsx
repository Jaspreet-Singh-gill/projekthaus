import { createColumnHelper } from '@tanstack/react-table';
import { Link } from "react-router-dom";

const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.accessor("name", {
        header: "Name",
        cell: ({ row }) => {
            return (
                <Link to={`/project/${row.original.projectId}/task/${row.original._id}`}>
                    {row.original.name}
                </Link>
            );
        },
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
    columnHelper.accessor(
        row => row.assigned.map(user => user.email).join(", "),
        {
            id: "assigned",
            header: "Assigned To",

            filterFn: "includesString",

            cell: (info) => info.getValue(),
        }
    ),
    columnHelper.accessor("startDate", {
        header: "Start Date",
        cell: (info) => info.getValue()
    }),
    columnHelper.accessor("endDate", {
        header: "End Date",
        cell: (info) => info.getValue()
    }),
]