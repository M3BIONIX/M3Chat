import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const attachedFilesTable = "attachedFiles";

/**
 * Extract text content from TXT or PDF files
 * This is an action (not a query) because it performs external fetch and file processing
 */
export const extractFileContent = action({
    args: {
        fileId: v.id(attachedFilesTable)
    },
    handler: async (ctx, args) => {
        // Get file metadata from database
        const file = await ctx.runQuery(api.files.getFileMetadata, {
            fileId: args.fileId
        });

        if (!file) {
            return null;
        }

        try {
            // Get the file URL from storage
            const url = await ctx.storage.getUrl(file.storageId);

            if (!url) {
                return null;
            }

            // Fetch the file content
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Failed to fetch file: ${response.statusText}`);
                return null;
            }

            // Extract content based on file type
            if (file.type === "application/txt" || file.type === "text/plain") {
                // For TXT files, read directly as text
                const text = await response.text();
                return {
                    fileName: file.name,
                    fileType: file.type,
                    content: text.trim(),
                };
            }

            if (file.type === "application/pdf") {
                // For PDF files, use pdf-parse
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Use require for pdf-parse as it's a CommonJS module
                const pdfParse = require("pdf-parse");
                const pdfData = await pdfParse(buffer);

                return {
                    fileName: file.name,
                    fileType: file.type,
                    content: pdfData.text.trim(),
                    pageCount: pdfData.numpages,
                };
            }

            // Unsupported file type
            return {
                fileName: file.name,
                fileType: file.type,
                content: "[Unsupported file type]",
            };
        } catch (error) {
            console.error("Error extracting file content:", error);
            return {
                fileName: file.name,
                fileType: file.type,
                content: `[Error extracting content: ${error instanceof Error ? error.message : 'Unknown error'}]`,
            };
        }
    }
});

/**
 * Extract content from multiple files
 */
export const extractMultipleFileContents = action({
    args: {
        fileIds: v.array(v.id(attachedFilesTable))
    },
    handler: async (ctx, args) => {
        const results = [];

        for (const fileId of args.fileIds) {
            // Get file metadata
            const file = await ctx.runQuery(api.files.getFileMetadata, {
                fileId: fileId
            });

            if (!file) {
                continue;
            }

            try {
                // Get the file URL from storage
                const url = await ctx.storage.getUrl(file.storageId);

                if (!url) {
                    continue;
                }

                // Fetch the file content
                const response = await fetch(url);

                if (!response.ok) {
                    console.error(`Failed to fetch file ${file.name}: ${response.statusText}`);
                    continue;
                }

                // Extract content based on file type
                if (file.type === "application/txt" || file.type === "text/plain") {
                    const text = await response.text();
                    results.push({
                        fileName: file.name,
                        fileType: file.type,
                        content: text.trim(),
                    });
                } else if (file.type === "application/pdf") {
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    // Use require for pdf-parse
                    const pdfParse = require("pdf-parse");
                    const pdfData = await pdfParse(buffer);

                    results.push({
                        fileName: file.name,
                        fileType: file.type,
                        content: pdfData.text.trim(),
                        pageCount: pdfData.numpages,
                    });
                }
            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
                results.push({
                    fileName: file.name,
                    fileType: file.type,
                    content: `[Error: ${error instanceof Error ? error.message : 'Unknown error'}]`,
                });
            }
        }

        return results;
    }
});
