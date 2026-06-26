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
    columnHelper.accessor("assigned", {
        header: "Assigned To",

        filterFn: "includesString",

        cell: ({ getValue  }) => {
            const assigned = getValue();
            return (
                <div className='flex flex-col justify-center items-center'>
                    {
                        assigned.map((user) => {
                            return <div className ={"text-sm"} key={user.id}>
                                {user.email}
                            </div>
                        })
                    }
                </div>
            );
        },
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