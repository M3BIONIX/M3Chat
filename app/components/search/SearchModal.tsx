'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MessageSquare, PenSquare } from 'lucide-react';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SearchResult {
    conversationId: string;
    conversationTitle: string;
    conversationPublicId: string;
    messageId: string;
    messageContent: string;
    whoSaid: 'user' | 'agent';
    createdAt: number;
    score: number;
}

interface GroupedResults {
    today: SearchResult[];
    yesterday: SearchResult[];
    previous7Days: SearchResult[];
    previous30Days: SearchResult[];
    older: SearchResult[];
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string;
    onSelectResult: (conversationPublicId: string, messageId: string) => void;
    onNewChat: () => void;
}

export function SearchModal({ isOpen, onClose, userId, onSelectResult, onNewChat }: SearchModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const convex = useConvex();

    // Handle body scroll lock when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            // Save current scroll position and lock body
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scroll position and unlock body
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }

        return () => {
            // Cleanup on unmount
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setResults([]);
            setHasSearched(false);
        }
    }, [isOpen]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Close on Escape
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
            // Open on Cmd/Ctrl + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (!isOpen) {
                    // Parent component should handle this
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Debounced search
    const performSearch = useCallback(async (query: string) => {
        if (!userId || query.trim().length < 2) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        try {
            const searchResults = await convex.action(api.messageEmbeddings.globalSearchMessages, {
                userId,
                query: query.trim(),
                limit: 15,
            });
            setResults(searchResults as SearchResult[]);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
            toast.error('Search failed. Please try again.', {
                duration: 3000,
            });
        } finally {
            setIsSearching(false);
        }
    }, [convex, userId]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                performSearch(searchQuery);
            } else {
                setResults([]);
                setHasSearched(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, performSearch]);

    // Group results by time period
    const groupedResults: GroupedResults = {
        today: [],
        yesterday: [],
        previous7Days: [],
        previous30Days: [],
        older: [],
    };

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const startOfYesterday = startOfToday - oneDay;
    const startOf7DaysAgo = startOfToday - (7 * oneDay);
    const startOf30DaysAgo = startOfToday - (30 * oneDay);

    // Deduplicate by conversation (show only best match per conversation)
    const seenConversations = new Set<string>();
    const deduplicatedResults = results.filter(result => {
        if (seenConversations.has(result.conversationPublicId)) {
            return false;
        }
        seenConversations.add(result.conversationPublicId);
        return true;
    });

    deduplicatedResults.forEach(result => {
        if (result.createdAt >= startOfToday) {
            groupedResults.today.push(result);
        } else if (result.createdAt >= startOfYesterday) {
            groupedResults.yesterday.push(result);
        } else if (result.createdAt >= startOf7DaysAgo) {
            groupedResults.previous7Days.push(result);
        } else if (result.createdAt >= startOf30DaysAgo) {
            groupedResults.previous30Days.push(result);
        } else {
            groupedResults.older.push(result);
        }
    });

    const handleResultClick = (result: SearchResult) => {
        onSelectResult(result.conversationPublicId, result.messageId);
        onClose();
    };

    const handleNewChatClick = () => {
        onNewChat();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
                <div
                    className="w-full max-w-[600px] mx-4 bg-[#2f2f2f] rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="search-modal-title"
                >
                    {/* Search Header */}
                    <div className="flex items-center px-4 py-3 border-b border-white/10">
                        <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search chats..."
                            className="flex-1 bg-transparent text-gray-100 text-lg placeholder-gray-500 outline-none"
                            id="search-modal-title"
                        />
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors ml-2"
                            aria-label="Close search"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Results Area */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {/* New Chat Option */}
                        <button
                            onClick={handleNewChatClick}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                        >
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10">
                                <PenSquare className="w-4 h-4 text-gray-300" />
                            </div>
                            <span className="text-gray-200 font-medium">New chat</span>
                        </button>

                        {/* Loading State */}
                        {isSearching && (
                            <div className="px-4 py-6 text-center text-gray-400">
                                <div className="inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mb-2" />
                                <p>Searching...</p>
                            </div>
                        )}

                        {/* No Results */}
                        {!isSearching && hasSearched && deduplicatedResults.length === 0 && searchQuery.trim().length >= 2 && (
                            <div className="px-4 py-6 text-center text-gray-400">
                                <p>No results found for &ldquo;{searchQuery}&rdquo;</p>
                            </div>
                        )}

                        {/* Grouped Results */}
                        {!isSearching && (
                            <>
                                {groupedResults.today.length > 0 && (
                                    <ResultGroup
                                        title="Today"
                                        results={groupedResults.today}
                                        onResultClick={handleResultClick}
                                    />
                                )}
                                {groupedResults.yesterday.length > 0 && (
                                    <ResultGroup
                                        title="Yesterday"
                                        results={groupedResults.yesterday}
                                        onResultClick={handleResultClick}
                                    />
                                )}
                                {groupedResults.previous7Days.length > 0 && (
                                    <ResultGroup
                                        title="Previous 7 Days"
                                        results={groupedResults.previous7Days}
                                        onResultClick={handleResultClick}
                                    />
                                )}
                                {groupedResults.previous30Days.length > 0 && (
                                    <ResultGroup
                                        title="Previous 30 Days"
                                        results={groupedResults.previous30Days}
                                        onResultClick={handleResultClick}
                                    />
                                )}
                                {groupedResults.older.length > 0 && (
                                    <ResultGroup
                                        title="Older"
                                        results={groupedResults.older}
                                        onResultClick={handleResultClick}
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer hint */}
                    <div className="px-4 py-2 border-t border-white/10 text-xs text-gray-500 flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">ESC</kbd>
                        <span>to close</span>
                    </div>
                </div>
            </div>
        </>
    );
}

// Result Group Component
function ResultGroup({
    title,
    results,
    onResultClick,
}: {
    title: string;
    results: SearchResult[];
    onResultClick: (result: SearchResult) => void;
}) {
    return (
        <div className="py-2">
            <div className="px-4 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                {title}
            </div>
            {results.map((result) => (
                <button
                    key={`${result.conversationId}-${result.messageId}`}
                    onClick={() => onResultClick(result)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left group"
                >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-600 flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-gray-200 font-medium truncate">
                            {result.conversationTitle}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                            {result.messageContent.substring(0, 80)}
                            {result.messageContent.length > 80 ? '...' : ''}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
