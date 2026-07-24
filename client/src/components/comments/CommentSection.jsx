import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetComments, useAddComment, useDeleteComment } from "../../hooks/comment/useComment.js";
import useSocket from "../../hooks/sockets/useSocket.js";
import { toast } from "sonner";
import { Loader } from "../skeleton/loader.jsx";
import useAuthStore from "../../store/authStore.js";

const CommentSection = ({ projectId, taskId, subtaskId = null, isEditable = true }) => {
    const { user } = useAuthStore();
    const currentUserId = user?._id;
    const [content, setContent] = useState("");
    const commentsEndRef = useRef(null);
    const queryClient = useQueryClient();
    
    const { data: commentsResponse, isLoading } = useGetComments(projectId, taskId, subtaskId);
    const addMutation = useAddComment(projectId, taskId, subtaskId);
    const deleteMutation = useDeleteComment(projectId, taskId, subtaskId);
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleNewComment = (newComment) => {
            queryClient.setQueryData(["comments", projectId, taskId, subtaskId], (oldData) => {
                if (!oldData) return oldData;
                
                const currentComments = Array.isArray(oldData.data) ? oldData.data : (Array.isArray(oldData) ? oldData : []);
                
                const isDuplicate = currentComments.some(c => c._id === newComment._id || c.id === newComment.id);
                
                if (isDuplicate) return oldData;
                
                if (Array.isArray(oldData.data)) {
                    return {
                        ...oldData,
                        data: [...oldData.data, newComment]
                    };
                } else if (Array.isArray(oldData)) {
                    return [...oldData, newComment];
                }
                
                return oldData;
            });
        };

        const handleCommentDeleted = (deletedCommentId) => {
            queryClient.setQueryData(["comments", projectId, taskId, subtaskId], (oldData) => {
                if (!oldData) return oldData;
                
                if (Array.isArray(oldData.data)) {
                    return {
                        ...oldData,
                        data: oldData.data.filter(c => (c._id || c.id) !== deletedCommentId)
                    };
                } else if (Array.isArray(oldData)) {
                    return oldData.filter(c => (c._id || c.id) !== deletedCommentId);
                }
                
                return oldData;
            });
        };

        socket.on("new_comment", handleNewComment);
        socket.on("comment_deleted", handleCommentDeleted);

        return () => {
            socket.off("new_comment", handleNewComment);
            socket.off("comment_deleted", handleCommentDeleted);
        };
    }, [socket, queryClient, projectId, taskId, subtaskId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await addMutation.mutateAsync({ content });
            setContent("");
        } catch (error) {
            toast.error(error.message || "Failed to add comment");
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await deleteMutation.mutateAsync(commentId);
            toast.success("Comment deleted");
        } catch (error) {
            toast.error("Failed to delete comment");
        }
    }

    if (isLoading) return <div className="p-4"><Loader /></div>;

    const commentsList = Array.isArray(commentsResponse?.data) ? commentsResponse.data : (Array.isArray(commentsResponse) ? commentsResponse : []);

    const scrollToLatest = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950/20 rounded-lg border border-slate-200 dark:border-slate-900/50 p-4 mt-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Comments</h3>
                {commentsList.length > 0 && (
                    <button 
                        onClick={scrollToLatest}
                        type="button"
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                        Go to Latest &darr;
                    </button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4 px-1 space-y-5 max-h-[400px] scrollbar-thin">
                {commentsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 space-y-2 mt-10">
                        <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <p className="text-sm italic">No comments yet. Start the conversation!</p>
                    </div>
                ) : (
                    commentsList.map((comment, index) => {
                        const isOwner = currentUserId && (
                            comment.author?._id === currentUserId || 
                            comment.author?.id === currentUserId || 
                            comment.author === currentUserId
                        );
                        
                        const authorName = comment.author?.name || comment.author?.email || comment.user?.name || comment.user?.email || "Unknown";
                        const initial = authorName.charAt(0).toUpperCase();
                        const avatarUrl = comment.author?.avatar?.url || comment.user?.avatar?.url || comment.author?.avatar || comment.user?.avatar;

                        return (
                            <div key={comment._id || comment.id || index} className="flex gap-3 w-full group">
                                <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden bg-gradient-to-tr from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
                                    ) : (
                                        initial
                                    )}
                                </div>
                                
                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[13px] text-slate-800 dark:text-slate-200">{authorName}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {comment.createdAt ? new Intl.DateTimeFormat('default', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(comment.createdAt)) : ""}
                                            </span>
                                        </div>
                                        
                                        {(isEditable || isOwner) && (
                                            <button 
                                                onClick={() => handleDelete(comment._id || comment.id)}
                                                type="button"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded"
                                                title="Delete Comment"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50 rounded-b-lg rounded-tr-lg p-3 text-[13px] shadow-sm">
                                        <p className="whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={commentsEndRef} />
            </div>

            <div className="mt-auto pt-4 relative">
                <div className="flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-sm overflow-hidden">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder="Write a comment..."
                        className="w-full max-h-32 min-h-[60px] bg-transparent text-slate-900 dark:text-slate-200 outline-none text-[13px] placeholder-slate-400 resize-none py-3 px-3 scrollbar-thin"
                        rows={2}
                        disabled={addMutation.isPending}
                    />
                    <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400">
                            <kbd className="font-sans px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-sm mr-1">Enter</kbd> to save
                        </span>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={addMutation.isPending || !content.trim()}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-sm"
                        >
                            {addMutation.isPending ? "Posting..." : "Comment"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentSection;
