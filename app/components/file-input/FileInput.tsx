import {Paperclip} from "lucide-react";
import React, {useRef} from "react";
import useFileInputHook from "@/hooks/FileInputHooks";
import {useQuery} from "@tanstack/react-query";

export function FileInput() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addFiles } = useFileInputHook();
    const {data: currentConversationId} = useQuery('currentConversation')
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
       
        try {
            await addFiles(files[0], "");
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }

        } catch (error) {
            console.error("Error adding files:", error);
        }

    };
    return (
        <>
        <input
            ref={fileInputRef}
            type="file"
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