import { Mistral } from "@mistralai/mistralai";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DEFAULT_MODEL, DEFAULT_SYSTEM_PROMPT } from "@/lib/mistralConfig";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Build the system prompt, incorporating custom personality if provided
function buildSystemPrompt(customPersonality?: string | null): string {
    if (!customPersonality || customPersonality.trim() === '') {
        return DEFAULT_SYSTEM_PROMPT;
    }

    // Append custom personality in a way that enhances rather than overrides
    return `${DEFAULT_SYSTEM_PROMPT}

## User Preferences
The user has requested the following personality customization. Incorporate these preferences naturally into your responses while maintaining your core guidelines and safety principles:

${customPersonality.trim()}`;
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
            // Continue with defaults if settings fetch fails
        }
    }

    // Fetch messages server-side from Convex
    const messages = await fetchQuery(api.messages.getAllMessagesByConversationId, {
        convoId: convoId as Id<"conversations">,
    });

    // Map to Mistral format
    const mistralMessages = messages.map((m) => ({
        role: m.whoSaid === "user" ? ("user" as const) : ("assistant" as const),
        content: m.message,
    }));

    // Build system prompt with custom personality
    const systemPrompt = buildSystemPrompt(customPersonality);

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
                // Stream the main response
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