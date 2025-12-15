'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChatSidebar } from "@/app/components/aside-bar/AsideBar";
import { Chat } from "@/app/components/chat-input/Chat.interface";
import { useConversationsHook } from "@/hooks/ConversationsHook";
import { useUserHook } from "@/hooks/UserHook";
import { SettingsModal } from "@/app/components/settings/SettingsModal";
import { SearchModal } from "@/app/components/search/SearchModal";

export default function ChatLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const router = useRouter();
    const pathname = usePathname();

    // Start with null to indicate "not yet determined" - server renders sidebar closed
    const [isOpen, setIsOpen] = useState<boolean | null>(null);
    const [hasMounted, setHasMounted] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Get user and conversations
    const { user: userQuery } = useUserHook();
    const userId = userQuery.data?.id;
    const { conversations, deleteConversation } = useConversationsHook(userId);

    // Extract current chat ID from URL pathname
    const currentChatId = useMemo(() => {
        const match = pathname.match(/\/chat\/([^/]+)/);
        return match ? match[1] : null;
    }, [pathname]);

    // Map Convex conversations to Chat interface format
    const chats: Chat[] = useMemo(() => {
        return (conversations.data || []).map((conv) => ({
            id: conv.id, // Use public UUID for navigation
            title: conv.title || "New conversation",
            model: "mistral",
            messages: [],
            createdAt: conv.createdAt,
            updatedAt: conv.createdAt,
        }));
    }, [conversations.data]);

    // callback to toggle sidebar
    const handleToggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    // Handle chat selection - navigate to conversation
    const handleSelectChat = useCallback((chatId: string) => {
        router.push(`/chat/${chatId}`);
    }, [router]);

    // Handle new chat - navigate to /chat
    const handleNewChat = useCallback(() => {
        router.push('/chat');
    }, [router]);

    // Handle settings modal
    const handleOpenSettings = useCallback(() => {
        setIsSettingsOpen(true);
    }, []);

    // Handle search modal
    const handleOpenSearch = useCallback(() => {
        setIsSearchOpen(true);
    }, []);

    const handleCloseSearch = useCallback(() => {
        setIsSearchOpen(false);
    }, []);

    // Handle search result selection - navigate to conversation and scroll to message
    const handleSearchResultSelect = useCallback((conversationPublicId: string, messageId: string) => {
        // Store messageId in sessionStorage for the chat page to scroll to
        sessionStorage.setItem('scroll_to_message', messageId);
        router.push(`/chat/${conversationPublicId}`);
    }, [router]);

    // Handle delete chat
    const handleDeleteChat = useCallback(async (chatId: string) => {
        try {
            // Find the Convex _id from the public id
            const conv = conversations.data?.find(c => c.id === chatId);
            if (conv) {
                await deleteConversation(conv._id);
                // If we just deleted the current chat, navigate to /chat
                if (currentChatId === chatId) {
                    router.push('/chat');
                }
            }
        } catch (error) {
            console.error("Failed to delete conversation:", error);
        }
    }, [conversations.data, deleteConversation, currentChatId, router]);

    const handleCloseSettings = useCallback(() => {
        setIsSettingsOpen(false);
    }, []);

    // Mark as mounted after first render
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Handle media query only after mount
    useEffect(() => {
        if (!hasMounted) return;

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
    }, [hasMounted]);

    // Keyboard shortcut for search (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Default to closed if not yet determined (for server render)
    const sidebarOpen = isOpen ?? false;


    return (
        <div className="fixed inset-0 flex font-sans overflow-hidden bg-black">
            <ChatSidebar
                chats={chats}
                currentChatId={currentChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                onDeleteChat={handleDeleteChat}
                onSearchClick={handleOpenSearch}
                isOpen={sidebarOpen}
                onToggle={handleToggle}
                onNavigateToProfile={() => { }}
                onNavigateToSettings={handleOpenSettings}
            />

            <main className="flex-1 flex flex-col overflow-hidden" role="main">
                {children}
            </main>

            {/* Settings Modal */}
            <SettingsModal isOpen={isSettingsOpen} onClose={handleCloseSettings} />

            {/* Search Modal */}
            <SearchModal
                isOpen={isSearchOpen}
                onClose={handleCloseSearch}
                userId={userId}
                onSelectResult={handleSearchResultSelect}
                onNewChat={handleNewChat}
            />
        </div>
    );
}

