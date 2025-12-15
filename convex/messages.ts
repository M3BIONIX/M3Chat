import { mutation, query } from "@/convex/_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { fileEmbeddingPool } from "./fileEmbeddings";

const conversationsTable = "conversations";
const messagesTable = "messages";

export const createMessage = mutation({
    args: {
        conversationId: v.id(conversationsTable),
        whoSaid: v.union(v.literal("user"), v.literal("agent")),
        message: v.string(),
        model: v.optional(v.string()),
        attachedFileIds: v.optional(v.array(v.id("attachedFiles"))),
        userId: v.optional(v.string()), // Added userId
    },
    handler: async (ctx, args) => {
        const id = crypto.randomUUID();
        const epochNumber = Number(new Date());

        // Link attached files if present
        if (args.attachedFileIds && args.attachedFileIds.length > 0 && args.userId) {
            for (const fileId of args.attachedFileIds) {
                await ctx.db.patch(fileId, {
                    conversationId: args.conversationId,
                    status: "queued"
                });

                // Trigger embedding via WorkPool
                await fileEmbeddingPool.enqueueAction(
                    ctx,
                    internal.fileEmbeddings.processFileEmbeddingsInternal,
                    {
                        fileId,
                        conversationId: args.conversationId,
                        userId: args.userId,
                    }
                );
            }
        }

        return await ctx.db.insert(messagesTable, {
            id,
            conversationId: args.conversationId,
            whoSaid: args.whoSaid,
            message: args.message,
            createdAt: epochNumber,
            model: args.model,
            attachedFileIds: args.attachedFileIds,
        });
    },
});

export const deleteMessage = mutation({
    args: {
        messageId: v.id(messagesTable),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.messageId);
    },
});

export const getAllMessagesByConversationId = query({
    args: {
        convoId: v.id(conversationsTable)
    },
    handler: async (ctx, args) => {
        return await ctx.db.query(messagesTable)
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.convoId))
            .order("asc")
            .collect();
    }
})

export const deleteAllMessagesByConversationId = mutation({
    args: {
        convoId: v.id(conversationsTable)
    },
    handler: async (ctx, args) => {
        const messageIds = await ctx.db.query(messagesTable)
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.convoId))
            .collect();

        for (const m of messageIds) {
            await ctx.db.delete(m._id)
        }

        return { success: true }
    }
})