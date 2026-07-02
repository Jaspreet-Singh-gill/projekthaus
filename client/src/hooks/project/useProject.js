import { projectService } from "../../api/index.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const useProjectQuery = () => {
    return useQuery({
        queryKey: ["project"],
        queryFn: () => projectService.listAll(),
        staleTime: 60 * 1000
    });
};

const useCreateProjectMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => projectService.createProject(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["project"]
            });
        }
    });
};

const useGetTheProject = (id) => {
    return useQuery({
        queryKey: ["project", id],
        queryFn: () => projectService.getProject(id),
        staleTime: 60 * 1000
    })
}

const useUpdateTheProject = (id) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => projectService.updateProject(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["project", id]
            });
        }
    })
}

const useDeleteProjectMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId) => projectService.deleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["project"]
            });
        }
    })
}

export { useProjectQuery, useCreateProjectMutation, useGetTheProject, useUpdateTheProject, useDeleteProjectMutation };