'use client';

import React, { use, useMemo, useEffect, useState } from "react";
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
import useFileInputHook from "@/hooks/FileInputHooks";
import { waitForEmbeddings } from "@/lib/utils/embeddingUtils";

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

    // Get attached files from hook
    const { files: attachedFiles, clearFiles } = useFileInputHook();

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

    // Track if we've processed the pending message
    const [pendingProcessed, setPendingProcessed] = useState(false);

    // Check for pending message from welcome screen (after redirect)
    useEffect(() => {
        const processPendingMessage = async () => {
            if (pendingProcessed || !convoId || !userData?.id) return;

            const pendingMessage = sessionStorage.getItem('pending_chat_message');
            if (!pendingMessage) return;

            // Clear immediately to prevent re-processing
            sessionStorage.removeItem('pending_chat_message');
            sessionStorage.removeItem('pending_chat_convo_id');
            setPendingProcessed(true);

            // Send the pending message
            try {
                await addMessage({
                    conversationId: convoId,
                    whoSaid: "user",
                    message: pendingMessage,
                });

                await sendToAI(convoId);
            } catch (error) {
                console.error("Failed to process pending message:", error);
            }
        };

        processPendingMessage();
    }, [convoId, userData?.id, addMessage, sendToAI, pendingProcessed]);

    const handleSendClick = async (userMessage: string, attachedFileIds?: string[]) => {
        if (userData?.id && convoId) {
            // Use the file IDs passed from ChatInput (which are the _id strings)
            const fileIdsToSend = attachedFileIds && attachedFileIds.length > 0
                ? attachedFileIds
                : undefined;

            await addMessage({
                conversationId: convoId,
                whoSaid: "user",
                message: userMessage,
                attachedFileIds: fileIdsToSend,
            });

            // Clear attached files after sending
            clearFiles();

            // Wait for embeddings to complete before calling AI
            if (fileIdsToSend && fileIdsToSend.length > 0) {
                await waitForEmbeddings(convex, fileIdsToSend);
            }

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
