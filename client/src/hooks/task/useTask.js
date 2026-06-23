import { taskService } from "../../api/index.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


const useGetAllTheTasks = (id) => {
    return useQuery({
        queryKey: [id, "tasks"],
        queryFn: () => taskService.getAllTasks(id),
        staleTime: 60 * 1000
    })
};

const useCreateTask = (id)=>{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (taskData) => taskService.createTask(id, taskData),
        onSuccess: () => {
            queryClient.invalidateQueries([id, "tasks"])
        }
    });
}; 

export { useGetAllTheTasks,useCreateTask };