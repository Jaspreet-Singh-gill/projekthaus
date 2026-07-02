import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../../api/index.js";
import { toast } from "sonner";
import { Loader } from "../../components/skeleton/loader.jsx";
import { FolderPlus, ArrowRight } from "lucide-react";

const JoinProject = () => {
    const { projectId, token } = useParams();
    const navigate = useNavigate();
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async () => {
        try {
            setIsJoining(true);
            const data = await projectService.joinTheProject(projectId, token);
            setIsJoining(false);
            toast.success(data.message || "Successfully joined the project!");
            setTimeout(() => {
                navigate(`/project/${projectId}`);
            }, 1500);
        } catch (error) {
            setIsJoining(false);
            toast.error(error.response?.data?.message || error.message || "Failed to join project");
        }
    };

    return isJoining ? <Loader /> : (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative py-12 px-4 font-sans transition-colors duration-200">
            {/* Ambient background glow */}
            <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-violet-600/5 dark:bg-violet-600/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-600/5 dark:bg-blue-600/5 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xl relative z-10 text-center animate-fade-in">
                <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 mx-auto mb-6">
                    <FolderPlus className="w-8 h-8 text-white stroke-[1.5]" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Project Invitation
                </h1>
                <p className="text-sm text-slate-650 dark:text-slate-450 mt-3 leading-relaxed">
                    You have been invited to collaborate on a project workspace in **ProjektHaus**. 
                </p>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={handleJoin}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-md active:scale-[0.98] transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <span>Accept Invitation & Join</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-350 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-850 transition-colors cursor-pointer text-xs"
                    >
                        Decline & Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinProject;
