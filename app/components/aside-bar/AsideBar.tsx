import { cn } from "@/lib/utils";
import {
    MessageSquare,
    Settings,
    User,
    Search,
    LayoutGrid,
    Database,
    PanelLeftClose
} from "lucide-react";
import { AsideInterface } from "@/app/components/aside-bar/Aside.interface";
import { M3Logo } from "@/app/components/branding/M3Logo";
import { TypewriterText } from "@/app/components/typewriter/TypewriterText";

export function ChatSidebar({
    chats,
    currentChatId,
    newChatId,
    onSelectChat,
    onNewChat,
    isOpen,
    onToggle,
    onNavigateToProfile,
    onNavigateToSettings,
}: AsideInterface) {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={onToggle}
                    aria-hidden="true"
                    role="presentation"
                />
            )}

            {/* Sidebar Container - ChatGPT Style Width & Layout */}
            <div
                className={cn(
                    'fixed lg:relative inset-y-0 left-0 z-50 w-[260px] bg-black border-r border-white/10 flex flex-col transition-transform duration-300',
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden'
                )}
                aria-label="Primary sidebar"
            >
                {/* Header Section: New Chat + Toggle */}
                <div className="p-3 pb-0 flex items-center justify-between">
                    <button
                        onClick={onNewChat}
                        className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-200 group border border-transparent hover:border-gray-700/50"
                    >
                        <M3Logo size={20} />
                        <span className="font-medium">New chat</span>
                        <MessageSquare className="ml-auto w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <button
                        onClick={onToggle}
                        className="p-2 ml-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200"
                        title="Close sidebar"
                    >
                        <PanelLeftClose className="w-5 h-5" />
                    </button>
                </div>

                {/* Secondary Header: Search */}
                <div className="px-3 py-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-400 group text-left">
                        <Search className="w-4 h-4" />
                        <span>Search chats</span>
                    </button>
                </div>

                {/* Main Navigation Scroll Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-3 py-2 space-y-6">

                    {/* Top Level Nav */}
                    <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-200">
                            <LayoutGrid className="w-4 h-4" />
                            <span>M3Chat</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-200">
                            <Database className="w-4 h-4" />
                            <span>Library</span>
                        </button>
                    </div>

                    {/* Chat History Section */}
                    {chats.length > 0 && (
                        <div className="space-y-1 pt-2">
                            <div className="px-3 py-1 text-xs font-medium text-gray-500">Recent</div>
                            {chats.map(chat => (
                                <button
                                    key={chat.id}
                                    onClick={() => onSelectChat(chat.id)}
                                    className={cn(
                                        'w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm group relative',
                                        currentChatId === chat.id
                                            ? 'bg-[#1a1a1a] text-gray-100'
                                            : 'hover:bg-white/5 text-gray-300'
                                    )}
                                >
                                    <span className="truncate flex-1">
                                        {newChatId === chat.id && chat.title ? (
                                            <TypewriterText
                                                text={chat.title}
                                                speed={30}
                                            />
                                        ) : (
                                            chat.title || "New conversation"
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer User Section */}
                <div className="p-3 border-t border-white/10 bg-black">
                    <button
                        onClick={onNavigateToProfile}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-gray-400">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-medium text-gray-200">User Account</div>
                            <div className="text-xs text-gray-500">Free Plan</div>
                        </div>
                        <Settings className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>

            {/* Toggle Button for when Sidebar is Closed */}
            {!isOpen && (
                <div className="fixed top-2 left-2 z-50">
                    <button
                        onClick={onToggle}
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-colors"
                        title="Open sidebar"
                    >
                        <MessageSquare className="w-5 h-5" />
                    </button>
                </div>
            )}
        </>
    );
}

