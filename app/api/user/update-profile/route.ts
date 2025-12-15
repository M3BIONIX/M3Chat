import { NextRequest } from "next/server";
import { WorkOS } from "@workos-inc/node";
import { createErrorResponse, createValidatedResponse } from "@/lib/utils/apiValidation";

const clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID;
const workos = new WorkOS(process.env.WORKOS_API_KEY, { clientId });

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

        const { firstName, lastName } = await request.json();

        // Update user in WorkOS
        const updatedUser = await workos.userManagement.updateUser({
            userId: session.user.id,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
        });

        return createValidatedResponse({
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            emailVerified: updatedUser.emailVerified,
            profilePicture: updatedUser.metadata?.profilePictureUrl as string || updatedUser.profilePictureUrl || '',
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return createErrorResponse('Failed to update profile', 500);
    }
}
