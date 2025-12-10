import { Id } from "@/convex/_generated/dataModel";
import { useConvex } from "convex/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/convex/_generated/api";
import { CreateMessageSchema, Messages } from "@/lib/schemas/CurrentChatSchema";
import { useCallback, useState } from "react";
import { DEFAULT_MODEL } from "@/lib/mistralConfig";

export interface SendToAIOptions {
    isNewConversation?: boolean;
    firstUserMessage?: string;
    onTitleGenerated?: (title: string) => void;
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
                    throw new Error("Failed to get AI response");
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error("No response body");

                const decoder = new TextDecoder();
                let fullMessage = "";

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
                                    throw new Error(parsed.error);
                                }
                            } catch {
                                // Skip invalid JSON
                            }
                        }
                    }
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
                throw error;
            } finally {
                setIsStreaming(false);
            }
        },
        [addMessage, generateTitle]
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