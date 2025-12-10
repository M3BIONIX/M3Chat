import { Send } from "lucide-react";
import React, { useState } from "react";
import FileList from "@/app/components/file-list/FileList";
import { FileInput } from "@/app/components/file-input/FileInput";
import useFileInputHook from "@/hooks/FileInputHooks";
import { ModelSelector } from "@/app/components/settings/ModelSelector";

interface ChatInputProps {
    handleSend?: (message: string, attachedFileIds?: string[]) => void;
    selectedModel?: string;
    onModelChange?: (modelId: string) => void;
}

export const ChatInput = ({ handleSend, selectedModel, onModelChange }: ChatInputProps) => {
    const [input, setInput] = useState('');
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const { files: attachedFiles, clearFiles } = useFileInputHook();

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    };

    React.useEffect(() => {
        adjustHeight();
    }, [input]);

    return (
        <>
            <FileList />
            <div className="bg-[#0f0f0f] backdrop-blur-sm rounded-2xl border border-gray-700 p-4 hover:border-gray-600 transition-colors">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={async (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (input.trim() || attachedFiles.length > 0) {
                                const fileIds = attachedFiles.map(f => f.id);
                                handleSend?.(input, fileIds);
                                setInput('');
                                clearFiles();
                            }
                        }
                    }}
                    placeholder="Ask me anything ......."
                    className="w-full bg-transparent text-gray-300 placeholder:text-gray-600 outline-none resize-none max-h-[200px] overflow-y-auto"
                    rows={1}
                />

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <FileInput />
                        {selectedModel && onModelChange && (
                            <ModelSelector
                                selectedModel={selectedModel}
                                onModelChange={onModelChange}
                            />
                        )}
                    </div>
                    <button
                        onClick={() => {
                            if (input.trim() || attachedFiles.length > 0) {
                                const fileIds = attachedFiles.map(f => f.id);
                                handleSend?.(input, fileIds);
                                setInput('');
                                clearFiles();
                            }
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