import React, { useState } from "react";
import { Dialog } from "../ui/index.js";
import { useCreateProjectMutation } from "../../hooks/project/useProject.js";
import { toast } from "sonner";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const projectVerify = z.object({
    projectName: z.string().min(1, "Project name is required"),
    projectDescription: z.string()
});

export const CreateProjectDialogBox = ({ open, onClose }) => {
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const mutation = useCreateProjectMutation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = projectVerify.safeParse({
            projectName,
            projectDescription
        });

        if (!payload.success) {
            toast.error(payload.error.errors[0]?.message);
            return;
        }

        try {
            await mutation.mutateAsync({
                name: projectName,
                description: projectDescription
            });

            toast.success("The project is created successfully");
            setProjectName("");
            setProjectDescription("");
            onClose();
            navigate("/dashboard");
            e.target.reset();
        } catch (error) {
            toast.error(error.message || "Failed to create project");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} title="Create Project">
            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                {/* Project Name Field */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="projectName"
                        className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                        Project Name
                    </label>
                    <input
                        id="projectName"
                        type="text"
                        placeholder="e.g., Phoenix Roadmap"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        disabled={mutation.isPending}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                        required
                    />
                </div>

                {/* Project Description Field */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="projectDescription"
                        className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                        Project Description
                    </label>
                    <textarea
                        id="projectDescription"
                        placeholder="Describe the goals, timeline, and scope of this project..."
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        disabled={mutation.isPending}
                        rows={4}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all duration-200 resize-none disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                        required
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={mutation.isPending}
                        className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-xl shadow-md shadow-violet-500/10 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <span>Submit</span>
                        )}
                    </button>
                </div>
            </form>
        </Dialog>
    );
};

export default CreateProjectDialogBox;