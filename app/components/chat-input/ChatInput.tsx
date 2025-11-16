import { Send } from "lucide-react";
import React, { useState} from "react";
import FileList from "@/app/components/file-list/FileList";
import {FileInput} from "@/app/components/file-input/FileInput";
import {useQuery} from "@tanstack/react-query";

export default function ChatInput() {
    const [input, setInput] = useState('');
    const { isPending, isError, data, error } = useQuery({
        queryKey: ['attachedFiles'],
        queryFn: fetchAttachedFiles,
    })

    const handleSend = () => {
        // if (!input.trim() && attachedFiles.length === 0) return;
        // setInput('');
        // setAttachedFiles([]);
    };
    return (
        <>
        <FileList />
        <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl border border-gray-700 p-4 space-y-3 hover:border-gray-600 transition-colors">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Ask me anything......."
                className="w-full bg-transparent text-gray-300 placeholder:text-gray-600 outline-none resize-none min-h-[60px] max-h-[200px]"
                rows={2}
            />

            <div className="flex items-center justify-between">
                <FileInput />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() && attachedFiles.length === 0}
                    className="h-10 w-10 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl transition-all"
                >
                    <Send className="h-5 w-5" />
                </button>
            </div>
        </div>
        </>
    )
}