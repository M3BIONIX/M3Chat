import {mutation} from "@/convex/_generated/server";
import {v} from "convex/values";

const conversationTableName = "conversations";

export const createConversation = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const id = crypto.randomUUID();
        const epochNumber = Number(new Date())
        return await ctx.db.insert(conversationTableName, {
            id,
            title: "",
            userId: args.userId,
            createdAt: epochNumber
        });
    }
})

export const updateConversationTitle = mutation({
    args: {
        id: v.id(conversationTableName),
        title: v.string()
    },
    handler: async(ctx, args) => {
        await ctx.db.patch(args.id, {
            title: args.title
        })
    }

})