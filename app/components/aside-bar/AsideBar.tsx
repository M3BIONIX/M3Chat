import { cn } from "@/lib/utils";
import { Menu, MessageSquare, Settings, Sparkles, User } from "lucide-react";
import { AsideInterface } from "@/app/components/aside-bar/Aside.interface";

export function ChatSidebar({
    chats,
    currentChatId,
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

            {/* Sidebar (fixed and controlled by isOpen) */}
            <div
                className={cn(
                    'fixed lg:relative inset-y-0 left-0 z-50 w-20 bg-[#0f0f0f] border-r border-gray-800 flex flex-col items-center py-6 transition-transform duration-300',
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
                aria-label="Primary sidebar"
            >
                {/* Logo */}
                <div className="mb-8" aria-hidden="true">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
                    </div>
                </div>

                {/* Navigation Icons */}
                <div className="flex-1 flex flex-col gap-6" role="navigation" aria-label="Sidebar actions">
                    <button
                        onClick={onNewChat}
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-cyan-400 hover:bg-gray-800 transition-colors"
                        title="New Chat"
                        aria-label="New chat"
                        type="button"
                    >
                        <MessageSquare className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <button
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
                        title="History"
                        aria-label="History"
                        type="button"
                    >
                        <Menu className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                {/* Bottom Icons */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={onNavigateToSettings}
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
                        title="Settings"
                        aria-label="Settings"
                        type="button"
                    >
                        <Settings className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <button
                        onClick={onNavigateToProfile}
                        title="Profile"
                        aria-label="Profile"
                        type="button"
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                    >
                        {/* If you don't want an Avatar component yet, show User icon as fallback */}
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg ring-2 ring-transparent hover:ring-cyan-500 transition-all">
                            <User className="h-5 w-5 text-gray-300" aria-hidden="true" />
                        </div>
                    </button>
                </div>
            </div>

            {/* Chat History Panel (Hidden by default, can be toggled) */}
            {chats.length > 0 && (
                <aside className="hidden lg:block w-64 bg-[#0f0f0f] border-r border-gray-800" aria-label="Recent chats">
                    <div className="p-4 border-b border-gray-800">
                        <h2 className="text-sm text-gray-400 uppercase tracking-wide">Recent Chats</h2>
                    </div>

                    <div className="p-2 space-y-1">
                        {chats.map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => onSelectChat(chat.id)}
                                className={cn(
                                    'w-full text-left p-3 rounded-lg transition-colors',
                                    currentChatId === chat.id
                                        ? 'bg-cyan-500/10 border border-cyan-500/30'
                                        : 'hover:bg-gray-800/50 border border-transparent'
                                )}
                                aria-current={currentChatId === chat.id ? 'true' : undefined}
                                type="button"
                            >
                                <p className="text-sm text-gray-300 truncate mb-1">{chat.title}</p>
                                <p className="text-xs text-gray-500 truncate">{chat.messages.length} messages</p>
                            </button>
                        ))}
                    </div>
                </aside>
            )}
        </>
    );
}
