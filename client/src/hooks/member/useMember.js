import { projectService } from "../../api/index.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const useGetTheMemberQuerry = (id) => {
    return useQuery({
        queryKey: ["member", id],
        queryFn: () => projectService.getPeoples(id),
        enabled: !!id,
        staleTime: 60 * 1000
    });
}

const useUpdateTheRole = (id) => {
    const querryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => projectService.changeRoles(id, payload),
        onSuccess: () => {
            querryClient.invalidateQueries({
                queryKey: ["member", id],
            });
        }

    });
}

const useAddMember = (id) => {
    const querryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => projectService.addMember(id, payload),
        onSuccess: () => {
            querryClient.invalidateQueries({
                queryKey: ["member", id],
            });
        }
    });
}

const useRemoveMember = (id) => {
    const querryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => projectService.removeMember(id, payload),
        onSuccess: () => {
            querryClient.invalidateQueries({
                queryKey: ["member", id],
            });
        }
    });
}

export { useGetTheMemberQuerry, useUpdateTheRole, useAddMember,useRemoveMember };