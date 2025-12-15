import { ConvexReactClient } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type FileStatus = "pending" | "queued" | "embedding" | "embedded" | "failed";

interface FileStatusResult {
    fileId: Id<"attachedFiles">;
    status: FileStatus;
    name: string;
}

/**
 * Wait for all files to finish embedding using Convex's reactive subscriptions.
 * Returns a Promise that resolves when all files have status "embedded" or "failed".
 * 
 * Uses Convex's watchQuery functionality instead of setTimeout polling.
 */
export async function waitForEmbeddings(
    convex: ConvexReactClient,
    fileIds: string[]
): Promise<{ allEmbedded: boolean; failed: string[] }> {
    if (fileIds.length === 0) {
        return { allEmbedded: true, failed: [] };
    }

    const typedFileIds = fileIds as Id<"attachedFiles">[];

    return new Promise((resolve) => {
        // Use Convex's watchQuery for reactive updates
        const watch = convex.watchQuery(
            api.fileEmbeddings.getFilesStatus,
            { fileIds: typedFileIds }
        );

        const checkStatus = () => {
            const statuses = watch.localQueryResult();

            if (!statuses || statuses.length === 0) {
                return false; // Not ready yet
            }

            const results = statuses as FileStatusResult[];
            const allDone = results.every(
                (r) => r.status === "embedded" || r.status === "failed"
            );

            if (allDone) {
                const failed = results
                    .filter((r) => r.status === "failed")
                    .map((r) => r.name);
                resolve({ allEmbedded: failed.length === 0, failed });
                return true;
            }

            return false;
        };

        // Check immediately in case already done
        if (checkStatus()) {
            return;
        }

        // Subscribe to updates
        const unsubscribe = watch.onUpdate(() => {
            if (checkStatus()) {
                unsubscribe();
            }
        });
    });
}
