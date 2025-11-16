import { v } from "convex/values";
import {action, mutation, query} from "@/convex/_generated/server";

const MAX_SIZE = 10 * 1024 * 1024;

export const generateUploadUrl = action(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

const attachedFilesTable = "attachedFiles";
const conversationsTable = "conversations";

export const uploadFiles = mutation({
    args: {
        storageId: v.id("_storage"),
        name: v.string(),
        type: v.string(),
        size: v.number(),
        conversationId: v.id("conversations"), // Make optional
    },
    handler: async (ctx, args) => {
        if(args.size > MAX_SIZE) {
            throw new Error(`File ${args.name} exceeds 10MB limit.`);
        }
        const id = crypto.randomUUID();

        const fileId = await ctx.db.insert(attachedFilesTable, {
            id,
            name: args.name,
            type: args.type,
            size: args.size,
            storageId: args.storageId,
            conversationId: args.conversationId,
            uploadedAt: Date.now(),
        });

        return await ctx.db.get(fileId);
    }
})

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
})


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