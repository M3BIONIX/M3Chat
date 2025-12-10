import { Mistral } from "@mistralai/mistralai";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DEFAULT_MODEL, DEFAULT_SYSTEM_PROMPT } from "@/lib/mistralConfig";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export async function POST(req: Request) {
    const { convoId } = await req.json();

    if (!convoId) {
        return new Response(JSON.stringify({ error: "convoId is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
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

    // Stream from Mistral
    const result = await client.chat.stream({
        model: DEFAULT_MODEL,
        messages: [
            { role: "system", content: DEFAULT_SYSTEM_PROMPT },
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