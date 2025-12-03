import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import {DEFAULT_MODEL, DEFAULT_SYSTEM_PROMPT} from "@/lib/mistralConfig";


export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[], convoId: string } = await req.json();

    const result = streamText({
        model: mistral(DEFAULT_MODEL),
        messages: convertToModelMessages(messages),
        system: DEFAULT_SYSTEM_PROMPT,
    });

    return result.toUIMessageStreamResponse();
}