import React, { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useProjectQuery, useCreateProjectMutation } from "../../hooks/project/useProject.js";
import Skeleton from "../ui/Skeleton.jsx";
import { Separator } from "../ui/index.js";
import CreateProjectDialogBox from "../projects/createProjectDialogBox.jsx";
import { Plus, LayoutDashboard, Folder } from "lucide-react";

const SideBar = ({ className }) => {
    const location = useLocation();
    const projectsList = useProjectQuery();
    const mutation = useCreateProjectMutation();

    const [openCreateButton, setOpenCreateButton] = useState(false);

    return (
        <>
            <div className={`${className} w-full h-full flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 text-slate-800 dark:text-slate-200 select-none transition-colors duration-200`}>
                {/* Logo & Brand Header */}
                <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-200 dark:border-slate-900/60">
                    <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-violet-500/10">
                        <img className="w-4.5 h-4.5 text-white" src="logo.svg" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
                        projekt<span className="text-violet-600 dark:text-violet-400">Haus</span>
                    </span>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
                    {/* General Navigation Group */}
                    <div className="space-y-1.5">
                        <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Navigation
                        </div>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-violet-500/10 dark:bg-violet-600/10 text-violet-600 dark:text-violet-400 font-semibold"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60"
                                }`
                            }
                        >
                            <LayoutDashboard className="w-4.5 h-4.5" />
                            <span>Dashboard</span>
                        </NavLink>
                    </div>

                    <Separator className="bg-slate-200 dark:bg-slate-900/60" />

                    {/* Projects Group */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-3 mb-1">
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                Projects
                            </span>
                        </div>

                        <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
                            {/* Loading State */}
                            {projectsList.isLoading && (
                                <div className="space-y-2 px-2">
                                    <Skeleton className="h-8 w-full bg-slate-100 dark:bg-slate-900/40 rounded-lg" />
                                    <Skeleton className="h-8 w-full bg-slate-100 dark:bg-slate-900/40 rounded-lg" />
                                    <Skeleton className="h-8 w-full bg-slate-100 dark:bg-slate-900/40 rounded-lg" />
                                </div>
                            )}

                            {/* Error State */}
                            {projectsList.isError && (
                                <div className="px-3 py-2 text-xs text-rose-500 dark:text-rose-400 bg-rose-500/10 rounded-lg border border-rose-500/20">
                                    Failed to load projects
                                </div>
                            )}

                            {/* Project List */}
                            {!projectsList.isLoading && !projectsList.isError && projectsList.data && (
                                <>
                                    {projectsList.data.data.length === 0 ? (
                                        <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-900/50">
                                            No projects found
                                        </div>
                                    ) : (
                                        projectsList.data.data.map((project) => {
                                            const isActive = location.pathname.startsWith(`/project/${project._id}`);
                                            return (
                                                <Link
                                                    key={project._id}
                                                    to={`/project/${project._id}`}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                                        ? "bg-violet-500/10 dark:bg-violet-600/10 text-violet-600 dark:text-violet-400 font-semibold border-l-2 border-violet-500 pl-2.5"
                                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60"
                                                        }`}
                                                >
                                                    <Folder className={`w-4 h-4 transition-colors ${isActive ? "text-violet-500 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"}`} />
                                                    <span className="truncate">{project.projectName}</span>
                                                </Link>
                                            );
                                        })
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {/* Bottom Action Area */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-900/60 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm">
                    <button
                        onClick={() => setOpenCreateButton(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-violet-600/10 hover:shadow-violet-600/25 active:scale-[0.98] cursor-pointer"
                        title="Create Project"
                    >
                        <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                        <span>Create Project</span>
                    </button>
                </div>
                <CreateProjectDialogBox open={openCreateButton} onClose={() => setOpenCreateButton(false)} mutation={mutation} />
            </div>
        </>
    );
}

export default SideBar;