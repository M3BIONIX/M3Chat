import {AttachedFileArray} from "@/lib/schemas/FileSchema";

export interface Chat {
    id: string;
    title: string;
    model: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
    isThread?: boolean;
    parentChatId?: string;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    files?: AttachedFileArray[];
}

export type LLMModel = 'gpt-4' | 'gpt-3.5' | 'claude-3' | 'claude-2' | 'gemini-pro' | 'llama-2';
