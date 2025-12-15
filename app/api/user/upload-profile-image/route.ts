import { NextRequest } from "next/server";
import { WorkOS } from "@workos-inc/node";
import { createErrorResponse, createValidatedResponse } from "@/lib/utils/apiValidation";

const clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID;
const workos = new WorkOS(process.env.WORKOS_API_KEY, { clientId });

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest) {
    try {
        const sealedSession = request.cookies.get('wos-session')?.value;

        if (!sealedSession || !process.env.WORKOS_COOKIE_PASSWORD) {
            return createErrorResponse('No session found', 401);
        }

        // Verify session
        const us = workos.userManagement.loadSealedSession({
            sessionData: sealedSession,
            cookiePassword: process.env.WORKOS_COOKIE_PASSWORD,
        });

        const session = await us.authenticate();

        if (!session.authenticated) {
            return createErrorResponse('Invalid session', 401);
        }

        // Get image URL from request body
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return createErrorResponse('Image URL is required', 400);
        }

        // Update user profile in WorkOS using metadata field
        // WorkOS doesn't support profilePictureUrl in updateUser, so we use metadata
        // Important: Preserve existing metadata by spreading it
        const updatedUser = await workos.userManagement.updateUser({
            userId: session.user.id,
            metadata: {
                ...session.user.metadata,
                profilePictureUrl: imageUrl,
            },
        });

        return createValidatedResponse({
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            emailVerified: updatedUser.emailVerified,
            profilePicture: updatedUser.metadata?.profilePictureUrl as string || null,
        });
    } catch (error) {
        console.error('Upload profile image error:', error);
        return createErrorResponse('Failed to upload profile image', 500);
    }
}
