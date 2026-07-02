import { analyticsService } from "../../api/index.js";
import { useQuery } from "@tanstack/react-query";

export const useGlobalAnalyticsQuery = () => {
    return useQuery({
        queryKey: ["analytics", "global"],
        queryFn: () => analyticsService.getGlobalAnalytics(),
        staleTime: 30 * 1000
    });
};

export const useProjectAnalyticsQuery = (projectId) => {
    return useQuery({
        queryKey: ["analytics", "project", projectId],
        queryFn: () => analyticsService.getProjectAnalytics(projectId),
        staleTime: 30 * 1000,
        enabled: !!projectId
    });
};
