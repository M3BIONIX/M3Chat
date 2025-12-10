import { Chat } from "@/app/components/chat-input/Chat.interface";

export interface AsideInterface {
    chats: Chat[];
    currentChatId: string | null;
    newChatId?: string | null; // Chat that should show typewriter effect
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    onDeleteChat: (chatId: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    onNavigateToProfile: () => void;
    onNavigateToSettings: () => void;
}