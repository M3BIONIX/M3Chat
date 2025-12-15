import * as z from 'zod';

const currentChatSchema = z.object({
    id: z.string(),
    title: z.string(),
    userId: z.string(),
    createdAt: z.optional(z.number()),
})

export type CurrentChat = z.infer<typeof currentChatSchema>;

const createMessageSchema = z.object({
    conversationId: z.string(),
    whoSaid: z.union([z.literal("user"), z.literal("agent")]),
    message: z.string(),
    model: z.optional(z.string()),
    attachedFileIds: z.optional(z.array(z.string())),
})

export type CreateMessageSchema = z.infer<typeof createMessageSchema>;
export type Messages = z.infer<typeof createMessageSchema>;