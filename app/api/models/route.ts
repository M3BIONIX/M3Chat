import { Mistral } from "@mistralai/mistralai";
import { NextResponse } from "next/server";
import { AVAILABLE_MODELS } from "@/lib/mistralConfig";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Model types that support chat completions
const CHAT_CAPABLE_TYPES = ["base", "chat", "code"];

// Models to exclude (embedding, moderation, etc.)
const EXCLUDED_PREFIXES = ["mistral-embed", "mistral-moderation"];

export interface MistralModel {
    id: string;
    name: string;
    description: string;
}

export async function GET() {
    try {
        const result = await client.models.list();

        if (!result?.data) {
            // Return fallback models if API doesn't return data
            return NextResponse.json({ models: AVAILABLE_MODELS });
        }

        // Filter and transform models
        const models: MistralModel[] = result.data
            .filter((model) => {
                // Exclude embedding and moderation models
                const isExcluded = EXCLUDED_PREFIXES.some(prefix =>
                    model.id.toLowerCase().startsWith(prefix)
                );
                if (isExcluded) return false;

                // Include models with chat-capable types or no type specified
                const modelType = (model as { type?: string }).type?.toLowerCase();
                if (!modelType) return true; // Include if no type specified
                return CHAT_CAPABLE_TYPES.some(type => modelType.includes(type));
            })
            .map((model) => ({
                id: model.id,
                name: formatModelName(model.id),
                description: getModelDescription(model.id),
            }))
            .sort((a, b) => {
                // Sort by preference: large first, then medium, then small, then others
                const order = ["large", "medium", "small", "codestral", "ministral", "pixtral"];
                const aIndex = order.findIndex(o => a.id.toLowerCase().includes(o));
                const bIndex = order.findIndex(o => b.id.toLowerCase().includes(o));
                if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;
                return aIndex - bIndex;
            });

        return NextResponse.json({ models });
    } catch (error) {
        console.error("Failed to fetch Mistral models:", error);
        // Return fallback models on error
        return NextResponse.json({ models: AVAILABLE_MODELS });
    }
}

/**
 * Format model ID into a human-readable name
 */
function formatModelName(modelId: string): string {
    // Remove version suffixes like -latest, -2024-xx-xx
    let name = modelId
        .replace(/-latest$/i, "")
        .replace(/-\d{4}-\d{2}-\d{2}$/i, "")
        .replace(/-\d{4}$/i, "");

    // Capitalize and format
    return name
        .split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

/**
 * Get a description for a model based on its ID
 */
function getModelDescription(modelId: string): string {
    const id = modelId.toLowerCase();

    if (id.includes("large")) {
        return "Most capable, best for complex tasks";
    }
    if (id.includes("medium")) {
        return "Balanced performance and cost";
    }
    if (id.includes("small")) {
        return "Fast, cost-effective for simple tasks";
    }
    if (id.includes("codestral")) {
        return "Optimized for code generation";
    }
    if (id.includes("ministral")) {
        return "Compact model for edge deployments";
    }
    if (id.includes("pixtral")) {
        return "Multimodal vision-language model";
    }
    if (id.includes("nemo")) {
        return "Efficient model for various tasks";
    }
    if (id.includes("open")) {
        return "Open-weight model";
    }

    return "Mistral AI model";
}
