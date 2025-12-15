import { Mistral } from "@mistralai/mistralai";
import { fetchQuery, fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DEFAULT_MODEL, DEFAULT_SYSTEM_PROMPT } from "@/lib/mistralConfig";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Build the system prompt with optional file context and custom personality
function buildSystemPrompt(
    customPersonality?: string | null,
    fileContext?: string | null
): string {
    let prompt = DEFAULT_SYSTEM_PROMPT;

    // Add file context if available
    if (fileContext && fileContext.trim() !== '') {
        prompt += `\n\n## File Context\nThe following are relevant excerpts from files the user has uploaded. Use this context to answer questions about the files:\n\n${fileContext}`;
    }

    // Add custom personality if provided
    if (customPersonality && customPersonality.trim() !== '') {
        prompt += `\n\n## User Preferences\nThe user has requested the following personality customization. Incorporate these preferences naturally into your responses while maintaining your core guidelines and safety principles:\n\n${customPersonality.trim()}`;
    }

    return prompt;
}

export async function POST(req: Request) {
    const { convoId, userId } = await req.json();

    if (!convoId) {
        return new Response(JSON.stringify({ error: "convoId is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Fetch user settings if userId is provided
    let selectedModel = DEFAULT_MODEL;
    let customPersonality: string | null = null;

    if (userId) {
        try {
            const userSettings = await fetchQuery(api.userSettings.getUserSettings, { userId });
            if (userSettings) {
                selectedModel = userSettings.selectedModel || DEFAULT_MODEL;
                customPersonality = userSettings.customPersonality || null;
            }
        } catch (error) {
            console.error("Failed to fetch user settings:", error);
        }
    }

    // Fetch messages server-side from Convex
    const messages = await fetchQuery(api.messages.getAllMessagesByConversationId, {
        convoId: convoId as Id<"conversations">,
    });

    // Get the latest user message for RAG search
    const latestUserMessage = messages
        .filter(m => m.whoSaid === "user")
        .pop();

    // Search for relevant file chunks using vector similarity
    let fileContext: string | null = null;

    if (latestUserMessage) {
        try {
            const relevantChunks = await fetchAction(api.fileEmbeddings.searchRelevantChunks, {
                conversationId: convoId as Id<"conversations">,
                query: latestUserMessage.message
            });

            if (relevantChunks && relevantChunks.length > 0) {
                fileContext = relevantChunks
                    .map((chunk) => `[From ${chunk.fileName}]:\n${chunk.content}`)
                    .join('\n\n---\n\n');
            }
        } catch (error) {
            console.error("Error searching file chunks:", error);
        }
    }

    // Map messages to Mistral format (simplified - no file content appending)
    // <--Todo--> Change this to user messages embedding <--Todo-->
    const mistralMessages = messages.map((m) => ({
        role: m.whoSaid === "user" ? ("user" as const) : ("assistant" as const),
        content: m.message,
    }));

    // Build system prompt with file context
    const systemPrompt = buildSystemPrompt(customPersonality, fileContext);

    // Stream from Mistral
    const result = await client.chat.stream({
        model: selectedModel,
        messages: [
            { role: "system", content: systemPrompt },
            ...mistralMessages,
        ],
    });

    // Return as SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of result) {
                    const text = chunk.data.choices[0]?.delta?.content;
                    if (typeof text === "string") {
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                        );
                    }
                }

                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Stream error";
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
                );
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}