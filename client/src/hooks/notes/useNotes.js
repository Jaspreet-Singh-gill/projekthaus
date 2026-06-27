import { notesService } from "../../api/index.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const useGetAllNotes = (projectId) => {
    return useQuery({
        queryKey: [projectId, "notes"],
        queryFn: () => notesService.listNotes(projectId),
        staleTime: 60 * 1000
    });
};

const useCreateNote = (projectId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload, files) => notesService.createNote(projectId, payload, files),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, "notes"]);
        }
    });
};

const useGetNote = (projectId, noteId) => {
    return useQuery({
        queryKey: [projectId, noteId, "note"],
        queryFn: () => notesService.getNote(projectId, noteId),
        staleTime: 60 * 1000
    });
};

const useUpdateNote = (projectId, noteId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => notesService.updateNote(projectId, noteId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, noteId, "note"]);
            queryClient.invalidateQueries([projectId, "notes"]);
        }
    });
};

const useDeleteNote = (projectId, noteId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => notesService.deleteNote(projectId, noteId),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, noteId, "note"]);
            queryClient.invalidateQueries([projectId, "notes"]);
        }
    });
};

// File Attachment Hooks
const useAttachNoteFiles = (projectId, noteId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (files) => notesService.attachFiles(projectId, noteId, files),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, noteId, "noteFiles"]);
        }
    });
};

const useGetAllNoteFiles = (projectId, noteId) => {
    return useQuery({
        queryKey: [projectId, noteId, "noteFiles"],
        queryFn: () => notesService.getAllFiles(projectId, noteId),
        staleTime: 60 * 1000
    });
};

const useDeleteNoteFile = (projectId, noteId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (fileId) => notesService.deleteFile(projectId, noteId, fileId),
        onSuccess: () => {
            queryClient.invalidateQueries([projectId, noteId, "noteFiles"]);
        }
    });
};

export {
    useGetAllNotes,
    useCreateNote,
    useGetNote,
    useUpdateNote,
    useDeleteNote,
    useAttachNoteFiles,
    useGetAllNoteFiles,
    useDeleteNoteFile
};
