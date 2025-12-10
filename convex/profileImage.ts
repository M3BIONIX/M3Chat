import { v } from "convex/values";
import { action, query } from "@/convex/_generated/server";

// Maximum file size for profile images: 5MB
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Generate an upload URL for profile image upload
 * This is an action because it interacts with external storage
 */
export const generateProfileImageUploadUrl = action(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

/**
 * Get the public URL for an uploaded profile image
 */
export const getProfileImageUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});
