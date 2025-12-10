import { NextRequest } from "next/server";
import { WorkOS } from "@workos-inc/node";
import { UserSchema } from "@/lib/schemas/AuthSchema";
import { createValidatedResponse, createErrorResponse } from "@/lib/utils/apiValidation";
import { getErrorMessage } from "@/lib/utils/errorHandling";

const clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID;
const workos = new WorkOS(process.env.WORKOS_API_KEY, {
    clientId,
});

export async function GET(request: NextRequest) {
    try {
        const sealedSession = request.cookies.get('wos-session')?.value;

        if (!sealedSession || !process.env.WORKOS_COOKIE_PASSWORD) {
            return createErrorResponse('No session found', 401);
        }

        try {
            // Unseal the session to get user ID
            const us = workos.userManagement.loadSealedSession({
                sessionData: sealedSession,
                cookiePassword: process.env.WORKOS_COOKIE_PASSWORD,
            });

            const session = await us.authenticate();

            if (!session.authenticated) {
                return createErrorResponse('Invalid session', 401);
            }

            // IMPORTANT: Fetch fresh user data from WorkOS to get updated metadata
            // The session.user object is cached and doesn't reflect recent metadata updates
            const freshUser = await workos.userManagement.getUser(session.user.id);

            // Validate and format user response
            const userResponse: UserSchema = {
                id: freshUser.id || '',
                email: freshUser.email || '',
                firstName: freshUser.firstName || '',
                lastName: freshUser.lastName || '',
                profilePicture: freshUser.metadata?.profilePictureUrl as string || freshUser.profilePictureUrl || '',
                emailVerified: freshUser.emailVerified || false,
            };

            return createValidatedResponse(userResponse);
        } catch (error) {
            console.error('Session authentication error:', error);
            return createErrorResponse(
                'Invalid session',
                401
            );
        }
    } catch (error) {
        console.error('Get user error:', error);
        const errorMessage = getErrorMessage(error);
        return createErrorResponse(
            errorMessage || 'Failed to get user',
            401
        );
    }
}
