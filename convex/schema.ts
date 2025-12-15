import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    attachedFiles: defineTable({
        id: v.string(),
        name: v.string(),
        type: v.union(
            v.literal("application/pdf"),
            v.literal("application/txt"),
            v.literal("text/plain")
        ),
        size: v.number(),
        storageId: v.id("_storage"),
        conversationId: v.optional(v.id("conversations")),
        uploadedAt: v.optional(v.number()),
        status: v.optional(v.string()), // "embedding" | "embedded" | "failed"
        totalChunks: v.optional(v.number()),
    }),
    fileChunks: defineTable({
        conversationId: v.id("conversations"),
        userId: v.string(),
        fileName: v.string(),
        fileId: v.id("attachedFiles"),
        chunkIndex: v.number(),
        content: v.string(),
        embedding: v.array(v.float64()),
    })
        .vectorIndex("by_embedding", {
            vectorField: "embedding",
            dimensions: 1024, // Mistral embed dimensions
            filterFields: ["conversationId"],
        })
        .index("by_conversation", ["conversationId"])
        .index("by_file", ["fileId"]),
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
        model: v.optional(v.string()),
        attachedFileIds: v.optional(v.array(v.id("attachedFiles")))
    }).index("by_conversation", ["conversationId"]),
    messageEmbeddings: defineTable({
        messageId: v.id("messages"),
        conversationId: v.id("conversations"),
        userId: v.string(),
        content: v.string(),           // Original message content
        embedding: v.array(v.float64()), // Vector embedding
        whoSaid: v.union(v.literal("user"), v.literal("agent")),
        createdAt: v.number(),
    })
        .vectorIndex("by_embedding", {
            vectorField: "embedding",
            dimensions: 1024, // Mistral embed dimensions
            filterFields: ["conversationId"],
        })
        .index("by_conversation", ["conversationId"])
        .index("by_message", ["messageId"]),
    conversationSummaries: defineTable({
        conversationId: v.id("conversations"),
        userId: v.string(),
        summary: v.string(),
        messageCount: v.number(),      // Number of messages summarized
        lastUpdatedAt: v.number(),
    }).index("by_conversation", ["conversationId"]),
    userSettings: defineTable({
        userId: v.string(),
        selectedModel: v.optional(v.string()),
        customPersonality: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number()
    }).index("by_user", ["userId"])
});