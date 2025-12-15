'use client';

import { cn } from "@/lib/utils";
import {
    MessageSquare,
    Settings,
    User,
    Search,
    PanelLeftClose,
    Trash2
} from "lucide-react";
import { AsideInterface } from "@/app/components/aside-bar/Aside.interface";
import { M3Logo } from "@/app/components/branding/M3Logo";
import { TypewriterText } from "@/app/components/typewriter/TypewriterText";
import { useUserHook } from "@/hooks/UserHook";
import { useState } from "react";

export function ChatSidebar({
    chats,
    currentChatId,
    newChatId,
    onSelectChat,
    onNewChat,
    onDeleteChat,
    onSearchClick,
    isOpen,
    onToggle,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onNavigateToProfile,
    onNavigateToSettings,
}: AsideInterface) {
    const { user: userQuery } = useUserHook();
    const userData = userQuery.data;
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
                    <button
                        onClick={onSearchClick}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-400 group text-left"
                    >
                        <Search className="w-4 h-4" />
                        <span>Search chats</span>
                        <kbd className="ml-auto text-xs text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">⌘K</kbd>
                    </button>
                </div>

                {/* Main Navigation Scroll Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-3 py-2 space-y-6">

                    {/* Chat History Section */}
                    {chats.length > 0 && (
                        <div className="space-y-1 pt-2">
                            <div className="px-3 py-1 text-xs font-medium text-gray-500">Recent</div>
                            {chats.map(chat => (
                                <div
                                    key={chat.id}
                                    className={cn(
                                        'w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm group relative',
                                        currentChatId === chat.id
                                            ? 'bg-[#1a1a1a] text-gray-100'
                                            : 'hover:bg-white/5 text-gray-300'
                                    )}
                                >
                                    {pendingDeleteId === chat.id ? (
                                        // Confirmation UI
                                        <div className="flex items-center justify-between w-full gap-2">
                                            <span className="text-xs text-gray-400 truncate">Delete?</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteChat(chat.id);
                                                        setPendingDeleteId(null);
                                                    }}
                                                    className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPendingDeleteId(null);
                                                    }}
                                                    className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Normal chat item
                                        <>
                                            <button
                                                onClick={() => onSelectChat(chat.id)}
                                                className="truncate flex-1 text-left"
                                            >
                                                {newChatId === chat.id && chat.title ? (
                                                    <TypewriterText
                                                        text={chat.title}
                                                        speed={30}
                                                    />
                                                ) : (
                                                    chat.title || "New conversation"
                                                )}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPendingDeleteId(chat.id);
                                                }}
                                                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-600/20 text-gray-500 hover:text-red-400 transition-all"
                                                title="Delete conversation"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer User Section */}
                <div className="p-3 border-t border-white/10 bg-black">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onNavigateToSettings}
                            className="flex-1 flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                        >
                            {userData?.profilePicture ? (
                                <img
                                    src={userData.profilePicture}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-gray-400 uppercase">
                                    {userData?.firstName?.[0] || <User className="w-4 h-4" />}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-200 truncate">
                                    {userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User Account' : 'User Account'}
                                </div>
                                <div className="text-xs text-gray-500 truncate">Free Plan</div>
                            </div>
                        </button>
                        <button
                            onClick={onNavigateToSettings}
                            className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-200 transition-colors"
                            title="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
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
