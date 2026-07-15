import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAllTheTasks, useCreateTask } from "../../hooks/task/useTask.js";
import TaskListTable from "../../components/tasks/taskListComponent.jsx";
import { Loader } from "../../components/skeleton/loader.jsx";
import TaskDialogBox from "../../components/tasks/taskDialogBox.jsx";
import { PlusIcon } from "lucide-react";
import { columns } from "../../hooks/table/useTable.jsx";


const ListOfTasks = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useGetAllTheTasks(projectId);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const mutation = useCreateTask(projectId);


    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-8 md:px-8 md:py-10 space-y-6 flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
            <button
                type="button"
                onClick={() => navigate(`/project/${projectId}`)}
                className="text-xs font-semibold text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer self-start"
            >
                &larr; Back to Project Dashboard
            </button>

            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-900/60">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                        Tasks
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Manage and collaborate on your project tasks.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-violet-600/10 hover:shadow-violet-600/25 active:scale-[0.98] cursor-pointer self-start sm:self-auto"
                >
                    <PlusIcon className="w-4.5 h-4.5 stroke-[2.5]" />
                    <span>Create Task</span>
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-2xl overflow-hidden shadow-xl p-1">
                <TaskListTable taskData={data.data} columns={columns} />
            </div>

            <TaskDialogBox open={isCreateOpen} onClose={() => setIsCreateOpen(false)} mutation={mutation} taskData={null} />
        </div>
    )


}

export default ListOfTasks;