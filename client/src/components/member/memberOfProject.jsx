import React from "react";
import Dialog from "../ui/Dialog.jsx";
import { useGetTheMemberQuerry, useUpdateTheRole, useAddMember, useRemoveMember } from "../../hooks/member/useMember.js";
import { Loader } from "../skeleton/loader.jsx";
import { toast } from "sonner";
import { PlusIcon, DeleteIcon, Loader2 } from "lucide-react";

const MembersOfTheProject = ({ dataOfProject, open, onClose }) => {
    const memberData = useGetTheMemberQuerry(dataOfProject?._id);
    const members = memberData.data?.data || [];
    const mutation = useUpdateTheRole(dataOfProject?._id);
    const isAdmin = dataOfProject?.role === "ADMIN" ? true : false;
    const memberMutationAdd = useAddMember(dataOfProject?._id);
    const memberMutationRemove = useRemoveMember(dataOfProject?._id);
    const onUserChange = async (e, member) => {
        try {
            await mutation.mutateAsync({ userId: member._id, role: e.target.value });
            toast.success("Members role changed successFully");

        } catch (error) {
            toast.error(
                error.message ||
                "Change of user was unsuccessful"
            );
        }
    }

    const removeTheMember = async (userId) => {
        let wantToDelete = window.confirm("Do you want to remove this member from the project ?");
        if (!wantToDelete)
            return;
        try {
            await memberMutationRemove.mutateAsync({ userId });
            toast.success("The member is removed successFully");

        } catch (error) {
            toast.error(error.message || "The user cannot be removed from the project");
        }
    }

    const addMemberFunction = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            await memberMutationAdd.mutateAsync({ "memberEmail": formData.get("email") });
            toast.success("The join the project is send to the member");
            e.target.reset();

        } catch (error) {
            toast.error(error.message || "Something went wrong while add the member");

        }
    }
    return (
        <Dialog open={open} onClose={onClose} title="Project Members">
            {/* 2. Show loading spinner while fetching */}
            {memberData.isLoading ? (
                <div className="flex justify-center py-6">
                    <Loader />
                </div>
            ) : (
                /* 3. Render the list of members */
                <div className="flex flex-col gap-4">
                    {/* Add Member Form */}
                    <form onSubmit={(e) => addMemberFunction(e)} className={`${!isAdmin ? "hidden" : ""} flex gap-2 w-full`}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email address"
                            required
                            className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={memberMutationAdd.isPending}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-sm hover:shadow"
                        >
                            {memberMutationAdd.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
                            <span>Add</span>
                        </button>
                    </form>

                    {/* Member List Container */}
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {members.map((member) => (
                            <div
                                key={member._id || member.email}
                                className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl transition-all duration-200"
                            >
                                {/* Left side: Avatar, Name & Email */}
                                <div className="flex items-center gap-3">
                                    <img
                                        src={member.avatar?.url || "/placeholder-avatar.png"}
                                        alt={`${member.name}'s avatar`}
                                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                            {member.name}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {member.email}
                                        </span>
                                    </div>
                                </div>

                                {/* Right side Actions & Badges */}
                                <div className="flex items-center gap-2">
                                    <select
                                        defaultValue={member?.role}
                                        onChange={(e) => onUserChange(e, member)}
                                        disabled={!isAdmin}
                                        className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-1 focus:outline-none cursor-pointer disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:border-slate-100 dark:disabled:border-slate-800 disabled:cursor-not-allowed transition-all"
                                    >
                                        <option value="ADMIN" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">ADMIN</option>
                                        <option value="PROJECT_MANAGER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">PROJECT MANAGER</option>
                                        <option value="MEMBER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">MEMBER</option>
                                    </select>

                                    {isAdmin && (
                                        <button
                                            onClick={() => removeTheMember(member?._id)}
                                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                                            title="Remove member"
                                        >
                                            <DeleteIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Dialog>
    );
};

export default MembersOfTheProject; 