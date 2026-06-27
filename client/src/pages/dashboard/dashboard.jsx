import React from "react";
import CreateProjectDialogBox from "../../components/projects/createProjectDialogBox.jsx";
import { useProjectQuery,useCreateProjectMutation } from "../../hooks/project/useProject.js";
import CardSkeleton from "../../components/skeleton/projectCardLoader.jsx";
import ProjectCard from "../../components/projects/projectCard.jsx";
import { FolderPlus } from "lucide-react";

export function Dashboard() {
    const [open, setOpen] = React.useState(false);
    const projects = useProjectQuery();
    const mutation = useCreateProjectMutation();

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-8 md:px-8 md:py-10 space-y-8 flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-900/60">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                        Projects
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Manage and collaborate on your active workspace projects.
                    </p>
                </div>
                <button 
                    onClick={() => setOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-violet-600/10 hover:shadow-violet-600/25 active:scale-[0.98] cursor-pointer self-start sm:self-auto"
                >
                    <FolderPlus className="w-4.5 h-4.5 stroke-[2.5]" />
                    <span>Create Project</span>
                </button>
            </div>

            {/* Content Area */}
            <div>
                {/* Loading State */}
                {projects.isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                )}

                {/* Loaded State */}
                {!projects.isLoading && projects.data && (
                    projects.data.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/20 max-w-lg mx-auto mt-8">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4">
                                <FolderPlus className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No projects yet</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-xs">
                                Get started by creating your first project workspace.
                            </p>
                            <button
                                onClick={() => setOpen(true)}
                                className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer"
                            >
                                Create a project
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.data.data.map((value) => (
                                <ProjectCard 
                                    key={value._id} 
                                    _id={value._id} 
                                    projectName={value.projectName} 
                                    projectDescription={value.projectDescription} 
                                />
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Create Project Modal */}
            <CreateProjectDialogBox open={open} onClose={() => setOpen(false)} mutation={mutation} />
        </div>
    );
}       