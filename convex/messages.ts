import {mutation, query} from "@/convex/_generated/server";
import {v} from "convex/values";

const conversationsTable = "conversations";
const messagesTable = "messages";

export const createMessage = mutation({
    args: {
        conversationId: v.id(conversationsTable),
        whoSaid: v.union(v.literal("user"), v.literal("agent")),
        message: v.string(),
        model: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const id = crypto.randomUUID();
        const epochNumber = Number(new Date());

        return await ctx.db.insert(messagesTable, {
            id,
            conversationId: args.conversationId,
            whoSaid: args.whoSaid,
            message: args.message,
            createdAt: epochNumber,
            model: args.model,
        });
    },
});

export const getAllMessagesByConversationId = query({
    args: {
        convoId: v.id(conversationsTable)
    },
    handler: async (ctx, args) => {
        return await ctx.db.query(messagesTable).filter((q) =>
            q.eq("conversationId", args.convoId.toString())
        ).order("asc").collect();
    }
})

export const deleteAllMessagesByConversationId = mutation({
    args: {
        convoId: v.id(conversationsTable)
    },
    handler: async (ctx, args) => {
        const messageIds = await ctx.db.query(messagesTable).filter((q) =>
            q.eq("conversationId", args.convoId.toString())
        ).order("asc").collect();

        for (const m of messageIds) {
            await ctx.db.delete(m._id)
        }

        return { success : true}
    }
})