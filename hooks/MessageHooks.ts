import {Id} from "@/convex/_generated/dataModel";
import {useConvex} from "convex/react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {api} from "@/convex/_generated/api";
import {CreateMessageSchema, Messages} from "@/lib/schemas/CurrentChatSchema";


export const useMessageHook = (convoId?: Id<"conversations">) => {
    const messageHookKey = ['messages', convoId];
    const queryClient = useQueryClient();
    const convex = useConvex();

    const messages = useQuery({
        queryKey: messageHookKey,
        queryFn: async () => {
            if(!convoId) return [] as Messages[];
            return await convex.query(api.messages.getAllMessagesByConversationId, {
                convoId: convoId
            });
        },
        enabled: !!convoId,
        initialData: [] as Messages[],
    });

    const addMessageMutation = useMutation({
        mutationFn: async (req: CreateMessageSchema) => {
            return await convex.mutation(api.messages.createMessage, {
                conversationId: req.conversationId as Id<"conversations">,
                whoSaid: req.whoSaid,
                message: req.message,
                model: req.model
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: messageHookKey });
        }
    });

    const addMessage = async(req: CreateMessageSchema) => {
        return await addMessageMutation.mutateAsync(req);
    };

    return {
        addMessage,
        messages,
        isLoading: messages.isLoading,
    };
};