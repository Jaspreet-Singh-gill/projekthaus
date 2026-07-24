import React, { useState, useEffect } from "react";
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

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950/20 rounded-lg border border-slate-200 dark:border-slate-900/50 p-4 mt-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Comments</h3>
            
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[400px]">
                {commentsList.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">No comments yet. Be the first to comment!</p>
                ) : (
                    commentsList.map((comment, index) => {
                        const isOwner = currentUserId && (
                            comment.author?._id === currentUserId || 
                            comment.author?.id === currentUserId || 
                            comment.author === currentUserId
                        );

                        return (
                            <div key={comment._id || comment.id || index} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                                            {comment.author?.name || comment.author?.email || comment.user?.name || comment.user?.email || "Unknown User"}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                                </div>
                                {(isEditable || isOwner) && (
                                    <button 
                                        onClick={() => handleDelete(comment._id || comment.id)}
                                        type="button"
                                        className="text-rose-500 hover:text-rose-700 text-xs font-semibold px-2 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 focus:border-indigo-500 rounded text-slate-900 dark:text-slate-200 outline-none text-sm placeholder-slate-400 resize-none transition-colors mb-2"
                    rows={3}
                    disabled={addMutation.isPending}
                />
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={addMutation.isPending || !content.trim()}
                        className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition disabled:opacity-50"
                    >
                        {addMutation.isPending ? "Posting..." : "Post Comment"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentSection;
