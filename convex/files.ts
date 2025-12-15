import { v } from "convex/values";
import { action, mutation, query } from "@/convex/_generated/server";
import { internal } from "./_generated/api";
import { fileEmbeddingPool } from "@/convex/fileEmbeddings";

const MAX_SIZE = 10 * 1024 * 1024;

export const generateUploadUrl = action(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

const attachedFilesTable = "attachedFiles";
const conversationsTable = "conversations";

/**
 * Upload a file to storage and create a database record.
 * If conversationId and userId are provided, automatically triggers embedding.
 */
export const uploadFiles = mutation({
    args: {
        storageId: v.id("_storage"),
        name: v.string(),
        type: v.string(),
        size: v.number(),
        conversationId: v.optional(v.id(conversationsTable)),
        userId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (args.size > MAX_SIZE) {
            throw new Error(`File ${args.name} exceeds 10MB limit.`);
        }
        if (args.type !== "application/pdf" && args.type !== "application/txt" && args.type !== "text/plain") {
            throw new Error("M3 Chat only supports PDF or TXT Files");
        }

        const id = crypto.randomUUID();
        const hasConversation = args.conversationId && args.userId;

        const fileId = await ctx.db.insert(attachedFilesTable, {
            id,
            name: args.name,
            type: args.type,
            size: args.size,
            storageId: args.storageId,
            conversationId: args.conversationId,
            uploadedAt: Date.now(),
            status: hasConversation ? "queued" : "pending",
        });

        // If conversationId and userId are provided, trigger embedding immediately
        if (hasConversation) {
            await fileEmbeddingPool.enqueueAction(
                ctx,
                internal.fileEmbeddings.processFileEmbeddingsInternal,
                {
                    fileId,
                    conversationId: args.conversationId!,
                    userId: args.userId!,
                }
            );
        }

        return await ctx.db.get(fileId);
    }
});

/**
 * Link an existing file to a conversation and trigger embedding.
 * Used when files are uploaded before conversation is created.
 */
export const linkFileToConversation = mutation({
    args: {
        fileId: v.id(attachedFilesTable),
        conversationId: v.id(conversationsTable),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        // Link file to conversation and update status
        await ctx.db.patch(args.fileId, {
            conversationId: args.conversationId,
            status: "queued",
        });

        // Trigger embedding via WorkPool
        await fileEmbeddingPool.enqueueAction(
            ctx,
            internal.fileEmbeddings.processFileEmbeddingsInternal,
            {
                fileId: args.fileId,
                conversationId: args.conversationId,
                userId: args.userId,
            }
        );

        return { success: true };
    }
});

export const getConversationFiles = query({
    args: {
        conversationId: v.id(conversationsTable)
    },
    handler: async (ctx, args) => {
        const files = await ctx.db.query(attachedFilesTable).filter(
            (q) =>
                q.eq(q.field("conversationId"), args.conversationId)
        ).collect()

        return Promise.all(
            files.map(async (file) => ({
                ...file,
                url: await ctx.storage.getUrl(file.storageId),
            }))
        );
    }
});

export const deleteFile = mutation({
    args: { fileId: v.id("attachedFiles") },
    handler: async (ctx, args) => {
        const file = await ctx.db.get(args.fileId);
        if (!file) {
            throw new Error("File not found");
        }

        // Delete from storage
        await ctx.storage.delete(file.storageId);

        // Delete from database
        await ctx.db.delete(args.fileId);

        return { success: true };
    },
});

/**
 * Get file metadata by ID (for use in actions)
 */
export const getFileMetadata = query({
    args: {
        fileId: v.id(attachedFilesTable)
    },
    handler: async (ctx, args) => {
        const file = await ctx.db.get(args.fileId);
        return file;
    }
});

/**
 * Get file URL from storage
 */
export const getFileUrl = query({
    args: {
        storageId: v.id("_storage")
    },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    }
});

/**
 * Delete all files associated with a conversation
 */
export const deleteFilesByConversationId = mutation({
    args: {
        conversationId: v.id(conversationsTable)
    },
    handler: async (ctx, args) => {
        const files = await ctx.db.query(attachedFilesTable).filter(
            (q) => q.eq(q.field("conversationId"), args.conversationId)
        ).collect();

        for (const file of files) {
            // Delete from storage
            await ctx.storage.delete(file.storageId);
            // Delete from database
            await ctx.db.delete(file._id);
        }

        return { success: true, deletedCount: files.length };
    }
});