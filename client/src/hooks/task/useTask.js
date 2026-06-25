import { taskService } from "../../api/index.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


const useGetAllTheTasks = (id) => {
    return useQuery({
        queryKey: [id, "tasks"],
        queryFn: () => taskService.getAllTasks(id),
        staleTime: 60 * 1000
    })
};

const useCreateTask = (id) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (taskData) => taskService.createTask(id, taskData),
        onSuccess: () => {
            queryClient.invalidateQueries([id, "tasks"])
        }
    });
};


const useGetTheTask = (projectId, taskId) => {
    return useQuery({
        queryKey: [projectId, taskId, "task"],
        queryFn: () => taskService.getTask(projectId, taskId),
        staleTime: 60 * 1000
    });
}

const useUpdateTask = (projectId, taskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (taskData) => taskService.updateTask(projectId, taskId, taskData),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, taskId, 'task'])
        }
    })
}

const useDeleteTask = (projectId, taskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => taskService.deleteTask(projectId, taskId),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, taskId, 'task'])
        }
    })
}

const useAssignedMemberTaskUpdation = (projectId, taskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => taskService.updateAssignedTask(projectId, taskId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, taskId, 'task'])
        }
    })
}



const assignMember = (projectId, taskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => taskService.assignTask(projectId, taskId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, taskId, 'task'])
        }
    })
}

const deleteMember = (projectId, taskId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => taskService.deleteAssignedMember(projectId, taskId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, taskId, 'task'])
        }
    })
}

export {
    useGetAllTheTasks,
    useCreateTask,
    useGetTheTask,
    useUpdateTask,
    useDeleteTask,
    assignMember,
    deleteMember,
    useAssignedMemberTaskUpdation
};