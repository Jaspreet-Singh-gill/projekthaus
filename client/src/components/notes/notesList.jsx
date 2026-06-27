import React, { useState, useMemo } from "react";
import { useGetAllNotes } from "../../hooks/notes/useNotes.js";
import { useParams, useNavigate } from "react-router-dom";
import { Loader } from "../../components/skeleton/loader.jsx";
import NoteCard from "./noteListCard.jsx";
import { Search, ChevronDown, Pin, ArrowUpDown, Filter, StickyNote } from "lucide-react";

const CATEGORIES = ["General", "Meeting", "Documentation", "Idea", "Research", "Instructions"];

const ListOfNotes = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const notes = useGetAllNotes(projectId);
    const [sorted, setIsSorted] = useState(0);
    const [category, setTheCategory] = useState("");
    const [pinned, setIsPinned] = useState(false);
    const [searchInput, setTheSearchInput] = useState("");

    const filteredNotes = useMemo(() => {
        let data = [];
        if (!notes.isLoading)
            data = [...(notes.data?.data)];
        if (category) {
            data = data.filter(note => note.category === category);
        }

        if (searchInput) {
            const search = searchInput.toLowerCase();
            data = data.filter(note =>
                note.title.toLowerCase().includes(search) ||
                note.content.toLowerCase().includes(search)
            );
        }
        if (pinned) {
            data = data.filter(note => note.isPinned);
        }

        if (sorted === 1) {
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sorted === -1) {
            data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        return data;
    }, [
        notes.data?.data,
        category,
        searchInput,
        pinned,
        sorted
    ]);

    if (notes.isLoading) {
        return <Loader />;
    }

    return (
        <div className="space-y-6">
            {/* Control Bar: Search & Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-lg">
                {/* Search Input */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        className="w-full pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl transition-all duration-200 outline-none"
                        placeholder="Search notes..."
                        value={searchInput}
                        onChange={(e) => setTheSearchInput(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                    {/* Category Select */}
                    <div className="flex items-center gap-2 bg-slate-900/30 border border-slate-800 rounded-xl px-3 py-2 hover:border-slate-700 transition-colors">
                        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="relative flex items-center">
                            <select
                                className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer appearance-none pr-6 font-medium"
                                value={category}
                                onChange={(e) => setTheCategory(e.target.value)}
                            >
                                <option className="bg-slate-950 text-slate-200" value="">All Categories</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} className="bg-slate-950 text-slate-200" value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-0 pointer-events-none w-3.5 h-3.5 text-slate-400" />
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className="flex items-center gap-2 bg-slate-900/30 border border-slate-800 rounded-xl px-3 py-2 hover:border-slate-700 transition-colors">
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="relative flex items-center">
                            <select
                                className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer appearance-none pr-6 font-medium"
                                value={sorted}
                                onChange={(e) => setIsSorted(Number(e.target.value))}
                            >
                                <option className="bg-slate-950 text-slate-200" value={0}>Sort by: Default</option>
                                <option className="bg-slate-950 text-slate-200" value={1}>Newest First (Desc)</option>
                                <option className="bg-slate-950 text-slate-200" value={-1}>Oldest First (Asc)</option>
                            </select>
                            <ChevronDown className="absolute right-0 pointer-events-none w-3.5 h-3.5 text-slate-400" />
                        </div>
                    </div>

                    {/* Pinned Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsPinned(!pinned)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer ${pinned
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                            : "bg-slate-900/30 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900/50"
                            }`}
                    >
                        <Pin className={`w-4 h-4 ${pinned ? "fill-amber-400/20 text-amber-400" : "text-slate-400"}`} />
                        <span>Pinned</span>
                    </button>
                </div>
            </div>

            {/* Grid display of notes */}
            {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-slate-900/80 bg-slate-950/20 rounded-2xl">
                    <StickyNote className="w-12 h-12 text-slate-600 mb-3 stroke-[1.5]" />
                    <h3 className="text-base font-semibold text-slate-400 mb-1">No notes found</h3>
                    <p className="text-sm text-slate-600 max-w-sm">
                        Try adjusting your filters, category selection, or search criteria to find what you're looking for.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredNotes.map((notesObj) => (
                        <NoteCard
                            key={notesObj._id}
                            title={notesObj.title}
                            content={notesObj.content}
                            pinned={notesObj.isPinned}
                            note_id={notesObj._id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ListOfNotes;
