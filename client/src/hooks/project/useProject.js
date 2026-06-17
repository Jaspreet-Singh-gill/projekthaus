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

export { useProjectQuery, useCreateProjectMutation };