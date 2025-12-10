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
        userId: v.string(),
        createdAt: v.number()
    }).index("by_user", ["userId"])
        .index("by_public_id", ["id"]),
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
    userSettings: defineTable({
        userId: v.string(),
        selectedModel: v.optional(v.string()),
        customPersonality: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number()
    }).index("by_user", ["userId"])
});