import React from "react";
import { useNavigate } from "react-router-dom";
import { Folder, ArrowRight } from "lucide-react";

const ProjectCard = ({ _id, projectName, projectDescription }) => {
    const navigate = useNavigate();
    return (
        <div 
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 p-6 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/5"
            key={_id}
        >
            {/* Soft gradient glow effect on hover */}
            <div className="absolute -inset-px bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-10 blur-sm transition duration-500 pointer-events-none"></div>

            {/* Header Content */}
            <div className="relative">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600/10 to-indigo-600/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:from-violet-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-violet-500/5 shrink-0">
                            <Folder className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200 line-clamp-1">
                                {projectName}
                            </h3>
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                Active Project
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-6">
                    {projectDescription || "No description provided. Add one to describe the goals, timeline, and scope of this project."}
                </p>
            </div>

            {/* Action Footer */}
            <div className="relative flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-900/60 mt-auto">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Click to view workspace</span>
                <button 
                    onClick={() => navigate(`/project/${_id}`)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors duration-200 cursor-pointer"
                >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    );
}

export default ProjectCard;