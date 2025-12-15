import { query } from "@/convex/_generated/server";
import { v } from "convex/values";

const attachedFilesTable = "attachedFiles";

/**
 * Get file metadata (without full content) for display purposes
 */
export const getFilesByIds = query({
    args: {
        fileIds: v.array(v.id(attachedFilesTable))
    },
    handler: async (ctx, args) => {
        const files = await Promise.all(
            args.fileIds.map(async (fileId) => {
                const file = await ctx.db.get(fileId);
                if (!file) return null;

                const url = await ctx.storage.getUrl(file.storageId);

                return {
                    id: file.id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: url,
                    uploadedAt: file.uploadedAt,
                };
            })
        );

        return files.filter(Boolean);
    }
});
