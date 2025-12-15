import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { ConvexReactClient } from "convex/react";

// Types for file input
interface AttachedFile {
    _id: string | Id<"attachedFiles">;
    // Add other fields as needed
}

// Return type for suggestion/send actions
export interface ChatActionResult {
    convoId: Id<"conversations">;
    publicId: string;
    fileIds: Id<"attachedFiles">[];
}

/**
 * Process a suggestion click or direct message send.
 * Creates a conversation if needed, links attached files, and returns state values.
 * 
 * @param convex - Convex client
 * @param userId - Current user ID
 * @param attachedFiles - Array of files attached to the message
 * @param existingConvoId - Existing conversation ID (if any)
 * @param createConversation - Function to create a new conversation
 * 
 * @returns Object containing convoId, publicId, fileIds for state updates
 */
export async function processMessageAction(
    convex: ConvexReactClient,
    userId: string,
    attachedFiles: AttachedFile[],
    existingConvoId: Id<"conversations"> | undefined,
    createConversation: (userId: string) => Promise<{ _id: Id<"conversations">; publicId: string }>
): Promise<ChatActionResult> {
    let convoId: Id<"conversations">;
    let publicId: string;

    // Create conversation if not exists
    if (existingConvoId) {
        convoId = existingConvoId;
        publicId = "";
    } else {
        const result = await createConversation(userId);
        convoId = result._id;
        publicId = result.publicId;
    }

    // Link attached files to the conversation
    const fileIds: Id<"attachedFiles">[] = [];
    for (const file of attachedFiles) {
        await convex.mutation(api.files.linkFileToConversation, {
            fileId: file._id as Id<"attachedFiles">,
            conversationId: convoId,
            userId: userId,
        });
        fileIds.push(file._id as Id<"attachedFiles">);
    }

    return { convoId, publicId, fileIds };
}

/**
 * Process a suggestion click action.
 * Creates a new conversation, links files, updates URL.
 * 
 * @param convex - Convex client
 * @param userId - Current user ID
 * @param attachedFiles - Array of files attached
 * @param createConversation - Function to create a new conversation
 * 
 * @returns Object containing convoId, publicId, fileIds for state updates
 */
export async function processSuggestionAction(
    convex: ConvexReactClient,
    userId: string,
    attachedFiles: AttachedFile[],
    createConversation: (userId: string) => Promise<{ _id: Id<"conversations">; publicId: string }>
): Promise<ChatActionResult> {
    // For suggestions, we always create a new conversation
    return processMessageAction(
        convex,
        userId,
        attachedFiles,
        undefined,
        createConversation
    );
}

/**
 * Process a send click action.
 * Creates a conversation if needed, links files.
 * 
 * @param convex - Convex client
 * @param userId - Current user ID
 * @param attachedFiles - Array of files attached
 * @param existingConvoId - Existing conversation ID (if continuing a chat)
 * @param createConversation - Function to create a new conversation
 * 
 * @returns Object containing convoId, publicId, fileIds, isNew for state updates
 */
export async function processSendAction(
    convex: ConvexReactClient,
    userId: string,
    attachedFiles: AttachedFile[],
    existingConvoId: Id<"conversations"> | undefined,
    createConversation: (userId: string) => Promise<{ _id: Id<"conversations">; publicId: string }>
): Promise<ChatActionResult & { isNew: boolean }> {
    const isNew = !existingConvoId;
    const result = await processMessageAction(
        convex,
        userId,
        attachedFiles,
        existingConvoId,
        createConversation
    );

    return { ...result, isNew };
}
