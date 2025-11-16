import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {CurrentChat} from "@/lib/schemas/CurrentChatSchema";
import {useConvex} from "convex/react";
import {api} from "@/convex/_generated/api";
import {Id} from "@/convex/_generated/dataModel";

export const currentChatQueryKey = ['currentChat']

export default function useCurrentChatHook() {
    const queryClient = useQueryClient();
    const convex = useConvex();

    const currentChat = useQuery({
        queryKey: currentChatQueryKey,
        queryFn: () => {
            return {} as CurrentChat
        },
        initialData: {} as CurrentChat,
        staleTime: Infinity,
        gcTime: Infinity
    })

    const createConversationMutation = useMutation({
        mutationFn: async (userId: Id<"users">) => {
            return await convex.mutation(api.conversations.createConversation, {
                userId,
                title: ""
            })
        },
        onSuccess: (conversationId: string) => {
            queryClient.setQueryData<CurrentChat>(currentChatQueryKey, (conv = {title: ""} as CurrentChat) => {
                return {...conv, id: conversationId as string}
            })
        }

    })

    const loadConversationMutation = useMutation({
        mutationFn: async (conversationId: Id<"conversations">) => {
            const conversation = await convex.query(
                api.conversations.getConversation,
                { conversationId }
            );
            return conversation;
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


    const createConversation = async(userId: Id<"users">) => {
        return await createConversationMutation.mutateAsync(userId) as string;
    }

    const loadConversation = async(convoId: Id<"conversations">) => {
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
