import React from "react";
import { Dialog } from "../ui/index.js";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const task = z.object({
    name: z
        .string()
        .min(3, "Project name must be at least 3 characters")
        .max(100, "Project name cannot exceed 100 characters"),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(1000, "Description cannot exceed 1000 characters"),

    startDate: z.coerce.date({
        error: "Please provide a valid start date",
    }),

    endDate: z.coerce.date({
        error: "Please provide a valid end date",
    }),

    priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
        error: "Priority must be LOW, MEDIUM, or HIGH",
    }),

    status: z.enum(
        ["TODO", "IN_PROGRESS", "COMPLETED"],
        {
            error: "Invalid project status",
        }
    ),

    progress: z.coerce
        .number()
        .min(0, "Progress cannot be less than 0")
        .max(100, "Progress cannot exceed 100"),
});

const TaskDialogBox = ({ open, onClose, mutation, isTask }) => {

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.currentTarget));
        const taskObject = task.safeParse(formData);
        if (!taskObject.success) {
            toast.error(taskObject.error.issues[0].message || "please fill the form properly");
            return;
        }

        try {

            await mutation.mutateAsync(taskObject.data);
            toast.success("Task created successfully");
            onClose();
        } catch (error) {
            toast.error(error.message || "Failed to create task");
        }
    }

    return (
        <Dialog open={open} onClose={onClose} title={!isTask ? "Create New SubTask" : "Create New Task"}>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {/* Task Name Field */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="name"
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                    >
                        Task Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="e.g., Design user dashboard"
                        disabled={mutation.isPending}
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                        required
                    />
                </div>

                {/* Description Field */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="description"
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                    >
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Provide a detailed description of the task..."
                        disabled={mutation.isPending}
                        rows={3}
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all duration-200 resize-none disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                        required
                    />
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="startDate"
                            className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                        >
                            Start Date
                        </label>
                        <input
                            id="startDate"
                            type="date"
                            name="startDate"
                            disabled={mutation.isPending}
                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="endDate"
                            className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                        >
                            End Date
                        </label>
                        <input
                            id="endDate"
                            type="date"
                            name="endDate"
                            disabled={mutation.isPending}
                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                            required
                        />
                    </div>
                </div>

                {/* Priority & Status Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="priority"
                            className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                        >
                            Priority
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            disabled={mutation.isPending}
                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm cursor-pointer"
                            required
                        >
                            <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Select Priority</option>
                            <option value="LOW" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Low</option>
                            <option value="MEDIUM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Medium</option>
                            <option value="HIGH" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">High</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="status"
                            className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                        >
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            disabled={mutation.isPending}
                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm cursor-pointer"
                            required
                        >
                            <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Select Status</option>
                            <option value="TODO" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Todo</option>
                            <option value="IN_PROGRESS" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">In Progress</option>
                            <option value="COMPLETED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Completed</option>
                        </select>
                    </div>
                </div>

                {/* Progress Input */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="progress"
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                    >
                        Progress (%)
                    </label>
                    <input
                        id="progress"
                        type="number"
                        name="progress"
                        min="0"
                        max="100"
                        disabled={mutation.isPending}
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                        required
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={mutation.isPending}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-xl shadow-md shadow-violet-500/10 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <span>Save Task</span>
                        )}
                    </button>
                </div>
            </form>
        </Dialog>
    )
}

export default TaskDialogBox;