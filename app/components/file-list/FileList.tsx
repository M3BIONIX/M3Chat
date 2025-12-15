import { X, Loader2, CheckCircle, XCircle } from "lucide-react";
import React from "react";
import useFileInputHook from "@/hooks/FileInputHooks";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { FileIcon } from "./FileIcon";

// Status indicator component for individual files
function FileStatusIndicator({ fileId }: { fileId: Id<"attachedFiles"> }) {
    const statusData = useQuery(api.fileEmbeddings.getFileStatus, { fileId });
    const status = statusData?.status;

    if (!status || status === "pending") {
        return null; // Or a pending indicator
    }

    if (status === "queued" || status === "embedding") {
        return (
            <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="absolute -top-1 -right-1 z-10">
                <XCircle className="h-4 w-4 text-red-500 bg-white rounded-full" />
            </div>
        );
    }

    // Success state implicitly shown by absence of loader/error
    return null;
}

export default function FileList() {
    const attachedFiles = useFileInputHook().files
    const removeHook = useFileInputHook().removeFiles;
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="relative z-10 w-full">
            <div className="space-y-3">
                {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        {attachedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="group relative flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3 pr-8 shadow-sm border border-gray-800 min-w-[200px] max-w-[250px]"
                            >
                                <div className="relative flex-shrink-0">
                                    <FileIcon type={file.type} className="w-10 h-10" />
                                    <FileStatusIndicator fileId={file._id as Id<"attachedFiles">} />
                                </div>

                                <div className="flex flex-col min-w-0">
                                    <span className="text-gray-200 font-medium text-sm truncate w-full" title={file.name}>
                                        {file.name}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                        {formatFileSize(file.size)}
                                    </span>
                                </div>

                                <button
                                    onClick={() => removeHook(file.id)}
                                    className="absolute top-1 right-1 p-1 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}