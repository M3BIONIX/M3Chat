import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const conversationsTable = "conversations";

/**
 * Delete a conversation and all its associated data:
 * - All messages
 * - All message embeddings
 * - All attached files (from storage and database)
 * - All file chunks/embeddings
 * - Conversation summary
 * - The conversation itself
 */
export const deleteConversationWithAllData = mutation({
    args: {
        conversationId: v.id(conversationsTable)
    },
    handler: async (ctx, args) => {
        const convoId = args.conversationId;

        // 1. Delete all file chunks/embeddings
        const chunks = await ctx.db.query("fileChunks")
            .withIndex("by_conversation", (q) => q.eq("conversationId", convoId))
            .collect();

        for (const chunk of chunks) {
            await ctx.db.delete(chunk._id);
        }

        // 2. Delete all message embeddings
        const messageEmbeddings = await ctx.db.query("messageEmbeddings")
            .withIndex("by_conversation", (q) => q.eq("conversationId", convoId))
            .collect();

        for (const embedding of messageEmbeddings) {
            await ctx.db.delete(embedding._id);
        }

        // 3. Delete conversation summary if exists
        const summary = await ctx.db.query("conversationSummaries")
            .withIndex("by_conversation", (q) => q.eq("conversationId", convoId))
            .first();

        if (summary) {
            await ctx.db.delete(summary._id);
        }

        // 4. Delete all attached files (from storage and database)
        const files = await ctx.db.query("attachedFiles").filter(
            (q) => q.eq(q.field("conversationId"), convoId)
        ).collect();

        for (const file of files) {
            await ctx.storage.delete(file.storageId);
            await ctx.db.delete(file._id);
        }

        // 5. Delete all messages
        const messages = await ctx.db.query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", convoId))
            .collect();

        for (const message of messages) {
            await ctx.db.delete(message._id);
        }

        // 6. Delete the conversation itself
        await ctx.db.delete(convoId);

        return {
            success: true,
            deleted: {
                chunks: chunks.length,
                messageEmbeddings: messageEmbeddings.length,
                files: files.length,
                messages: messages.length
            }
        };
    }
});
