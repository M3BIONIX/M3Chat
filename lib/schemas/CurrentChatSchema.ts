import * as z from 'zod';

const currentChatSchema = z.object({
    id: z.string(),
    title: z.string(),
    userId: z.string(),
    createdAt: z.optional(z.number()),
})

export type CurrentChat = z.infer<typeof currentChatSchema>;