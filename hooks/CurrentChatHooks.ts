import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CurrentChat } from "@/lib/schemas/CurrentChatSchema";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const currentChatQueryKey = ['currentChat']

export default function useCurrentChatHook(convoId?: Id<"conversations">) {
    const queryClient = useQueryClient();
    const convex = useConvex();

    const currentChat = useQuery({
        queryKey: currentChatQueryKey,
        queryFn: async () => {
            return convoId ? await loadConversation(convoId) : {} as CurrentChat;
        },
        initialData: {} as CurrentChat,
        staleTime: Infinity,
        gcTime: Infinity
    })

    const createConversationMutation = useMutation({
        mutationFn: async (userId: string) => {
            return await convex.mutation(api.conversations.createConversation, {
                userId
            })
        },
        onSuccess: (result: { _id: string; publicId: string }) => {
            queryClient.setQueryData<CurrentChat>(currentChatQueryKey, (conv = { title: "" } as CurrentChat) => {
                return { ...conv, id: result._id as string, publicId: result.publicId }
            })
        }

    })

    const loadConversationMutation = useMutation({
        mutationFn: async (conversationId: Id<"conversations">) => {
            return await convex.mutation(
                api.conversations.getConversation,
                { convoId: conversationId }
            );
        },
        onSuccess: (conversation) => {
            if (conversation) {
                queryClient.setQueryData<CurrentChat>(currentChatQueryKey, {
                    id: conversation._id,
                    title: conversation.title,
                    userId: conversation.userId,
                    createdAt: conversation.createdAt,
                });
            }
        }
    });


    const createConversation = async (userId: string) => {
        const result = await createConversationMutation.mutateAsync(userId);
        return { _id: result._id as Id<"conversations">, publicId: result.publicId };
    }

    const loadConversation = async (convoId: Id<"conversations">) => {
        return await loadConversationMutation.mutateAsync(convoId) as CurrentChat;
    }


    const updateChat = async (updates: Partial<CurrentChat>) => {
        queryClient.setQueryData<CurrentChat>(currentChatQueryKey, (old = {
            title: "",
        } as CurrentChat) => ({
            ...old,
            ...updates,
        }));
    };

    return {
        currentChat,
        createConversation,
        loadConversation,
        updateChat,
    }
}
