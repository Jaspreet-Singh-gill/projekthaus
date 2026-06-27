import { Pin, ExternalLink } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const NoteCard = ({ title, content, pinned, note_id }) => {
    const navigate = useNavigate();
    const { projectId } = useParams();

    return (
        <div className="group relative flex flex-col justify-between h-full p-5 rounded-2xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/40 hover:border-slate-700 transition-all duration-200 shadow-md">
            <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                    <h3
                        className="text-base font-semibold text-slate-200 truncate pr-2"
                        title={title}
                    >
                        {title || "Untitled Note"}
                    </h3>
                    {pinned && (
                        <Pin className="w-4 h-4 text-amber-400 fill-amber-400/20 shrink-0" />
                    )}
                </div>
                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                    {content || "No content provided."}
                </p>
            </div>

            <div className="flex items-center justify-end pt-4 mt-4 border-t border-slate-900/60">
                <button 
                    onClick={() => navigate(`/project/${projectId}/${note_id}/note`)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-500/20 hover:border-indigo-500 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                >
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};

export default NoteCard;
