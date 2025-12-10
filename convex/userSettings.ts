import { mutation, query } from "@/convex/_generated/server";
import { v } from "convex/values";

const tableName = "userSettings";

export const getUserSettings = query({
    args: {
        userId: v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db.query(tableName)
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();
    }
});

export const upsertUserSettings = mutation({
    args: {
        userId: v.string(),
        selectedModel: v.optional(v.string()),
        customPersonality: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query(tableName)
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        const now = Date.now();

        if (existing) {
            await ctx.db.patch(existing._id, {
                selectedModel: args.selectedModel,
                customPersonality: args.customPersonality,
                updatedAt: now
            });
            return existing._id;
        } else {
            return await ctx.db.insert(tableName, {
                userId: args.userId,
                selectedModel: args.selectedModel,
                customPersonality: args.customPersonality,
                createdAt: now,
                updatedAt: now
            });
        }
    }
});

export const deleteUserSettings = mutation({
    args: {
        userId: v.string()
    },
    handler: async (ctx, args) => {
        const settings = await ctx.db.query(tableName)
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (settings) {
            await ctx.db.delete(settings._id);
        }
    }
});

// Delete all user data (for account deletion)
export const deleteAllUserData = mutation({
    args: {
        userId: v.string()
    },
    handler: async (ctx, args) => {
        // 1. Get all conversations for this user
        const conversations = await ctx.db.query("conversations")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        // 2. Delete all messages for each conversation
        for (const conv of conversations) {
            const messages = await ctx.db.query("messages")
                .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
                .collect();

            for (const msg of messages) {
                await ctx.db.delete(msg._id);
            }

            // 3. Delete attached files for each conversation
            const files = await ctx.db.query("attachedFiles")
                .filter((q) => q.eq(q.field("conversationId"), conv._id))
                .collect();

            for (const file of files) {
                // Delete the file from storage
                await ctx.storage.delete(file.storageId);
                await ctx.db.delete(file._id);
            }

            // 4. Delete the conversation
            await ctx.db.delete(conv._id);
        }

        // 5. Delete user settings
        const settings = await ctx.db.query(tableName)
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (settings) {
            await ctx.db.delete(settings._id);
        }

        return { success: true };
    }
});
