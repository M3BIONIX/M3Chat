import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    attachedFiles: defineTable({
        id: v.string(),
        name: v.string(),
        type: v.union(
            v.literal("application/pdf"),
            v.literal("application/txt")
        ),
        size: v.number(),
        storageId: v.id("_storage"),
        conversationId: v.optional(v.id("conversations")),
        uploadedAt: v.optional(v.number())
    }),
    conversations: defineTable({
        id: v.string(),
        title: v.string(),
        userId: v.id("users"),
        createdAt: v.number()
    }).index("by_user", ["userId"]),
    messages: defineTable({
        id: v.string(),
        conversationId: v.id("conversations"),
        whoSaid: v.union(
            v.literal("user"),
            v.literal("agent")
        ),
        message: v.string(),
        createdAt: v.number(),
        model: v.optional(v.string())
    }).index("by_conversation", ["conversationId"]),
    users: defineTable({
        workOsId: v.string(),
        name: v.string(),
        email: v.string(),
        avatarUrl: v.optional(v.string()),
        createdAt: v.number()
    }).index("by_workos_id", ["workOsId"]),
});