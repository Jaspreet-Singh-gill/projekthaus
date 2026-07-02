import React, { useState } from "react";
import ListOfNotesComponent from "../../components/notes/notesList";
import NotesCreateCard from "../../components/notes/notesCreateCard";
import { Plus } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetTheProject } from "../../hooks/project/useProject.js";

const ListOfNotes = () => {
    const [open, setOpen] = useState(false);
    const { projectId } = useParams();
    const navigate = useNavigate();
    const projectDetails = useGetTheProject(projectId);
    const isEditable = projectDetails.data?.data?.role === "ADMIN" ? true : false;

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-8 md:px-8 md:py-10 space-y-6 flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
            <button
                type="button"
                onClick={() => navigate(`/project/${projectId}`)}
                className="text-xs font-semibold text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer self-start"
            >
                &larr; Back to Project Dashboard
            </button>

            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-900/60">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                        Project Notes
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Organize thoughts, meeting minutes, and documentations in one place.
                    </p>
                </div>
                <button
                    onClick={() => setOpen(true)}
                    className={`${isEditable ? "" : "hidden"} flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-violet-600/10 hover:shadow-violet-600/25 active:scale-[0.98] cursor-pointer self-start sm:self-auto`}
                >
                    <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                    <span>Create Note</span>
                </button>
            </div>

            {/* Notes List Component */}
            <ListOfNotesComponent />

            {/* Create Note Modal */}
            <NotesCreateCard open={open} onClose={() => setOpen(false)} />
        </div>
    );
};

export default ListOfNotes;
