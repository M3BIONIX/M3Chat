'use client';

import React, { useState } from "react";
import { ChatInput } from "@/app/components/chat-input/ChatInput";
import { useUserHook } from "@/hooks/UserHook";
import useCurrentChatHook from "@/hooks/CurrentChatHooks";
import { Message } from "@/app/components/messages/messages";
import { UserSchema } from "@/lib/schemas/AuthSchema";

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
        <>
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-semibold text-white">Hey! {user?.firstName || ''}</h1>
                <p className="text-xl text-gray-400">What can I help with?</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 px-4">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSuggestionClick(suggestion.description)}
                        className="flex flex-col items-start p-5 rounded-xl border border-gray-800 bg-[#1a1a1a]/50 backdrop-blur-sm hover:bg-[#252525] hover:border-gray-700 transition-all group min-w-[200px]"
                    >
                        <span className="text-sm text-cyan-400 mb-2">{suggestion.title}</span>
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 text-left">
                            {suggestion.description}
                        </span>
                    </button>
                ))}
            </div>
        </>
    );
};

export default function NewChat() {
    const { user: userQuery } = useUserHook();
    const userData = userQuery.data;

    const { currentChat, createConversation } = useCurrentChatHook();
    const [showMessages, setShowMessages] = useState<boolean>(false);
    const [pendingMessage, setPendingMessage] = useState<string | undefined>(undefined);

    const handleSuggestionClick = async (suggestion: string) => {
        if (userData?.externalId) {
            const convoId = await createConversation(userData.externalId);
            setPendingMessage(suggestion);
            setShowMessages(true);
        }
    };

    const handleSendClick = async (userMessage: string) => {
        if (userData?.externalId) {
            if (!showMessages) {
                const convoId = await createConversation(userData.externalId);
                setPendingMessage(userMessage);
                setShowMessages(true);
            } else {
                setPendingMessage(userMessage);
            }
        }
    };

    return (
        <div className="flex-1 flex h-full flex-col items-center justify-between relative overflow-hidden py-12">
            <div className="relative z-10 w-full max-w-4xl px-8 flex-1 flex flex-col justify-center space-y-16">

                {!showMessages ? (
                    <WelcomeScreen user={userData} onSuggestionClick={handleSuggestionClick} />
                ) : (
                    <Message
                        convoId={currentChat.data?.id as any}
                        userMessage={pendingMessage}
                    />
                )}

                <ChatInput handleSend={handleSendClick} />
            </div>
        </div>
    );
}