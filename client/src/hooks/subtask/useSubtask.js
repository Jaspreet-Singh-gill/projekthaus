import { subtaskService } from "../../api/index.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const useGetAllSubtasks = (projectId, taskId) => {
    return useQuery({
        queryKey: [projectId, taskId, "subtasks"],
        queryFn: () => subtaskService.getAllSubtasks(projectId, taskId),
        staleTime: 60 * 1000
    });
};

const useCreateSubtask = (projectId, taskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => subtaskService.createSubtask(projectId, taskId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, taskId, "subtasks"]);
        }
    });
};

const useGetSubtask = (projectId, taskId, subTaskId) => {
    return useQuery({
        queryKey: [projectId, taskId, subTaskId, "subtask"],
        queryFn: () => subtaskService.getSubtask(projectId, taskId, subTaskId),
        staleTime: 60 * 1000
    });
};

const useUpdateSubtask = (projectId, taskId, subTaskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => subtaskService.updateSubtask(projectId, taskId, subTaskId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, taskId, subTaskId, "subtask"]);
            queryClient.invalidateQueries([projectId, taskId, "subtasks"]);
        }
    });
};

const useDeleteSubtask = (projectId, taskId, subTaskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => subtaskService.deleteSubtask(projectId, taskId, subTaskId),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, taskId, subTaskId, "subtask"]);
            queryClient.invalidateQueries([projectId, taskId, "subtasks"]);
        }
    });
};

const assignSubtaskMember = (projectId, taskId, subTaskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => subtaskService.assignSubtask(projectId, taskId, subTaskId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, taskId, subTaskId, "subtask"]);
        }
    });
};

const deleteSubtaskMember = (projectId, taskId, subTaskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => subtaskService.deleteAssignedMember(projectId, taskId, subTaskId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, taskId, subTaskId, "subtask"]);
        }
    });
};

const useAssignedMemberSubtaskUpdation = (projectId, taskId, subTaskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => subtaskService.updateAssignedSubtask(projectId, taskId, subTaskId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, taskId, subTaskId, "subtask"]);
        }
    });
};

// File Attachment Hooks
const useAttachSubtaskFiles = (projectId, taskId, subTaskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (files) => subtaskService.attachFiles(projectId, taskId, subTaskId, files),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, taskId, subTaskId, "subtaskFiles"]);
        }
    });
};

const useGetAllSubtaskFiles = (projectId, taskId, subTaskId) => {
    return useQuery({
        queryKey: [projectId, taskId, subTaskId, "subtaskFiles"],
        queryFn: () => subtaskService.getAllFiles(projectId, taskId, subTaskId),
        staleTime: 60 * 1000
    });
};

const useDeleteSubtaskFile = (projectId, taskId, subTaskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (fileId) => subtaskService.deleteFile(projectId, taskId, subTaskId, fileId),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, taskId, subTaskId, "subtaskFiles"]);
        }
    });
};

export {
    useGetAllSubtasks,
    useCreateSubtask,
    useGetSubtask,
    useUpdateSubtask,
    useDeleteSubtask,
    assignSubtaskMember,
    deleteSubtaskMember,
    useAssignedMemberSubtaskUpdation,
    useAttachSubtaskFiles,
    useGetAllSubtaskFiles,
    useDeleteSubtaskFile
};
