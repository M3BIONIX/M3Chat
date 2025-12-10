import { Mistral } from "@mistralai/mistralai";
import { DEFAULT_MODEL } from "@/lib/mistralConfig";
import { NextRequest } from "next/server";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const TITLE_GENERATION_PROMPT = `Generate a very short title (3-5 words max) for this conversation based on the user's message. 
Return ONLY the title, nothing else. No quotes, no punctuation at the end. Just the plain title text.`;

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const message = searchParams.get("message");

    if (!message) {
        return new Response(JSON.stringify({ error: "message is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const titleResult = await client.chat.complete({
            model: DEFAULT_MODEL,
            messages: [
                { role: "system", content: TITLE_GENERATION_PROMPT },
                { role: "user", content: message },
            ],
        });

        const title = titleResult.choices?.[0]?.message?.content;

        if (typeof title === "string" && title.trim()) {
            return new Response(JSON.stringify({ title: title.trim() }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ title: "New conversation" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Title generation error:", error);
        return new Response(JSON.stringify({ error: "Failed to generate title" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
