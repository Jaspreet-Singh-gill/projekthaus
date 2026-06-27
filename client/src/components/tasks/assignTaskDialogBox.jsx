import React from "react";
import { useGetTheMemberQuerry } from "../../hooks/member/useMember.js";
import { Dialog } from "../ui/Dialog.jsx";
import { toast } from "sonner";

const AssignedDialogBox = ({ listOfAssinged, assignedListMutation, open, onClose, projectId, taskAssignedOnes }) => {

    const memberData = useGetTheMemberQuerry(projectId);
    const members = memberData.data?.data?.filter((person) => {
        for (let val of listOfAssinged) {
            if (val.id === person._id)
                return false;
        }
        if (taskAssignedOnes) {
            for (let val of taskAssignedOnes) {
                if (val.id === person._id)
                    return true;
            }
            return false;
        }
        return true;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const assigned = formData.getAll("assigned").map(item => JSON.parse(item));

        if (assigned.length === 0) {
            toast.error("Please select at least one member to assign");
            return;
        }

        try {
            await assignedListMutation.mutateAsync({ "assignedList": assigned });
            toast.success("The task was assigned successfully");
            onClose();
        } catch (error) {
            toast.error(error.message || "Member assignment was unsuccessful");
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} title="Assign Project Members">
            {memberData.isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide animate-pulse">
                        Loading members...
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
                    {members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-full text-slate-400 dark:text-slate-500 mb-3">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">All members assigned</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
                                Every project member is already assigned to this task.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                Select members to assign to this task:
                            </p>
                            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                                {members.map((member) => (
                                    <label
                                        key={member._id || member.email}
                                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-200 cursor-pointer select-none group"
                                    >
                                        <input
                                            type="checkbox"
                                            name="assigned"
                                            value={JSON.stringify({
                                                id: member._id,
                                                email: member.email
                                            })}
                                            className="w-4 h-4 rounded text-violet-600 border-slate-300 dark:border-slate-700 focus:ring-violet-500 focus:ring-2 focus:ring-offset-0 cursor-pointer accent-violet-600 transition-colors"
                                        />
                                        <img
                                            src={member.avatar?.url || "/placeholder-avatar.png"}
                                            alt={`${member.name}'s avatar`}
                                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm transition-transform duration-200 group-hover:scale-105"
                                        />
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                {member.name}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                                {member.email}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={members.length === 0 || assignedListMutation.isPending}
                            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {assignedListMutation.isPending ? "Assigning..." : "Assign Task"}
                        </button>
                    </div>
                </form>
            )}
        </Dialog>
    );
};

export default AssignedDialogBox;