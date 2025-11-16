import {ConvexReactClient} from "convex/react";
import {Id} from "@/convex/_generated/dataModel";
import {api} from "@/convex/_generated/api";

export async function uploadFiles(
    file: File,
    convexClient: ConvexReactClient,
    conversationId: Id<"conversations">
): Promise<AttachedFile> {

    try {

        const uploadUrl = await convexClient.action(api.files.generateUploadUrl);

        const response = await fetch(uploadUrl, {
            method: "POST",
            headers: {"Content-Type": file.type},
            body: file
        })

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const {storageId} = await response.json();

        const fileRecord = await convexClient.mutation(api.files.uploadFiles, {
            storageId,
            conversationId,
            name: file.name,
            size: file.size,
            type: file.type
        });

        return {
            id: fileRecord.id,
            name: fileRecord.name,
            type: fileRecord.type,
            size: fileRecord.size,
            storageId: fileRecord.storageId,
            url: fileRecord.url || "",
            uploadedAt: fileRecord.uploadedAt
        };
    }

    catch (e) {
        throw new Error(`Upload failed: ${e}`);
    }
}