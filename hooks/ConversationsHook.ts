'use client';

import { useQuery } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface Conversation {
    _id: string;
    id: string;  // public UUID for URLs
    title: string;
    userId: string;
    createdAt: number;
}

export const useConversationsHook = (userId?: string) => {
    const convex = useConvex();
    const conversationsQueryKey = ["conversations", userId];

    const conversations = useQuery({
        queryKey: conversationsQueryKey,
        queryFn: async () => {
            if (!userId) return [] as Conversation[];
            return await convex.query(api.conversations.getConversationsByUserId, {
                userId
            }) as Conversation[];
        },
        enabled: !!userId,
        initialData: [] as Conversation[],
    });

    return {
        conversations,
        conversationsQueryKey,
        isLoading: conversations.isLoading,
    };
};
