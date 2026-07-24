import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetTheProject, useUpdateTheProject, useDeleteProjectMutation } from "../../hooks/project/useProject.js";
import UpdateProjectDialogBox from "../../components/projects/createProjectDialogBox.jsx";
import MemberDialogBox from "../../components/member/memberOfProject.jsx";
import { EditIcon, Trash2 } from "lucide-react";
import { Loader } from "../../components/skeleton/loader.jsx";
import useProjectSocket from "../../hooks/sockets/useProjectSocket.js";


const ProjectDashBoard = () => {
    const { projectId } = useParams();
    const theProject = useGetTheProject(projectId);
    console.log(projectId);
    const roleOfUser = theProject.data?.data?.role;
    const [isAdminEditDialogOpen, setIsAdminEditDialogBox] = useState(false);
    const mutation = useUpdateTheProject(projectId);
    const deleteMutation = useDeleteProjectMutation();
    const [isMemberBoxOpen, setIsMemberBoxOpen] = useState(false);
    const navigate = useNavigate();
    
    useProjectSocket(projectId);

    const handleDelete = () => {
        if (window.confirm("do you want to delete the project")) {
            deleteMutation.mutate(projectId, {
                onSuccess: () => {
                    navigate("/dashboard");
                }
            });
        }
    };

    return <>
        {
            theProject.isLoading ? <Loader className="w-full h-full" /> :
                <div className="w-full max-w-7xl mx-auto px-6 py-8 md:px-8 md:py-10 space-y-8 flex flex-col text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
                    {/* Project Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-900/60">
                        <div className="space-y-3 min-w-0 flex-1">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                                {theProject.data.data.projectName}
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl" title={theProject.data.data.projectDescription}>
                                {theProject.data.data.projectDescription}
                            </p>

                            {/* User Role Badge */}
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900/60 rounded-lg px-3 py-1.5 self-start text-xs font-semibold text-slate-600 dark:text-slate-400 w-fit">
                                <span>Role:</span>
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${roleOfUser === "ADMIN"
                                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                                    : roleOfUser === "PROJECT_MANAGER"
                                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    }`}>
                                    {roleOfUser?.replace("_", " ")}
                                </span>
                            </div>
                        </div>
                        <div className={`flex gap-2 ${roleOfUser !== "ADMIN" ? "hidden" : ""}`}>
                            <button
                                onClick={() => setIsAdminEditDialogBox(true)}
                                className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200 shadow-md active:scale-[0.98] cursor-pointer mt-1"
                                title="Edit Project Details"
                            >
                                <EditIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteMutation.isLoading || deleteMutation.isPending}
                                className="flex items-center justify-center p-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 shadow-md active:scale-[0.98] cursor-pointer mt-1 disabled:opacity-50"
                                title="Delete Project"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                                    
                    {/* Quick Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200 dark:border-slate-900/30">
                        <button
                            onClick={() => navigate(`/project/${projectId}/get-all-tasks`)}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-all duration-200 active:scale-[0.99] cursor-pointer shadow-md">
                            Tasks
                        </button>
                        <button
                            onClick={() => setIsMemberBoxOpen(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-all duration-200 active:scale-[0.99] cursor-pointer shadow-md">
                            Members
                        </button>
                        <button
                            onClick={() => navigate(`/project/${projectId}/notes`)}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-all duration-200 active:scale-[0.99] cursor-pointer shadow-md">
                            Notes
                        </button>
                        <button
                            onClick={() => navigate(`/project/${projectId}/analytics`)}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 hover:border-slate-300 dark:hover:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-all duration-200 active:scale-[0.99] cursor-pointer shadow-md">
                            Analytics
                        </button>
                    </div>

                    <UpdateProjectDialogBox open={isAdminEditDialogOpen} onClose={() => setIsAdminEditDialogBox(false)} mutation={mutation} data={theProject.data?.data} />
                    {isMemberBoxOpen && (
                        <MemberDialogBox open={isMemberBoxOpen} onClose={() => setIsMemberBoxOpen(false)} dataOfProject={theProject.data?.data} />
                    )}
                </div>
        }

    </>



}

export default ProjectDashBoard;