import React from "react";
import Dialog from "../ui/Dialog.jsx";
import { useGetTheMemberQuerry, useUpdateTheRole } from "../../hooks/member/useMember.jsx";
import { Loader } from "../skeleton/loader.jsx";
import { toast } from "sonner";

const MembersOfTheProject = ({ dataOfProject, open, onClose }) => {
    const memberData = useGetTheMemberQuerry(dataOfProject?._id);
    const members = memberData.data?.data || [];
    const mutation = useUpdateTheRole(dataOfProject?._id);
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


    return (
        <Dialog open={open} onClose={onClose} title="Project Members">
            {/* 2. Show loading spinner while fetching */}
            {memberData.isLoading ? (
                <div className="flex justify-center py-4">
                    <Loader />
                </div>
            ) : (
                /* 3. Render the list of members */
                <div className="flex flex-col gap-3">
                    {members.map((member) => (
                        <div
                            key={member._id || member.email}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            {/* Left side: Avatar, Name & Email */}
                            <div className="flex items-center gap-3">
                                <img
                                    src={member.avatar?.url || "/placeholder-avatar.png"}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-800">{member.name}</span>
                                    <span className="text-xs text-gray-500">{member.email}</span>
                                </div>
                            </div>

                            {/* Right side: Role Badge */}
                            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                                <select defaultValue={member?.role} onChange={(e) => onUserChange(e, member)}>
                                    <option value="ADMIN">
                                        ADMIN
                                    </option>
                                    <option value="PROJECT_MANAGER">
                                        PROJECT MANAGER
                                    </option>
                                    <option value="MEMBER">
                                        MEMBER
                                    </option>
                                </select>

                            </span>
                        </div>
                    ))}
                </div>
            )}
        </Dialog>
    );
};

export default MembersOfTheProject;