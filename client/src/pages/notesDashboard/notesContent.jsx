import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    useGetNote,
    useUpdateNote,
    useDeleteNote,
    useAttachNoteFiles,
    useGetAllNoteFiles,
    useDeleteNoteFile
} from "../../hooks/notes/useNotes.js";
import { useGetTheProject } from "../../hooks/project/useProject.js";
import { useGetTheMemberQuerry } from "../../hooks/member/useMember.js";
import { Loader } from "../../components/skeleton/loader.jsx";
import FileComponent from "../../components/tasks/fileComponent.jsx";
import useProjectSocket from "../../hooks/sockets/useProjectSocket.js";
import { toast } from "sonner";
import { Pin, Paperclip, User } from "lucide-react";

const CATEGORIES = ["General", "Meeting", "Documentation", "Idea", "Research", "Instructions"];

const NoteContent = () => {
    const { projectId, noteId } = useParams();
    useProjectSocket(projectId);
    const navigate = useNavigate();

    const noteData = useGetNote(projectId, noteId);
    const updateMutation = useUpdateNote(projectId, noteId);
    const deleteMutation = useDeleteNote(projectId, noteId);

    const projectInfo = useGetTheProject(projectId);

    const attachFileToNote = useAttachNoteFiles(projectId, noteId);
    const deleteFileFromNote = useDeleteNoteFile(projectId, noteId);
    const getAllTheFiles = useGetAllNoteFiles(projectId, noteId);

    const [displayFiles, setDisplayFiles] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const memberRoles = useGetTheMemberQuerry(projectId);

    const note = noteData.data?.data;

    useEffect(() => {
        if (note) {
            setIsPinned(note.isPinned ?? note.pinned ?? false);
        }
    }, [note]);

    let isEditable = false;
    const role = projectInfo.data?.data?.role;
    if (role === "ADMIN") {
        isEditable = true;
    }

    if (noteData.isLoading) {
        return <Loader />;
    }

    if (!note) {
        return (
            <div className="max-w-5xl mx-auto p-6 text-center text-slate-200">
                <p className="mb-4 text-base font-semibold text-slate-400">Note not found</p>
                <button
                    onClick={() => navigate(`/project/${projectId}/notes`)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer"
                >
                    Back to Notes
                </button>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get("title");
        const content = formData.get("content");
        const category = formData.get("category");

        if (!title || title.trim().length < 1) {
            toast.error("Note title is required");
            return;
        }

        try {
            await updateMutation.mutateAsync({
                title,
                content,
                category,
                isPinned,
                pinned: isPinned
            });
            toast.success("Note updated successfully");
        } catch (error) {
            toast.error(error.message || "Failed to update note");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this note?")) return;
        try {
            await deleteMutation.mutateAsync();
            toast.success("Note deleted successfully");
            navigate(`/project/${projectId}/notes`);
        } catch (error) {
            toast.error(error.message || "Failed to delete note");
        }
    };

    const createdByDisplay = memberRoles.data?.data?.find(userObj => userObj._id === note.createdBy);


    return (
        <div className="max-w-5xl mx-auto p-4 space-y-4 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-900">
                <button
                    type="button"
                    onClick={() => navigate(`/project/${projectId}/notes`)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                    &larr; Back to Notes
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending || !isEditable}
                    className="px-3 py-1 text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-900/30 hover:bg-rose-600 hover:text-white rounded transition cursor-pointer disabled:opacity-50"
                >
                    {deleteMutation.isPending ? "Deleting..." : "Delete Note"}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Side: Title, Content, and Files downward of content */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="title" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Note Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            defaultValue={note.title}
                            disabled={updateMutation.isPending}
                            readOnly={!isEditable}
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 focus:border-indigo-500 rounded text-slate-900 dark:text-slate-200 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="content" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Content
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            defaultValue={note.content}
                            disabled={updateMutation.isPending}
                            rows={14}
                            readOnly={!isEditable}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 focus:border-indigo-500 rounded text-slate-900 dark:text-slate-200 outline-none text-sm placeholder-slate-400 dark:placeholder-slate-500 resize-none transition-colors leading-relaxed min-h-[320px]"
                            placeholder="Note content..."
                        />
                    </div>

                    {/* File button downward of content */}
                    <div className="flex items-center gap-2 pt-2">
                        <button
                            onClick={() => setDisplayFiles((prev) => !prev)}
                            type="button"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{displayFiles ? "Hide Files" : "Files"}</span>
                        </button>
                    </div>

                    <div>
                        {displayFiles && (
                            <FileComponent
                                getAllFiles={getAllTheFiles}
                                deleteFile={deleteFileFromNote}
                                attachFile={attachFileToNote}
                                isEditable={isEditable}
                            />
                        )}
                    </div>
                </div>

                {/* Right Side: Category, Pinned, Created By info */}
                <div className="md:col-span-1 space-y-4 bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900/50 p-4 rounded-xl shadow-sm h-fit">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="category" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            defaultValue={note.category || "General"}
                            disabled={updateMutation.isPending || !isEditable}
                            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 focus:border-indigo-500 rounded text-slate-900 dark:text-slate-200 outline-none text-sm cursor-pointer transition-colors"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Pin Status
                        </label>
                        <button
                            type="button"
                            onClick={() => isEditable && setIsPinned(!isPinned)}
                            disabled={updateMutation.isPending || !isEditable}
                            className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md text-xs font-semibold transition-all duration-200 border cursor-pointer ${isPinned
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                                : "bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-900 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                                } ${!isEditable ? "cursor-not-allowed opacity-60" : ""}`}
                        >
                            <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-amber-400/20 text-amber-500 dark:text-amber-400" : "text-slate-400"}`} />
                            <span>{isPinned ? "Pinned Note" : "Pin Note"}</span>
                        </button>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-900/60">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                            Created By
                        </label>
                        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-900 text-xs text-slate-700 dark:text-slate-300">
                            {createdByDisplay?.avatar?.url? (
                                <img
                                    src={createdByDisplay?.avatar?.url || createdByDisplay?.url}
                                    alt={createdByDisplay?.name || createdByDisplay?.email || "User avatar"}
                                    className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700/80"
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                    <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            )}
                            <div className="flex flex-col min-w-0 flex-1">
                                {createdByDisplay?.name && (
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-xs leading-snug">
                                        {createdByDisplay.name}
                                    </span>
                                )}
                                <span className="truncate text-[11px] text-slate-500 dark:text-slate-400 font-medium" title={createdByDisplay?.email || (typeof note.createdBy === "string" ? note.createdBy : "Unknown User")}>
                                    {createdByDisplay?.email || (typeof note.createdBy === "string" ? note.createdBy : "Unknown User")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending || !isEditable}
                            className="w-full px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition cursor-pointer disabled:opacity-50"
                        >
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NoteContent;
