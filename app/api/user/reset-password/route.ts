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

        // Send password reset email via WorkOS
        // The passwordResetUrl is where users will be redirected after clicking the reset link
        const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        await workos.userManagement.sendPasswordResetEmail({
            email: session.user.email,
            passwordResetUrl: `${baseUrl}/auth/reset-password`,
        });

        return createValidatedResponse({
            success: true,
            message: 'Password reset email sent. Please check your inbox.',
        });
    } catch (error) {
        console.error('Password reset error:', error);
        return createErrorResponse('Failed to send password reset email', 500);
    }
}
