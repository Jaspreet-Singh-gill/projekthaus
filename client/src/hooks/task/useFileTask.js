import { taskService } from "../../api/index.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const useAttachFiles = (projectId, taskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (files) => taskService.attachFiles(projectId, taskId, files),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [projectId, taskId, "files"]
            });
        }
    });
};

const useGetAllFiles = (projectId, taskId) => {
    return useQuery({
        queryKey: [projectId, taskId, "files"],
        queryFn: () => taskService.getAllFiles(projectId, taskId),
        staleTime: 60 * 1000
    });
};

const useDeleteFile = (projectId, taskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (fileId) => taskService.deleteFile(projectId, taskId, fileId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [projectId, taskId, "files"]
            });
        }
    });
};

export {
    useAttachFiles,
    useGetAllFiles,
    useDeleteFile
};