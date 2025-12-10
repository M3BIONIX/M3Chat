import { query } from "@/convex/_generated/server";
import { v } from "convex/values";

const attachedFilesTable = "attachedFiles";

/**
 * Get file content as text for AI context
 * Currently supports TXT files directly, PDF would need additional processing
 */
export const getFileContent = query({
    args: {
        fileId: v.id(attachedFilesTable)
    },
    handler: async (ctx, args) => {
        const file = await ctx.db.get(args.fileId);

        if (!file) {
            return null;
        }

        try {
            // Get the file URL from storage
            const url = await ctx.storage.getUrl(file.storageId);

            if (!url) {
                return null;
            }

            // For text files, we can fetch the content
            // Note: This works for TXT files. PDF extraction would require additional libraries
            if (file.type === "application/txt") {
                const response = await fetch(url);
                const text = await response.text();
                return {
                    fileName: file.name,
                    fileType: file.type,
                    content: text,
                };
            }

            // For PDFs, we'll return metadata with a note that content extraction isn't implemented
            // This can be enhanced later with a PDF parsing library
            if (file.type === "application/pdf") {
                return {
                    fileName: file.name,
                    fileType: file.type,
                    content: "[PDF file - content extraction not yet implemented]",
                };
            }

            return null;
        } catch (error) {
            console.error("Error fetching file content:", error);
            return null;
        }
    }
});

/**
 * Get multiple file contents by IDs
 */
export const getMultipleFileContents = query({
    args: {
        fileIds: v.array(v.id(attachedFilesTable))
    },
    handler: async (ctx, args) => {
        const contents = await Promise.all(
            args.fileIds.map(async (fileId) => {
                const file = await ctx.db.get(fileId);
                if (!file) return null;

                const url = await ctx.storage.getUrl(file.storageId);
                if (!url) return null;

                try {
                    if (file.type === "application/txt") {
                        const response = await fetch(url);
                        const text = await response.text();
                        return {
                            fileName: file.name,
                            fileType: file.type,
                            content: text,
                        };
                    }

                    if (file.type === "application/pdf") {
                        return {
                            fileName: file.name,
                            fileType: file.type,
                            content: "[PDF file - content extraction not yet implemented]",
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching content for file ${file.name}:`, error);
                }

                return null;
            })
        );

        return contents.filter(Boolean);
    }
});
