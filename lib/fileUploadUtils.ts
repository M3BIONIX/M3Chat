import {ConvexReactClient} from "convex/react";
import {api} from "@/convex/_generated/api";
import {AttachedFile} from "@/lib/schemas/FileSchema";

export async function uploadFiles(
    file: File,
    convexClient: ConvexReactClient
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
            name: file.name,
            size: file.size,
            type: file.type
        });

        if (!fileRecord) {
            throw new Error("Failed to retrieve uploaded file record from database");
        }

        return {
            id: fileRecord.id,
            name: fileRecord.name,
            type: fileRecord.type,
            size: fileRecord.size,
            storageId: fileRecord.storageId,
            uploadedAt: fileRecord.uploadedAt
        };
    }

    catch (e) {
        throw new Error(`Upload failed: ${e}`);
    }
}