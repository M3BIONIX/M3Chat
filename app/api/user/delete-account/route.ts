import { NextRequest, NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";
import { createErrorResponse, createValidatedResponse } from "@/lib/utils/apiValidation";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID;
const workos = new WorkOS(process.env.WORKOS_API_KEY, { clientId });

export async function DELETE(request: NextRequest) {
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

        const userId = session.user.id;

        // 1. Delete all user data from Convex (conversations, messages, files, settings)
        await fetchMutation(api.userSettings.deleteAllUserData, { userId });

        // 2. Delete user from WorkOS
        await workos.userManagement.deleteUser(userId);

        // 3. Clear session cookie
        const response = NextResponse.json({
            success: true,
            message: 'Account deleted successfully',
        });

        response.cookies.delete('wos-session');

        return response;
    } catch (error) {
        console.error('Delete account error:', error);
        return createErrorResponse('Failed to delete account', 500);
    }
}
