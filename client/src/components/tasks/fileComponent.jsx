import React, { useRef, useState } from "react";
import {
    Loader2,
    Paperclip,
    Trash2,
    UploadCloud,
    FileText,
    Image as ImageIcon,
    File as GenericFileIcon,
    Download
} from "lucide-react";
import { toast } from "sonner";

const FileComponent = ({ getAllFiles, deleteFile, attachFile, isEditable }) => {
    const fileInputRef = useRef(null);
    const [downloadingFileId, setDownloadingFileId] = useState(null);


    const files = getAllFiles?.data?.data || [];

    const handleFileChange = async (e) => {
        const filesSelected = Array.from(e.target.files);
        if (filesSelected.length === 0) return;
        await uploadFiles(filesSelected);
    };

    const uploadFiles = async (filesToUpload) => {
        try {
            await attachFile.mutateAsync(filesToUpload);
            toast.success("Files attached successfully");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            toast.error(error.message || "Failed to attach files");
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        try {
            await deleteFile.mutateAsync(fileId);
            toast.success("File deleted successfully");
        } catch (error) {
            toast.error(error.message || "Failed to delete file");
        }
    };

    const handleDownload = async (fileId, fileUrl, fileName) => {
        setDownloadingFileId(fileId);
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
            toast.error("Failed to download file");
        } finally {
            setDownloadingFileId(null);
        }
    };

    // Determine the icon or preview to display based on file type/kind
    const renderFilePreview = (file) => {
        const kind = file.fileKind?.toLowerCase() || "";
        const isImage = kind.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg"].some(ext => kind.includes(ext) || file.url?.toLowerCase().endsWith(ext));
        const isPdf = kind.includes("pdf") || file.url?.toLowerCase().endsWith(".pdf");

        if (isImage) {
            return (
                <div className="relative w-10 h-10 rounded border border-slate-200 dark:border-slate-800/80 overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                    <img
                        src={file.url}
                        alt={file.fileName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = ""; // Clear src if loading fails
                            e.target.className = "hidden";
                        }}
                    />
                    <ImageIcon className="absolute text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none opacity-40" />
                </div>
            );
        }

        if (isPdf) {
            return (
                <div className="w-10 h-10 rounded border border-rose-200 dark:border-rose-950/40 bg-rose-50 dark:bg-rose-950/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                </div>
            );
        }

        return (
            <div className="w-10 h-10 rounded border border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                <GenericFileIcon className="w-5 h-5" />
            </div>
        );
    };

    return (
        <div className="space-y-4 w-full">
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-900">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    Task Files
                    {files?.length > 0 && (
                        <span className="ml-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-full font-medium">
                            {files.length}
                        </span>
                    )}
                </h3>

                {isEditable && (
                    <div className="flex items-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={attachFile?.isPending}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={attachFile?.isPending}
                            className={`${!isEditable ? "hidden" : ""} flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-650/10 hover:bg-indigo-100 dark:hover:bg-indigo-650/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-800 rounded-md transition duration-150 cursor-pointer disabled:opacity-55`}
                        >
                            {attachFile?.isPending ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>Add File</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* List States */}
            {getAllFiles?.isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    <span className="ml-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">Loading files...</span>
                </div>
            ) : getAllFiles?.isError ? (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <span>Error loading files: {getAllFiles.error?.message || "Failed to load files"}</span>
                </div>
            ) : files.length === 0 ? (
                <div className="text-center py-8 border border-slate-200 dark:border-slate-900/50 bg-slate-50 dark:bg-slate-950/10 rounded-lg">
                    <Paperclip className="w-6 h-6 text-slate-400 dark:text-slate-650 mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">No files attached to this task</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">Attach reference documents, mockups, or project requirements</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2 overflow-y-auto">
                    {files.map((file) => {
                        const fileId = file._id || file.id;
                        const isDeleting = deleteFile?.isPending && deleteFile?.variables === fileId;

                        return (
                            <div
                                key={fileId}
                                className="group flex items-center justify-between p-2.5 rounded-md border border-slate-200 dark:border-slate-900/80 bg-white dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-150"
                            >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    {renderFilePreview(file)}
                                    <div className="min-w-0 flex flex-col">
                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors" title={file.fileName}>
                                            {file.fileName}
                                        </span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                                            {file.fileKind?.split("/")?.[1] || file.fileKind || "file"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    {/* Download Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(fileId, file.url, file.fileName)}
                                        disabled={downloadingFileId === fileId}
                                        className="p-1.5 text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded transition-colors disabled:opacity-40 cursor-pointer"
                                        title="Download File"
                                    >
                                        {downloadingFileId === fileId ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500 dark:text-indigo-400" />
                                        ) : (
                                            <Download className="w-3.5 h-3.5" />
                                        )}
                                    </button>

                                    {/* Delete Button (Only shown if isEditable is true) */}
                                    {isEditable && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(fileId)}
                                            disabled={isDeleting || deleteFile?.isPending}
                                            className={`${!isEditable ? "hidden" : ""} p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/25 rounded transition-colors disabled:opacity-40 cursor-pointer`}
                                            title="Delete File"
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500 dark:text-rose-400" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FileComponent;