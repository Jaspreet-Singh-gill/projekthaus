import React, { useState } from "react";
import { useCreateNote } from "../../hooks/notes/useNotes";
import { useParams } from "react-router-dom";
import { Dialog } from "../ui/Dialog.jsx";
import { toast } from "sonner";
import * as z from "zod";
import { Loader2, Pin } from "lucide-react";

const CATEGORIES = ["General", "Meeting", "Documentation", "Idea", "Research", "Instructions"];

const notesVerify = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().optional().default(""),
    category: z.string().min(1, "Category is required"),
    isPinned: z.boolean().default(false)
});

const NotesCreateCard = ({ open, onClose }) => {
    const { projectId } = useParams();
    const mutation = useCreateNote(projectId);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("General");
    const [isPinned, setIsPinned] = useState(false);
    const [files, setFiles] = useState(null);

    const resetForm = () => {
        setTitle("");
        setContent("");
        setCategory("General");
        setIsPinned(false);
        setFiles(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = notesVerify.safeParse({
            title,
            content,
            category,
            isPinned
        });

        if (!result.success) {
            toast.error(result.error.issues[0]?.message || "Please fill in all required fields");
            return;
        }

        try {
            await mutation.mutateAsync({

                title: result.data.title,
                content: result.data.content,
                category: result.data.category,
                isPinned: result.data.isPinned,
                pinned: result.data.isPinned
            },
                files ? Array.from(files) : undefined
            );
            toast.success("Note created successfully!");
            handleClose();
        } catch (error) {
            toast.error(error.message || "Failed to create note");
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} title="Create New Note">
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {/* Title Field */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="title"
                        className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                    >
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        placeholder="Note title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={mutation.isPending}
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                        required
                    />
                </div>

                {/* Category & Pinned Toggle Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Field */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="category"
                            className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                        >
                            Category
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={mutation.isPending}
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm cursor-pointer"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat} className="bg-slate-950 text-slate-200">
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Pinned Toggle Field */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Pin Note
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsPinned(!isPinned)}
                            disabled={mutation.isPending}
                            className={`flex items-center justify-center gap-2 px-3.5 py-2 h-[38px] rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer ${isPinned
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                                }`}
                        >
                            <Pin className={`w-4 h-4 ${isPinned ? "fill-amber-400/20 text-amber-400" : "text-slate-400"}`} />
                            <span>{isPinned ? "Pinned" : "Pin to top"}</span>
                        </button>
                    </div>
                </div>

                {/* Content Field */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="content"
                        className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                    >
                        Content
                    </label>
                    <textarea
                        id="content"
                        placeholder="Write your note content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={mutation.isPending}
                        rows={4}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 resize-none disabled:opacity-60 disabled:cursor-not-allowed text-sm leading-relaxed"
                    />
                </div>

                {/* Attach Files Field */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="files"
                        className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                    >
                        Attach Files
                    </label>
                    <input
                        id="files"
                        type="file"
                        multiple
                        onChange={(e) => setFiles(e.target.files)}
                        disabled={mutation.isPending}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer transition-all duration-200"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80 mt-5">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={mutation.isPending}
                        className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-slate-800 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <span>Create Note</span>
                        )}
                    </button>
                </div>
            </form>
        </Dialog>
    );
};

export default NotesCreateCard;

