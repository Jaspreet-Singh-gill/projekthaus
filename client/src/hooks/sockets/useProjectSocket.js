import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useSocket from "./useSocket.js";

const useProjectSocket = (projectId) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !projectId) return;

    // Join the project room to receive real-time updates for this specific project
    socket.emit("join_project_room", projectId);

    const invalidateAnalytics = () => {
      queryClient.invalidateQueries({ queryKey: ["analytics", "project", projectId] });
    };

    // Tasks
    const handleTaskCreated = (task) => {
      queryClient.setQueryData([projectId, "tasks"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: [...oldData.data, task] };
      });
      invalidateAnalytics();
    };

    const handleTaskUpdated = (task) => {
      queryClient.setQueryData([projectId, "tasks"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: oldData.data.map((t) => (t._id === task._id ? task : t)) };
      });
      queryClient.setQueryData([projectId, task._id, "task"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: task };
      });
      invalidateAnalytics();
    };

    const handleTaskDeleted = ({ taskId }) => {
      queryClient.setQueryData([projectId, "tasks"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: oldData.data.filter((t) => t._id !== taskId) };
      });
      queryClient.removeQueries({ queryKey: [projectId, taskId, "task"] });
      invalidateAnalytics();
    };

    // Subtasks
    const handleSubtaskCreated = (subtask) => {
      queryClient.setQueryData([projectId, subtask.taskId, "subtasks"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: [...oldData.data, subtask] };
      });
      invalidateAnalytics();
    };

    const handleSubtaskUpdated = (subtask) => {
      queryClient.setQueryData([projectId, subtask.taskId, "subtasks"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: oldData.data.map((st) => (st._id === subtask._id ? subtask : st)) };
      });
      queryClient.setQueryData([projectId, subtask.taskId, subtask._id, "subtask"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: subtask };
      });
      invalidateAnalytics();
    };

    const handleSubtaskDeleted = ({ subTaskId, taskId }) => {
      queryClient.setQueryData([projectId, taskId, "subtasks"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: oldData.data.filter((st) => st._id !== subTaskId) };
      });
      queryClient.removeQueries({ queryKey: [projectId, taskId, subTaskId, "subtask"] });
      invalidateAnalytics();
    };

    // Notes
    const handleNoteCreated = (note) => {
      queryClient.setQueryData([projectId, "notes"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: [...oldData.data, note] };
      });
    };

    const handleNoteUpdated = (note) => {
      queryClient.setQueryData([projectId, "notes"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: oldData.data.map((n) => (n._id === note._id ? note : n)) };
      });
      queryClient.setQueryData([projectId, note._id, "note"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: note };
      });
    };

    const handleNoteDeleted = ({ noteId }) => {
      queryClient.setQueryData([projectId, "notes"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: oldData.data.filter((n) => n._id !== noteId) };
      });
      queryClient.removeQueries({ queryKey: [projectId, noteId, "note"] });
    };

    socket.on("task_created", handleTaskCreated);
    socket.on("task_updated", handleTaskUpdated);
    socket.on("task_deleted", handleTaskDeleted);

    socket.on("subtask_created", handleSubtaskCreated);
    socket.on("subtask_updated", handleSubtaskUpdated);
    socket.on("subtask_deleted", handleSubtaskDeleted);

    socket.on("note_created", handleNoteCreated);
    socket.on("note_updated", handleNoteUpdated);
    socket.on("note_deleted", handleNoteDeleted);

    return () => {
      // Leave the project room when the component unmounts
      socket.emit("leave_project_room", projectId);
      
      socket.off("task_created", handleTaskCreated);
      socket.off("task_updated", handleTaskUpdated);
      socket.off("task_deleted", handleTaskDeleted);

      socket.off("subtask_created", handleSubtaskCreated);
      socket.off("subtask_updated", handleSubtaskUpdated);
      socket.off("subtask_deleted", handleSubtaskDeleted);

      socket.off("note_created", handleNoteCreated);
      socket.off("note_updated", handleNoteUpdated);
      socket.off("note_deleted", handleNoteDeleted);
    };
  }, [socket, projectId, queryClient]);
};

export default useProjectSocket;
