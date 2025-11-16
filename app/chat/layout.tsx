'use client';

import { useEffect, useState, useCallback } from "react";
import { ChatSidebar } from "@/app/components/aside-bar/AsideBar";
import { Chat } from "@/app/components/chat-input/Chat.interface";

export default function ChatLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const chats: Chat[] = [];

    // callback to toggle sidebar
    const handleToggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 1023px)');

        const applyMedia = () => {
            const mobile = mq.matches;
            setIsOpen(!mobile);
        };

        applyMedia();

        // listen for changes (resize / rotate)
        const handler = () => applyMedia();
        mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);

        return () => {
            mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler);
        };
    }, []);

    return (
        <div className="flex min-h-screen font-sans overflow-hidden">
            <ChatSidebar
                chats={chats}
                currentChatId={'0'}
                onSelectChat={() => {}}
                onNewChat={() => {}}
                onDeleteChat={() => {}}
                isOpen={isOpen}
                onToggle={handleToggle}
                onNavigateToProfile={() => {}}
                onNavigateToSettings={() => {}}
            />

            <main className="flex-1 p-6" role="main">
                {children}
            </main>
        </div>
    );
}
