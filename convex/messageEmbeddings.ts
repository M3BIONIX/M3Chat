import { action, query, mutation, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { Workpool } from "@convex-dev/workpool";
import { Id } from "./_generated/dataModel";

// WorkPool for async message embedding processing
export const messageEmbeddingPool = new Workpool(components.messageEmbedding, {
    maxParallelism: 20,
    defaultRetryBehavior: {
        maxAttempts: 3,
        initialBackoffMs: 100,
        base: 2,
    },
    retryActionsByDefault: true,
    logLevel: "INFO",
});

/**
 * Get embeddings from Mistral API
 */
async function getEmbedding(text: string): Promise<number[]> {
    const response = await fetch("https://api.mistral.ai/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
            model: "mistral-embed",
            input: [text],
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Mistral Embeddings API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
}

// ===== INTERNAL MUTATIONS/QUERIES =====

/**
 * Internal: Store message embedding
 */
export const storeMessageEmbeddingInternal = internalMutation({
    args: {
        messageId: v.id("messages"),
        conversationId: v.id("conversations"),
        userId: v.string(),
        content: v.string(),
        embedding: v.array(v.float64()),
        whoSaid: v.union(v.literal("user"), v.literal("agent")),
        createdAt: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("messageEmbeddings", {
            messageId: args.messageId,
            conversationId: args.conversationId,
            userId: args.userId,
            content: args.content,
            embedding: args.embedding,
            whoSaid: args.whoSaid,
            createdAt: args.createdAt,
        });
    },
});

/**
 * Internal: Get message by ID
 */
export const getMessageInternal = internalQuery({
    args: {
        messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.messageId);
    },
});

/**
 * Internal: Get embedding records by IDs
 */
export const getEmbeddingsByIdsInternal = internalQuery({
    args: {
        embeddingIds: v.array(v.id("messageEmbeddings")),
    },
    handler: async (ctx, args) => {
        const results = await Promise.all(
            args.embeddingIds.map(async (id) => await ctx.db.get(id))
        );
        return results.filter(Boolean);
    },
});

/**
 * Internal Action: Process a message and create its embedding
 */
export const processMessageEmbeddingInternal = internalAction({
    args: {
        messageId: v.id("messages"),
        conversationId: v.id("conversations"),
        userId: v.string(),
        content: v.string(),
        whoSaid: v.union(v.literal("user"), v.literal("agent")),
        createdAt: v.number(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; embeddingId?: Id<"messageEmbeddings"> }> => {
        try {
            // Skip empty messages
            if (!args.content || args.content.trim().length === 0) {
                return { success: false };
            }

            // Get embedding from Mistral
            const embedding = await getEmbedding(args.content);

            // Store the embedding
            const embeddingId = await ctx.runMutation(
                internal.messageEmbeddings.storeMessageEmbeddingInternal,
                {
                    messageId: args.messageId,
                    conversationId: args.conversationId,
                    userId: args.userId,
                    content: args.content,
                    embedding: embedding,
                    whoSaid: args.whoSaid,
                    createdAt: args.createdAt,
                }
            );

            return { success: true, embeddingId };
        } catch (error) {
            console.error("Failed to create message embedding:", error);
            throw error;
        }
    },
});

// ===== PUBLIC API =====

/**
 * Enqueue a message embedding job
 */
export const enqueueMessageEmbedding = mutation({
    args: {
        messageId: v.id("messages"),
        conversationId: v.id("conversations"),
        userId: v.string(),
        content: v.string(),
        whoSaid: v.union(v.literal("user"), v.literal("agent")),
        createdAt: v.number(),
    },
    handler: async (ctx, args) => {
        await messageEmbeddingPool.enqueueAction(
            ctx,
            internal.messageEmbeddings.processMessageEmbeddingInternal,
            {
                messageId: args.messageId,
                conversationId: args.conversationId,
                userId: args.userId,
                content: args.content,
                whoSaid: args.whoSaid,
                createdAt: args.createdAt,
            }
        );

        return { success: true };
    },
});

/**
 * Get embeddings by their IDs (public query for use in actions)
 */
export const getEmbeddingsByIds = query({
    args: {
        embeddingIds: v.array(v.id("messageEmbeddings")),
    },
    handler: async (ctx, args) => {
        const results = await Promise.all(
            args.embeddingIds.map(async (id) => await ctx.db.get(id))
        );
        return results.filter(Boolean);
    },
});

/**
 * Get recent messages using sliding window approach
 */
export const getRecentMessages = query({
    args: {
        conversationId: v.id("conversations"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 10;

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .order("desc")
            .take(limit);

        // Return in chronological order
        return messages.reverse();
    },
});

/**
 * Search for relevant messages using vector similarity
 */
export const searchRelevantMessages = action({
    args: {
        conversationId: v.id("conversations"),
        query: v.string(),
        limit: v.optional(v.number()),
        excludeMessageIds: v.optional(v.array(v.id("messages"))),
    },
    handler: async (ctx, args): Promise<Array<{
        messageId: Id<"messages">;
        content: string;
        whoSaid: "user" | "agent";
        createdAt: number;
        score: number;
    }>> => {
        const searchLimit = args.limit ?? 5;
        const excludeIds = args.excludeMessageIds ?? [];

        // Get query embedding
        const queryEmbedding = await getEmbedding(args.query);

        // Vector search with conversation filter
        const results = await ctx.vectorSearch("messageEmbeddings", "by_embedding", {
            vector: queryEmbedding,
            limit: searchLimit + excludeIds.length, // Get extra to account for exclusions
            filter: (q) => q.eq("conversationId", args.conversationId),
        });

        if (results.length === 0) {
            return [];
        }

        // Fetch full embedding records
        const { api } = await import("./_generated/api");
        const embeddingIds = results.map(r => r._id);
        const embeddings = await ctx.runQuery(api.messageEmbeddings.getEmbeddingsByIds, {
            embeddingIds,
        });

        // Combine with scores and filter out excluded message IDs
        const combined = results
            .map((result) => {
                const embedding = embeddings.find(e => e && e._id === result._id);
                if (!embedding) return null;
                if (excludeIds.includes(embedding.messageId)) return null;

                return {
                    messageId: embedding.messageId,
                    content: embedding.content,
                    whoSaid: embedding.whoSaid,
                    createdAt: embedding.createdAt,
                    score: result._score,
                };
            })
            .filter((c): c is NonNullable<typeof c> => c !== null)
            .slice(0, searchLimit);

        return combined;
    },
});

/**
 * Get optimized conversation context combining sliding window + relevant messages
 */
export const getConversationContext = action({
    args: {
        conversationId: v.id("conversations"),
        currentQuery: v.string(),
        slidingWindowSize: v.optional(v.number()),
        maxRelevantMessages: v.optional(v.number()),
    },
    handler: async (ctx, args): Promise<{
        messages: Array<{
            messageId: Id<"messages">;
            content: string;
            whoSaid: "user" | "agent";
            createdAt: number;
            source: "recent" | "relevant";
        }>;
        summary: string | null;
    }> => {
        const windowSize = args.slidingWindowSize ?? 10;
        const maxRelevant = args.maxRelevantMessages ?? 5;

        const { api } = await import("./_generated/api");

        // 1. Get recent messages (sliding window)
        const recentMessages = await ctx.runQuery(api.messageEmbeddings.getRecentMessages, {
            conversationId: args.conversationId,
            limit: windowSize,
        });

        const recentMessageIds = recentMessages.map(m => m._id);

        // 2. Search for relevant older messages (excluding recent ones)
        let relevantMessages: Array<{
            messageId: Id<"messages">;
            content: string;
            whoSaid: "user" | "agent";
            createdAt: number;
            score: number;
        }> = [];

        if (args.currentQuery && args.currentQuery.trim().length > 0) {
            try {
                relevantMessages = await ctx.runAction(api.messageEmbeddings.searchRelevantMessages, {
                    conversationId: args.conversationId,
                    query: args.currentQuery,
                    limit: maxRelevant,
                    excludeMessageIds: recentMessageIds,
                });
            } catch (error) {
                console.error("Error searching relevant messages:", error);
            }
        }

        // 3. Get conversation summary if exists
        const summary = await ctx.runQuery(api.messageEmbeddings.getConversationSummary, {
            conversationId: args.conversationId,
        });

        // 4. Combine messages: relevant older ones first (sorted by time), then recent ones
        const combinedMessages: Array<{
            messageId: Id<"messages">;
            content: string;
            whoSaid: "user" | "agent";
            createdAt: number;
            source: "recent" | "relevant";
        }> = [];

        // Add relevant older messages (sorted by createdAt ascending)
        const sortedRelevant = relevantMessages.sort((a, b) => a.createdAt - b.createdAt);
        for (const msg of sortedRelevant) {
            combinedMessages.push({
                messageId: msg.messageId,
                content: msg.content,
                whoSaid: msg.whoSaid,
                createdAt: msg.createdAt,
                source: "relevant",
            });
        }

        // Add recent messages (already in chronological order)
        for (const msg of recentMessages) {
            combinedMessages.push({
                messageId: msg._id,
                content: msg.message,
                whoSaid: msg.whoSaid,
                createdAt: msg.createdAt,
                source: "recent",
            });
        }

        return {
            messages: combinedMessages,
            summary: summary?.summary ?? null,
        };
    },
});

/**
 * Get conversation summary
 */
export const getConversationSummary = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("conversationSummaries")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .first();
    },
});

/**
 * Delete all message embeddings for a conversation
 */
export const deleteEmbeddingsByConversationId = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const embeddings = await ctx.db
            .query("messageEmbeddings")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        for (const embedding of embeddings) {
            await ctx.db.delete(embedding._id);
        }

        // Also delete conversation summary
        const summary = await ctx.db
            .query("conversationSummaries")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .first();

        if (summary) {
            await ctx.db.delete(summary._id);
        }

        return { success: true, deletedCount: embeddings.length };
    },
});

/**
 * Global search across all conversations for a user
 * Returns matching messages with conversation details
 */
export const globalSearchMessages = action({
    args: {
        userId: v.string(),
        query: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args): Promise<Array<{
        conversationId: Id<"conversations">;
        conversationTitle: string;
        conversationPublicId: string;
        messageId: Id<"messages">;
        messageContent: string;
        whoSaid: "user" | "agent";
        createdAt: number;
        score: number;
    }>> => {
        const searchLimit = args.limit ?? 10;

        if (!args.query || args.query.trim().length === 0) {
            return [];
        }

        // Get query embedding
        const queryEmbedding = await getEmbedding(args.query);

        // Vector search across all embeddings (no conversation filter)
        // Note: Convex vector search doesn't support userId filter directly,
        // so we'll fetch more and filter client-side
        const results = await ctx.vectorSearch("messageEmbeddings", "by_embedding", {
            vector: queryEmbedding,
            limit: searchLimit * 3, // Get extra to filter by user
        });

        if (results.length === 0) {
            return [];
        }

        // Fetch full embedding records
        const { api } = await import("./_generated/api");
        const embeddingIds = results.map(r => r._id);
        const embeddings = await ctx.runQuery(api.messageEmbeddings.getEmbeddingsByIds, {
            embeddingIds,
        });

        // Filter by userId and collect unique conversation IDs
        const userEmbeddings = embeddings.filter(e => e && e.userId === args.userId);
        const conversationIds = [...new Set(userEmbeddings.map(e => e?.conversationId).filter(Boolean))] as Id<"conversations">[];

        // Fetch conversation details
        const conversations = await ctx.runQuery(api.messageEmbeddings.getConversationsByIds, {
            conversationIds,
        });

        // Build result with conversation details
        const searchResults = results
            .map((result) => {
                const embedding = userEmbeddings.find(e => e && e._id === result._id);
                if (!embedding) return null;

                const conversation = conversations.find(c => c && c._id === embedding.conversationId);
                if (!conversation) return null;

                return {
                    conversationId: embedding.conversationId,
                    conversationTitle: conversation.title || "New conversation",
                    conversationPublicId: conversation.id, // Public UUID for navigation
                    messageId: embedding.messageId,
                    messageContent: embedding.content,
                    whoSaid: embedding.whoSaid,
                    createdAt: embedding.createdAt,
                    score: result._score,
                };
            })
            .filter((c): c is NonNullable<typeof c> => c !== null)
            .slice(0, searchLimit);

        return searchResults;
    },
});

/**
 * Get conversations by their IDs (for search results)
 */
export const getConversationsByIds = query({
    args: {
        conversationIds: v.array(v.id("conversations")),
    },
    handler: async (ctx, args) => {
        const results = await Promise.all(
            args.conversationIds.map(async (id) => await ctx.db.get(id))
        );
        return results.filter(Boolean);
    },
});
