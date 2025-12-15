'use client';

import React, { use, useMemo } from "react";
import { ChatInput } from "@/app/components/chat-input/ChatInput";
import { useUserHook } from "@/hooks/UserHook";
import { Message } from "@/app/components/messages/messages";
import { Id } from "@/convex/_generated/dataModel";
import { useMessageHook } from "@/hooks/MessageHooks";
import { useQuery } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSettingsHook } from "@/hooks/SettingsHook";
import { DEFAULT_MODEL } from "@/lib/mistralConfig";

interface ChatPageProps {
    params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
    const { id: publicId } = use(params);
    const convex = useConvex();
    const { user: userQuery } = useUserHook();
    const userData = userQuery.data;

    // Get user settings for model selection
    const { settings, updateSettings } = useSettingsHook(userData?.id);
    const selectedModel = settings.data?.selectedModel || DEFAULT_MODEL;

    const handleModelChange = async (modelId: string) => {
        await updateSettings({
            selectedModel: modelId,
            customPersonality: settings.data?.customPersonality
        });
    };

    // Resolve public UUID to Convex _id
    const conversationQuery = useQuery({
        queryKey: ["conversation", publicId],
        queryFn: async () => {
            return await convex.query(api.conversations.getConversationByPublicId, {
                publicId
            });
        },
        enabled: !!publicId,
    });

    const convoId = useMemo(() => {
        return conversationQuery.data?._id as Id<"conversations"> | undefined;
    }, [conversationQuery.data]);

    const { addMessage, deleteMessage, sendToAI, streamingMessage, isStreaming, messages } = useMessageHook(convoId, userData?.id);

    const handleSendClick = async (userMessage: string) => {
        if (userData?.id && convoId) {
            await addMessage({
                conversationId: convoId,
                whoSaid: "user",
                message: userMessage,
            });
            await sendToAI(convoId);
        }
    };

    const handleRegenerate = async (messageId: string) => {
        if (userData?.id && convoId) {
            try {
                // Delete the AI message
                await deleteMessage(messageId as Id<"messages">);

                // Re-trigger generation based on conversation history
                await sendToAI(convoId);
            } catch (error) {
                console.error("Failed to regenerate:", error);
            }
        }
    };

    // Show loading state while resolving conversation
    if (conversationQuery.isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-black">
                <div className="text-gray-400">Loading conversation...</div>
            </div>
        );
    }

    // Show error if conversation not found
    if (!conversationQuery.data) {
        return (
            <div className="flex-1 flex items-center justify-center bg-black">
                <div className="text-gray-400">Conversation not found</div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
            <div className="flex-1 w-full mx-auto flex flex-col relative min-h-0">
                {/* Scrollable Message Area */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <Message
                        convoId={convoId}
                        streamingMessage={streamingMessage}
                        isStreaming={isStreaming}
                        onRegenerate={handleRegenerate}
                    />
                </div>

                {/* Input Area - Fixed at bottom */}
                <div className="flex-shrink-0 w-full p-4 pb-6">
                    <ChatInput
                        handleSend={handleSendClick}
                        selectedModel={selectedModel}
                        onModelChange={handleModelChange}
                    />
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-gray-500">M3 Chat can make mistakes. Check important info.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
