import { mutation, query } from "@/convex/_generated/server";
import { v } from "convex/values";

const conversationTableName = "conversations";

export const createConversation = mutation({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const publicId = crypto.randomUUID();
        const epochNumber = Number(new Date())
        const _id = await ctx.db.insert(conversationTableName, {
            id: publicId,
            title: "",
            userId: args.userId,
            createdAt: epochNumber
        });
        return { _id, publicId };
    }
})

export const updateConversationTitle = mutation({
    args: {
        id: v.id(conversationTableName),
        title: v.string()
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            title: args.title
        })
    }

})

export const getConversation = mutation({
    args: {
        convoId: v.id(conversationTableName)
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.convoId)
    }
})

export const getConversationsByUserId = query({
    args: {
        userId: v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db.query(conversationTableName)
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    }
})

export const getConversationByPublicId = query({
    args: {
        publicId: v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db.query(conversationTableName)
            .withIndex("by_public_id", (q) => q.eq("id", args.publicId))
            .first();
    }
})