import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    useGetTheTask,
    useUpdateTask,
    useDeleteTask,
    assignMember,
    deleteMember,
    useAssignedMemberTaskUpdation
} from "../../hooks/task/useTask.js";
import { Loader } from "../../components/skeleton/loader.jsx";
import { toast } from "sonner";
import AssignedDialogBox from "../../components/tasks/assignTaskDialogBox.jsx";
import { useGetTheProject } from "../../hooks/project/useProject.js";
const TaskDashBoard = () => {
    const { projectId, taskId } = useParams();
    const navigate = useNavigate();

    const taskData = useGetTheTask(projectId, taskId);
    const updateMutation = useUpdateTask(projectId, taskId);
    const deleteMutation = useDeleteTask(projectId, taskId);
    const [openAssigned, setOpenAssigned] = useState(false);
    const mutationOfAssigned = assignMember(projectId, taskId);
    const mutationDeleteTheMember = deleteMember(projectId, taskId);
    const projectInfo = useGetTheProject(projectId);
    const assignedUpdationTask = useAssignedMemberTaskUpdation(projectId, taskId);
    let isEditable = true;


    if (taskData.isLoading) {
        return <Loader />;
    }

    const role = projectInfo.data?.data?.role;
    if (role === "MEMBER")
        isEditable = false;

    const task = taskData.data?.data;

    if (!task) {
        return (
            <div>
                <p>Task not found</p>
                <button onClick={() => navigate(`/project/${projectId}/get-all-tasks`)}>
                    Back to Tasks
                </button>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name");
        const description = formData.get("description");
        const startDate = formData.get("startDate");
        const endDate = formData.get("endDate");
        const priority = formData.get("priority");
        const status = formData.get("status");
        const progress = Number(formData.get("progress"));

        if (!name || name.trim().length < 3) {
            toast.error("Task name must be at least 3 characters");
            return;
        }

        try {
            if (isEditable) {
                await updateMutation.mutateAsync({
                    name,
                    description,
                    startDate,
                    endDate,
                    priority,
                    status,
                    progress
                });
            } else {
                await assignedUpdationTask.mutateAsync({
                    progress,
                    status
                })
            }
            toast.success("Task updated successfully");
        } catch (error) {
            toast.error(error.message || "Failed to update task");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteMutation.mutateAsync();
            toast.success("Task deleted successfully");
            navigate(`/project/${projectId}/get-all-tasks`);
        } catch (error) {
            toast.error(error.message || "Failed to delete task");
        }
    };

    const removeTheMemver = async (assigne) => {

        try {
            const isAllowed = window.confirm("Do you want to remove the member from this ask");
            if (!isAllowed)
                return;

            await mutationDeleteTheMember.mutateAsync({ assignedMemeberId: assigne.id });
            toast.success("The member is removed from the project successFully");

        } catch (error) {
            toast.error(error.message || "The given member cannot be removed from the task");
        }

    }

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-4 text-slate-100 font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                <button
                    type="button"
                    onClick={() => navigate(`/project/${projectId}/get-all-tasks`)}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                    &larr; Back to Tasks
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending || !isEditable}
                    className="px-3 py-1 text-xs font-bold bg-rose-600/10 text-rose-400 border border-rose-900/30 hover:bg-rose-600 hover:text-white rounded transition cursor-pointer"
                >
                    Delete Task
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Side: Title and Description (Spans 2/3 of grid) */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Task Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            defaultValue={task.name}
                            disabled={updateMutation.isPending}
                            readOnly={!isEditable}
                            className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-900 focus:border-indigo-500 rounded text-slate-200 outline-none text-sm placeholder-slate-650 transition-colors"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="description" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            defaultValue={task.description}
                            disabled={updateMutation.isPending}
                            rows={8}
                            readOnly={!isEditable}
                            className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-900 focus:border-indigo-500 rounded text-slate-200 outline-none text-sm placeholder-slate-650 resize-none transition-colors"
                            placeholder="Task description..."
                        />
                    </div>
                </div>

                {/* Right Side: Status and other info (Spans 1/3, right-most column) */}
                <div className="md:col-span-1 space-y-4 bg-slate-950/20 border border-slate-900/50 p-4 rounded-lg">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="status" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                        <select
                            id="status"
                            name="status"
                            defaultValue={task.status}
                            disabled={updateMutation.isPending}
                            className="w-full px-2 py-1.5 bg-slate-950/60 border border-slate-900 focus:border-indigo-500 rounded text-slate-200 outline-none text-sm cursor-pointer transition-colors"
                        >
                            <option value="TODO">Todo</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="priority" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority</label>
                        <select
                            id="priority"
                            name="priority"
                            defaultValue={task.priority}
                            disabled={updateMutation.isPending || !isEditable}

                            className="w-full px-2 py-1.5 bg-slate-950/60 border border-slate-900 focus:border-indigo-500 rounded text-slate-200 outline-none text-sm cursor-pointer transition-colors"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="progress" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Progress (%)</label>
                        <input
                            id="progress"
                            type="number"
                            name="progress"
                            min="0"
                            max="100"
                            defaultValue={task.progress ?? 0}
                            disabled={updateMutation.isPending}
                            className="w-full px-2 py-1.5 bg-slate-950/60 border border-slate-900 focus:border-indigo-500 rounded text-slate-200 outline-none text-sm transition-colors"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="startDate" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                        <input
                            id="startDate"
                            type="date"
                            name="startDate"
                            defaultValue={task.startDate ? task.startDate.split("T")[0] : ""}
                            disabled={updateMutation.isPending}
                            readOnly={!isEditable}
                            className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-900 focus:border-indigo-500 rounded text-slate-200 outline-none text-sm cursor-pointer transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="endDate" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                        <input
                            id="endDate"
                            type="date"
                            name="endDate"
                            defaultValue={task.endDate ? task.endDate.split("T")[0] : ""}
                            disabled={updateMutation.isPending}
                            readOnly={!isEditable}
                            className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-900 focus:border-indigo-500 rounded text-slate-200 outline-none text-sm cursor-pointer transition-colors"
                        />
                    </div>

                    <div className="pt-2 border-t border-slate-900/60">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Assigned To</label>
                        {task.assigned && task.assigned.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {task.assigned.map((assignee, idx) => (
                                    <span key={idx} className="bg-slate-900 px-2 py-0.5 flex gap-2 rounded border border-slate-800 text-xs text-slate-350 select-none">
                                        <div>{assignee.email}</div>
                                        <button type="button" className={`${!isEditable ? "hidden" : ""}`} onClick={() => removeTheMemver(assignee)}>x</button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-550 italic">No members assigned.</p>
                        )}

                        <button
                            type="button"
                            onClick={() => setOpenAssigned(true)}
                            disabled={!isEditable}
                            className="mt-2 w-full px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 hover:text-white rounded-md transition-colors cursor-pointer text-center block"
                        >
                            Assign Task
                        </button>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="w-full px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition cursor-pointer disabled:opacity-50"
                        >
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

            </form>

            <AssignedDialogBox listOfAssinged={taskData.data?.data?.assigned} assignedListMutation={mutationOfAssigned} open={openAssigned} onClose={() => setOpenAssigned(false)} projectId={projectId} />
        </div>
    );
};

export default TaskDashBoard;