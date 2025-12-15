'use client';

import React, { useState, useCallback } from "react";
import { ChatInput } from "@/app/components/chat-input/ChatInput";
import { useUserHook } from "@/hooks/UserHook";
import useCurrentChatHook from "@/hooks/CurrentChatHooks";
import { Message } from "@/app/components/messages/messages";
import { UserSchema } from "@/lib/schemas/AuthSchema";
import { Id } from "@/convex/_generated/dataModel";
import { useMessageHook } from "@/hooks/MessageHooks";
import { M3Logo } from "@/app/components/branding/M3Logo";
import { api } from "@/convex/_generated/api";
import { useSettingsHook } from "@/hooks/SettingsHook";
import useFileInputHook from "@/hooks/FileInputHooks";
import { useConversationsHook } from "@/hooks/ConversationsHook";
import { useConvex } from "convex/react";
import { useQueryClient } from "@tanstack/react-query";
import { processSuggestionAction, processSendAction } from "@/lib/utils/chatHelpers";

const suggestions = [
    {
        title: 'Content Help',
        description: 'Help me create a Presentation',
    },
    {
        title: 'Suggestions',
        description: 'Help me with ideas',
    },
    {
        title: 'Job Application',
        description: 'Help me apply for job application',
    },
];

const WelcomeScreen = ({ user, onSuggestionClick }: { user: UserSchema | undefined, onSuggestionClick: (text: string) => void }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-10">
            <div className="flex flex-col items-center space-y-6">
                {/* Logo without container/border */}
                <M3Logo size={80} />
                <h1 className="text-2xl font-semibold text-gray-200">How can I help you today?</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSuggestionClick(suggestion.description)}
                        className="flex flex-col items-start p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group text-left"
                    >
                        <span className="text-sm font-medium text-gray-300 mb-1">{suggestion.title}</span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-400">
                            {suggestion.description}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};


export default function NewChat() {
    const { user: userQuery } = useUserHook();
    const userData = userQuery.data;
    const convex = useConvex();
    const queryClient = useQueryClient();

    const { settings, updateSettings } = useSettingsHook(userData?.id);
    const { files: attachedFiles, clearFiles } = useFileInputHook();
    const { clearConversations } = useConversationsHook(userData?.id);

    const [activeConvoId, setActiveConvoId] = useState<Id<"conversations"> | undefined>();
    const [activePublicId, setActivePublicId] = useState<string | undefined>();
    const { createConversation } = useCurrentChatHook();
    const [showMessages, setShowMessages] = useState<boolean>(false);
    const { addMessage, sendToAI, streamingMessage, isStreaming, deleteMessage } = useMessageHook(activeConvoId, userData?.id);

    // Handle title update from AI
    const handleTitleGenerated = useCallback(async (title: string, convoId: Id<"conversations">) => {
        try {
            await convex.mutation(api.conversations.updateConversationTitle, {
                id: convoId,
                title
            });
            // Invalidate conversations query to refresh sidebar
            await queryClient.invalidateQueries({ queryKey: ["conversations"] });
        } catch (error) {
            console.error("Failed to update title:", error);
        }
    }, [convex, queryClient]);

    const handleSuggestionClick = async (suggestion: string) => {
        if (!userData?.id) return;

        // Use helper to create conversation and link files
        const { convoId, publicId, fileIds } = await processSuggestionAction(
            convex,
            userData.id,
            attachedFiles,
            createConversation
        );

        // Update state
        setActiveConvoId(convoId);
        setActivePublicId(publicId);
        setShowMessages(true);

        // Update URL without navigation (prevents refresh)
        window.history.replaceState(null, '', `/chat/${publicId}`);

        // Invalidate to show new conversation in sidebar
        await queryClient.invalidateQueries({ queryKey: ["conversations"] });

        // Add user message with attached files
        await addMessage({
            conversationId: convoId,
            whoSaid: "user",
            message: suggestion,
            attachedFileIds: fileIds.length > 0 ? fileIds.map(id => String(id)) : undefined,
        });

        // Clear attached files after sending
        clearFiles();

        // Trigger AI response with title generation (runs in parallel on server)
        await sendToAI(convoId, {
            isNewConversation: true,
            firstUserMessage: suggestion,
            onTitleGenerated: (title) => handleTitleGenerated(title, convoId),
        });
    };

    const handleSendClick = async (userMessage: string, attachedFileIds?: string[]) => {
        if (!userData?.id) return;

        // Use helper to create conversation if needed and link files
        const { convoId, publicId, fileIds, isNew } = await processSendAction(
            convex,
            userData.id,
            attachedFiles,
            showMessages ? activeConvoId : undefined,
            createConversation
        );

        // Update state if new conversation
        if (isNew) {
            setActiveConvoId(convoId);
            setActivePublicId(publicId);
            setShowMessages(true);
            window.history.replaceState(null, '', `/chat/${publicId}`);
            await queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }

        // Add user message with attached files
        await addMessage({
            conversationId: convoId,
            whoSaid: "user",
            message: userMessage,
            attachedFileIds: fileIds.length > 0 ? fileIds.map(id => String(id)) : undefined,
        });

        // Clear attached files after sending
        clearFiles();

        // Trigger AI response
        await sendToAI(convoId, {
            isNewConversation: isNew,
            firstUserMessage: isNew ? userMessage : undefined,
            onTitleGenerated: isNew ? (title) => handleTitleGenerated(title, convoId) : undefined,
        });
    };

    const handleRegenerate = async (messageId: string) => {
        if (userData?.id && activeConvoId) {
            try {
                // Delete the AI message
                await deleteMessage(messageId as Id<"messages">);

                // Re-trigger generation based on conversation history (which now ends at user message)
                await sendToAI(activeConvoId);
            } catch (error) {
                console.error("Failed to regenerate:", error);
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
            {/* Header / Top Bar could go here if needed */}

            <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col relative">
                {/* Scrollable Content Area */}
                <div className="flex-1 w-full overflow-hidden flex flex-col">
                    {!showMessages ? (
                        <div className="flex-1 h-full flex flex-col items-center justify-center p-4 min-h-[500px] overflow-y-auto">
                            <WelcomeScreen user={userData} onSuggestionClick={handleSuggestionClick} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
                            <Message
                                convoId={activeConvoId}
                                streamingMessage={streamingMessage}
                                isStreaming={isStreaming}
                                onRegenerate={handleRegenerate}
                            />
                        </div>
                    )}
                </div>

                {/* Input Area - Fixed at bottom of the centered container */}
                <div className="flex-shrink-0 w-full p-4 pb-6">
                    <ChatInput
                        handleSend={handleSendClick}
                        selectedModel={settings.data?.selectedModel}
                        onModelChange={(modelId) => updateSettings({
                            selectedModel: modelId,
                            customPersonality: settings.data?.customPersonality
                        })}
                    />
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-gray-500">M3 Chat can make mistakes. Check important info.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}