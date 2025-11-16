import {AttachedFile, LLMModel} from "@/app/components/chat-input/Chat.interface";

export interface NewChatInterface {
    onStartChat: () => void;
    selectedModel: LLMModel;
    onModelChange: (model: LLMModel) => void;
    onSendMessage: (content: string, files?: AttachedFile[]) => void;
}