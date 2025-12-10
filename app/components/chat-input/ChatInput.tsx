import { Send } from "lucide-react";
import React, { useState } from "react";
import FileList from "@/app/components/file-list/FileList";
import { FileInput } from "@/app/components/file-input/FileInput";
import useFileInputHook from "@/hooks/FileInputHooks";

interface ChatInputProps {
    handleSend?: (message: string) => void;
}

export const ChatInput = ({ handleSend }: ChatInputProps) => {
    const [input, setInput] = useState('');
    const attachedFiles = useFileInputHook().files

    return (
        <>
            <FileList />
            <div className="bg-[#0f0f0f] backdrop-blur-sm rounded-2xl border border-gray-700 p-4 hover:border-gray-600 transition-colors">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={async (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (input.trim() || attachedFiles.length > 0) {
                                handleSend?.(input);
                                setInput('');
                            }
                        }
                    }}
                    placeholder="Ask me anything ......."
                    className="w-full bg-transparent text-gray-300 placeholder:text-gray-600 outline-none resize-none max-h-[200px]"
                    rows={2}
                />

                <div className="flex items-center justify-between">
                    <FileInput />
                    <button
                        onClick={() => {
                            handleSend?.(input);
                        }}
                        disabled={!input.trim() && attachedFiles.length === 0}
                        className="h-10 w-10 flex justify-center items-center bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl transition-all"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </>
    )
}