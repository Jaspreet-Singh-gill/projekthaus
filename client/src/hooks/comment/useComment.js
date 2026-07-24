import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "../../api/index.js";

export const useGetComments = (projectId, taskId, subtaskId = null) => {
  return useQuery({
    queryKey: ["comments", projectId, taskId, subtaskId],
    queryFn: () => commentService.getComments(projectId, taskId, subtaskId),
    enabled: !!projectId && !!taskId,
  });
};

export const useAddComment = (projectId, taskId, subtaskId = null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      commentService.addComment(projectId, taskId, subtaskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", projectId, taskId, subtaskId],
      });
    },
  });
};

export const useDeleteComment = (projectId, taskId, subtaskId = null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => commentService.deleteComment(projectId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", projectId, taskId, subtaskId],
      });
    },
  });
};
