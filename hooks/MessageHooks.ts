import { Id } from "@/convex/_generated/dataModel";
import { useConvex } from "convex/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/convex/_generated/api";
import { CreateMessageSchema, Messages } from "@/lib/schemas/CurrentChatSchema";
import { useCallback, useState } from "react";
import { DEFAULT_MODEL } from "@/lib/mistralConfig";
import { toast } from "sonner";

export interface SendToAIOptions {
    isNewConversation?: boolean;
    firstUserMessage?: string;
    onTitleGenerated?: (title: string) => void;
}

/**
 * Parse error message and return user-friendly text
 */
function parseApiError(error: unknown): { message: string; isTokenLimit: boolean; isRateLimit: boolean } {
    const errorStr = error instanceof Error ? error.message : String(error);

    // Check for token limit errors
    if (errorStr.toLowerCase().includes('token') ||
        errorStr.toLowerCase().includes('context length') ||
        errorStr.toLowerCase().includes('too long') ||
        errorStr.toLowerCase().includes('maximum context')) {
        return {
            message: "This conversation is too long. Please start a new chat or delete some messages.",
            isTokenLimit: true,
            isRateLimit: false,
        };
    }

    // Check for rate limit errors
    if (errorStr.toLowerCase().includes('rate limit') ||
        errorStr.toLowerCase().includes('too many requests') ||
        errorStr.includes('429')) {
        return {
            message: "Too many requests. Please wait a moment and try again.",
            isTokenLimit: false,
            isRateLimit: true,
        };
    }

    // Check for API key errors
    if (errorStr.toLowerCase().includes('api key') ||
        errorStr.toLowerCase().includes('unauthorized') ||
        errorStr.includes('401')) {
        return {
            message: "API authentication error. Please contact support.",
            isTokenLimit: false,
            isRateLimit: false,
        };
    }

    // Generic error
    return {
        message: errorStr || "Failed to get AI response. Please try again.",
        isTokenLimit: false,
        isRateLimit: false,
    };
}

export const useMessageHook = (convoId?: Id<"conversations">, userId?: string) => {
    const messageHookKey = ["messages", convoId];
    const queryClient = useQueryClient();
    const convex = useConvex();
    const [streamingMessage, setStreamingMessage] = useState<string>("");
    const [isStreaming, setIsStreaming] = useState<boolean>(false);

    const messages = useQuery({
        queryKey: messageHookKey,
        queryFn: async () => {
            if (!convoId) return [] as Messages[];
            return await convex.query(api.messages.getAllMessagesByConversationId, {
                convoId: convoId,
            });
        },
        enabled: !!convoId,
        initialData: [] as Messages[],
    });

    const addMessageMutation = useMutation({
        mutationFn: async (req: CreateMessageSchema) => {
            return await convex.mutation(api.messages.createMessage, {
                conversationId: req.conversationId as Id<"conversations">,
                whoSaid: req.whoSaid,
                message: req.message,
                model: req.model,
                attachedFileIds: req.attachedFileIds as any,
                userId: userId,
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: messageHookKey });
        },
    });

    const addMessage = useCallback(
        async (req: CreateMessageSchema) => {
            return await addMessageMutation.mutateAsync(req);
        },
        [addMessageMutation]
    );

    const deleteMessageMutation = useMutation({
        mutationFn: async (messageId: Id<"messages">) => {
            return await convex.mutation(api.messages.deleteMessage, { messageId });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: messageHookKey });
        },
    });

    const deleteMessage = useCallback(
        async (messageId: Id<"messages">) => {
            return await deleteMessageMutation.mutateAsync(messageId);
        },
        [deleteMessageMutation]
    );

    // Generate title via separate endpoint
    const generateTitle = useCallback(
        async (message: string, onTitleGenerated?: (title: string) => void) => {
            try {
                const response = await fetch(`/api/titleGen?message=${encodeURIComponent(message)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.title && onTitleGenerated) {
                        onTitleGenerated(data.title);
                    }
                }
            } catch (error) {
                console.error("Title generation error:", error);
            }
        },
        []
    );

    const sendToAI = useCallback(
        async (conversationId: Id<"conversations">, options?: SendToAIOptions) => {
            setIsStreaming(true);
            setStreamingMessage("");

            // Start title generation in parallel (fire and forget)
            if (options?.isNewConversation && options?.firstUserMessage && options?.onTitleGenerated) {
                generateTitle(options.firstUserMessage, options.onTitleGenerated);
            }

            try {
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ convoId: conversationId, userId }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error || `HTTP ${response.status}: Failed to get AI response`;
                    throw new Error(errorMessage);
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error("No response body");

                const decoder = new TextDecoder();
                let fullMessage = "";
                let streamError: string | null = null;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            if (data === "[DONE]") continue;

                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.text) {
                                    fullMessage += parsed.text;
                                    setStreamingMessage(fullMessage);
                                }
                                if (parsed.error) {
                                    streamError = parsed.error;
                                }
                            } catch {
                                // Skip invalid JSON
                            }
                        }
                    }
                }

                // Check if there was an error during streaming
                if (streamError) {
                    throw new Error(streamError);
                }

                // Save the complete AI response to Convex
                if (fullMessage) {
                    await addMessage({
                        conversationId: conversationId,
                        whoSaid: "agent",
                        message: fullMessage,
                        model: DEFAULT_MODEL,
                    });
                }

                setStreamingMessage("");
            } catch (error) {
                console.error("AI streaming error:", error);

                // Parse the error and show appropriate toast
                const { message, isTokenLimit, isRateLimit } = parseApiError(error);

                if (isTokenLimit) {
                    toast.error(message, {
                        duration: 8000,
                        description: "Try starting a new conversation or removing old messages.",
                    });
                } else if (isRateLimit) {
                    toast.error(message, {
                        duration: 5000,
                        description: "The AI is processing too many requests right now.",
                    });
                } else {
                    toast.error(message, {
                        duration: 5000,
                    });
                }

                // Clear streaming state on error
                setStreamingMessage("");
            } finally {
                setIsStreaming(false);
            }
        },
        [addMessage, generateTitle, userId]
    );

    return {
        addMessage,
        deleteMessage,
        sendToAI,
        generateTitle,
        messages,
        streamingMessage,
        isStreaming,
        isLoading: messages.isLoading,
    };
};