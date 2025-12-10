import { useMessageHook } from "@/hooks/MessageHooks";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useRef, useCallback, useState } from "react";
import { M3Logo } from "@/app/components/branding/M3Logo";
import { Streamdown } from "streamdown";
import { Copy, RefreshCcw, Check } from "lucide-react";

interface MessageProps {
    convoId: Id<"conversations"> | undefined;
    streamingMessage?: string;
    isStreaming?: boolean;
    onRegenerate?: (message: string) => void;
}

export const Message = ({ convoId, streamingMessage, isStreaming, onRegenerate }: MessageProps) => {
    const { messages, isLoading } = useMessageHook(convoId);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const wasAtBottomRef = useRef(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Check if user is at bottom of scroll
    const isAtBottom = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return true;
        const threshold = 100; // pixels from bottom
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    }, []);

    // Scroll to bottom of the messages container
    const scrollToBottom = useCallback(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, []);

    // Track if user was at bottom before update
    useEffect(() => {
        wasAtBottomRef.current = isAtBottom();
    });

    // Only scroll to bottom if user was already at bottom
    useEffect(() => {
        if (wasAtBottomRef.current) {
            scrollToBottom();
        }
    }, [messages.data, scrollToBottom, streamingMessage]);

    // Always scroll when streaming starts or new message from user
    useEffect(() => {
        if (isStreaming && !streamingMessage) {
            // Just started streaming, scroll to bottom
            scrollToBottom();
        }
    }, [isStreaming, scrollToBottom, streamingMessage]);

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="flex items-center gap-2">
                    <M3Logo size={24} className="animate-pulse opacity-50" />
                    <span>Loading conversation...</span>
                </div>
            </div>
        );
    }

    // Map messages from Convex query
    const allMessages = (messages.data || []).map((m: any, idx: number) => ({
        id: m._id || `msg-${idx}`,
        conversationId: m.conversationId ? String(m.conversationId) : "",
        whoSaid: m.whoSaid as "user" | "agent",
        message: m.message,
    }));

    if (allMessages.length === 0 && !isStreaming) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500">
                No messages yet
            </div>
        );
    }

    return (
        <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pt-10 px-4 space-y-6 min-h-0"
        >
            {allMessages.map((message, index) => {
                const isUser = message.whoSaid === "user";
                return (
                    <div
                        key={`${message.id}-${index}`}
                        className={`flex w-full group ${isUser ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`flex flex-col max-w-[85%] md:max-w-[80%] gap-4 min-w-0 ${isUser ? "items-end" : "items-start"}`}>
                            <div className={`flex gap-4 min-w-0 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                                {/* Avatar/Icon - Only for Agent */}
                                {!isUser && (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <M3Logo size={28} className="shadow-lg shadow-cyan-900/20" />
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div className={`
                                    py-3 px-5 rounded-2xl text-[15px] leading-relaxed min-w-0 overflow-hidden
                                    ${isUser
                                        ? "bg-[#0f0f0f] border border-gray-700 text-gray-100 rounded-tr-sm"
                                        : "text-gray-100 pl-0"
                                    }
                                `}>
                                    {isUser ? message.message : (
                                        <div data-streamdown-container className="min-w-0 overflow-hidden">
                                            <Streamdown shikiTheme={['github-dark', 'github-dark']}>
                                                {message.message}
                                            </Streamdown>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons for Agent Messages */}
                            {!isUser && !isStreaming && (
                                <div className="flex items-center gap-2 ml-12 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleCopy(message.message, message.id)}
                                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
                                        title="Copy"
                                    >
                                        {copiedId === message.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </button>
                                    <button
                                        onClick={() => onRegenerate?.(message.id)}
                                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
                                        title="Regenerate response"
                                    >
                                        <RefreshCcw size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Streaming AI Message */}
            {isStreaming && streamingMessage && (
                <div className="flex w-full justify-start">
                    <div className="flex max-w-[85%] md:max-w-[80%] gap-4 flex-row min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <M3Logo size={28} className="shadow-lg shadow-cyan-900/20 animate-pulse" />
                        </div>
                        <div className="py-3 px-5 rounded-2xl text-[15px] leading-relaxed text-gray-100 pl-0 min-w-0 overflow-hidden">
                            <div data-streamdown-container className="min-w-0 overflow-hidden">
                                <Streamdown shikiTheme={['github-dark', 'github-dark']}>
                                    {streamingMessage}
                                </Streamdown>
                            </div>
                            <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
                        </div>
                    </div>
                </div>
            )}

            {/* Typing indicator when streaming starts but no text yet */}
            {isStreaming && !streamingMessage && (
                <div className="flex w-full justify-start">
                    <div className="flex gap-4 flex-row">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <M3Logo size={28} className="shadow-lg shadow-cyan-900/20 animate-pulse" />
                        </div>
                        <div className="py-3 px-5 rounded-2xl text-[15px] leading-relaxed text-gray-400 pl-0">
                            <span className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer at bottom for padding */}
            <div className="h-4" />
        </div>
    );
};