import {Paperclip, X} from "lucide-react";
import React from "react";
import useFileInputHook from "@/hooks/FileInputHooks";

export default function FileList() {
    const attachedFiles = useFileInputHook().files
    const removeHook = useFileInputHook().removeFiles;
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="relative z-10 w-full max-w-4xl px-8">
            <div className="space-y-3">
                {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {attachedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm"
                            >
                                <Paperclip className="h-4 w-4 text-cyan-400" />
                                <span className="text-gray-300 max-w-[200px] truncate">{file.name}</span>
                                <span className="text-gray-500 text-xs">({formatFileSize(file.size)})</span>
                                <button
                                    onClick={() => removeHook(file.id)}
                                    className="ml-1 text-gray-500 hover:text-gray-300"
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