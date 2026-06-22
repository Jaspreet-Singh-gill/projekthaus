import { taskService } from "../../api/index.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


const useGetAllTheTasks = (id) => {
    return useQuery({
        queryKey: [id, "tasks"],
        queryFn: () => taskService.getAllTasks(id),
        staleTime: 60 * 1000
    })
};

export { useGetAllTheTasks };