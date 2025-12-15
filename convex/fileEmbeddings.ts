import { action, query, mutation, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { Workpool } from "@convex-dev/workpool";

export const fileEmbeddingPool = new Workpool(components.fileEmbedding, {
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
 * Split text into sentence-based chunks with overlap
 */
function chunkText(text: string, tokensPerChunk: number = 300, overlapPct: number = 0.1): string[] {
    const charsPerChunk = tokensPerChunk * 4;
    const overlapChars = Math.floor(charsPerChunk * overlapPct);
    const chunks: string[] = [];
    let currentChunk = "";
    let overlapBuffer = "";

    // Split by sentence endings
    const sentences = text.split(/(?<=[.!?])\s+/);

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > charsPerChunk && currentChunk) {
            chunks.push(currentChunk.trim());
            // Keep last portion for overlap
            overlapBuffer = currentChunk.slice(-overlapChars);
            currentChunk = overlapBuffer + " " + sentence;
        } else {
            currentChunk += (currentChunk ? " " : "") + sentence;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks.filter(chunk => chunk.length > 0);
}

/**
 * Get embeddings from Mistral API
 */
async function getEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await fetch("https://api.mistral.ai/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
            model: "mistral-embed",
            input: texts,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Mistral Embeddings API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data.map((item: { embedding: number[] }) => item.embedding);
}

/**
 * Get embedding for a single text (for query embedding)
 */
async function getQueryEmbedding(text: string): Promise<number[]> {
    const embeddings = await getEmbeddings([text]);
    return embeddings[0];
}


/**
 * Internal: Get file metadata
 */
export const getFileMetadataInternal = internalQuery({
    args: {
        fileId: v.id("attachedFiles"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.fileId);
    },
});

/**
 * Internal: Get file URL from storage
 */
export const getFileUrlInternal = internalQuery({
    args: {
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});

/**
 * Internal: Store a chunk
 */
export const storeChunkInternal = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.string(),
        fileName: v.string(),
        fileId: v.id("attachedFiles"),
        chunkIndex: v.number(),
        content: v.string(),
        embedding: v.array(v.float64()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("fileChunks", {
            conversationId: args.conversationId,
            userId: args.userId,
            fileName: args.fileName,
            fileId: args.fileId,
            chunkIndex: args.chunkIndex,
            content: args.content,
            embedding: args.embedding,
        });
    },
});

/**
 * Internal: Update file status
 */
export const updateFileStatusInternal = internalMutation({
    args: {
        fileId: v.id("attachedFiles"),
        status: v.string(),
        totalChunks: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.fileId, {
            status: args.status,
            totalChunks: args.totalChunks,
        });
    },
});

/**
 * Get file content from storage (TXT files only)
 */
async function fetchTextFileContent(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    return await response.text();
}

/**
 * Parse PDF file by calling the Next.js API route
 * (pdf-parse requires Node.js environment, not Convex runtime)
 */
async function extractPdfText(url: string): Promise<string> {
    // Call the Next.js API route to extract PDF text
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL || 'http://localhost:3000';

    const response = await fetch(`${apiUrl}/api/extract-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`PDF extraction failed: ${error}`);
    }

    const data = await response.json();
    return data.text;
}

// ===== PUBLIC API =====

/**
 * Enqueue an embedding job in the WorkPool
 * This returns immediately - embedding runs in background
 */
export const enqueueEmbeddingJob = mutation({
    args: {
        fileId: v.id("attachedFiles"),
        conversationId: v.id("conversations"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        // Update status to "queued"
        await ctx.db.patch(args.fileId, { status: "queued" });

        // Enqueue the action in WorkPool
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
    },
});

/**
 * Get file status for reactive UI updates
 */
export const getFileStatus = query({
    args: {
        fileId: v.id("attachedFiles"),
    },
    handler: async (ctx, args) => {
        const file = await ctx.db.get(args.fileId);
        return file ? { status: file.status, name: file.name } : null;
    },
});

/**
 * Get statuses for multiple files (for batch checking)
 */
export const getFilesStatus = query({
    args: {
        fileIds: v.array(v.id("attachedFiles")),
    },
    handler: async (ctx, args) => {
        const results = await Promise.all(
            args.fileIds.map(async (fileId) => {
                const file = await ctx.db.get(fileId);
                return file ? {
                    fileId: fileId,
                    status: file.status || "pending",
                    name: file.name
                } : null;
            })
        );
        return results.filter(Boolean);
    },
});

/**
 * Internal action: Process file and create embeddings
 * Called by WorkPool in the background
 */
export const processFileEmbeddingsInternal = internalAction({
    args: {
        fileId: v.id("attachedFiles"),
        conversationId: v.id("conversations"),
        userId: v.string(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; fileName: string; chunksCreated: number }> => {
        // 1. Get file metadata
        const file = await ctx.runQuery(internal.fileEmbeddings.getFileMetadataInternal, {
            fileId: args.fileId,
        });

        if (!file) {
            throw new Error("File not found");
        }

        // 2. Update status to "embedding"
        await ctx.runMutation(internal.fileEmbeddings.updateFileStatusInternal, {
            fileId: args.fileId,
            status: "embedding",
        });

        try {
            // 3. Get file URL
            const url = await ctx.runQuery(internal.fileEmbeddings.getFileUrlInternal, {
                storageId: file.storageId,
            });

            if (!url) {
                throw new Error("Could not get file URL");
            }

            // 4. Get content based on file type
            let content: string;

            if (file.type === "application/pdf") {
                // PDF: Use pdf-parse to extract text
                content = await extractPdfText(url);
            } else {
                // TXT: Fetch directly from storage
                content = await fetchTextFileContent(url);
            }

            if (!content || content.trim().length === 0) {
                throw new Error("No content extracted from file");
            }

            // 5. Chunk the content with overlap
            const chunks = chunkText(content, 300, 0.1);

            if (chunks.length === 0) {
                throw new Error("No chunks created from content");
            }

            // 6. Get embeddings from Mistral (batch for efficiency)
            const batchSize = 25; // Mistral API batch limit
            const allEmbeddings: number[][] = [];

            for (let i = 0; i < chunks.length; i += batchSize) {
                const batch = chunks.slice(i, i + batchSize);
                const embeddings = await getEmbeddings(batch);
                allEmbeddings.push(...embeddings);
            }

            // 7. Store chunks with embeddings
            for (let i = 0; i < chunks.length; i++) {
                await ctx.runMutation(internal.fileEmbeddings.storeChunkInternal, {
                    conversationId: args.conversationId,
                    userId: args.userId,
                    fileName: file.name,
                    fileId: args.fileId,
                    chunkIndex: i,
                    content: chunks[i],
                    embedding: allEmbeddings[i],
                });
            }

            // 8. Update status to "embedded"
            await ctx.runMutation(internal.fileEmbeddings.updateFileStatusInternal, {
                fileId: args.fileId,
                status: "embedded",
                totalChunks: chunks.length,
            });

            return {
                success: true,
                fileName: file.name,
                chunksCreated: chunks.length,
            };
        } catch (error) {
            // Update status to "failed"
            await ctx.runMutation(internal.fileEmbeddings.updateFileStatusInternal, {
                fileId: args.fileId,
                status: "failed",
            });

            throw error;
        }
    },
});

// ===== Legacy public action (kept for backwards compatibility) =====

/**
 * @deprecated Use enqueueEmbeddingJob mutation instead
 */
export const processFileEmbeddings = action({
    args: {
        fileId: v.id("attachedFiles"),
        conversationId: v.id("conversations"),
        userId: v.string(),
        extractedText: v.optional(v.string()), // Legacy arg, no longer needed
    },
    handler: async (ctx, args): Promise<{ success: boolean; fileName: string; chunksCreated: number; message?: string }> => {
        // Forward to internal action
        return await ctx.runAction(internal.fileEmbeddings.processFileEmbeddingsInternal, {
            fileId: args.fileId,
            conversationId: args.conversationId,
            userId: args.userId,
        });
    },
});

// ===== Public queries for external access =====

/**
 * Get chunks by their IDs (for actions to use)
 */
export const getChunksByIds = query({
    args: {
        chunkIds: v.array(v.id("fileChunks")),
    },
    handler: async (ctx, args) => {
        const chunks = await Promise.all(
            args.chunkIds.map(async (id) => await ctx.db.get(id))
        );
        return chunks.filter(Boolean);
    },
});

/**
 * Search for relevant chunks using vector similarity
 */
export const searchRelevantChunks = action({
    args: {
        conversationId: v.id("conversations"),
        query: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args): Promise<Array<{
        fileName: string;
        content: string;
        chunkIndex: number;
        score: number;
    }>> => {
        const searchLimit = args.limit ?? 5;

        // 1. Get query embedding
        const queryEmbedding = await getQueryEmbedding(args.query);

        // 2. Vector search with conversation filter
        const results = await ctx.vectorSearch("fileChunks", "by_embedding", {
            vector: queryEmbedding,
            limit: searchLimit,
            filter: (q) => q.eq("conversationId", args.conversationId),
        });

        if (results.length === 0) {
            return [];
        }

        // 3. Fetch full chunk content using the public query
        // Note: We import api at runtime to avoid circular dependency
        const { api } = await import("./_generated/api");
        const chunkIds = results.map(r => r._id);
        const chunks = await ctx.runQuery(api.fileEmbeddings.getChunksByIds, {
            chunkIds,
        });

        // 4. Combine with scores
        return results.map((result) => {
            const chunk = chunks.find(c => c && c._id === result._id);
            if (!chunk) return null;
            return {
                fileName: chunk.fileName,
                content: chunk.content,
                chunkIndex: chunk.chunkIndex,
                score: result._score,
            };
        }).filter((c): c is NonNullable<typeof c> => c !== null);
    },
});

/**
 * Delete all file chunks/embeddings associated with a conversation
 */
export const deleteChunksByConversationId = mutation({
    args: {
        conversationId: v.id("conversations")
    },
    handler: async (ctx, args) => {
        const chunks = await ctx.db.query("fileChunks")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        for (const chunk of chunks) {
            await ctx.db.delete(chunk._id);
        }

        return { success: true, deletedCount: chunks.length };
    }
});
