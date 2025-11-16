import {Paperclip} from "lucide-react";
import React, {useRef} from "react";
import {AttachedFile} from "@/app/components/chat-input/Chat.interface";

export function FileInput() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles: AttachedFile[] = Array.from(files).map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
        }));

    };
    return (
        <>
        <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
        />
        <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-cyan-400 hover:bg-transparent gap-2"
        >
            <Paperclip className="h-4 w-4" />
            Attach file
        </button>
        </>
    )
}