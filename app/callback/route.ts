import { WorkOS } from "@workos-inc/node";
import { NextRequest, NextResponse } from "next/server";
import { handleWorkOSError, getErrorMessage } from "@/lib/utils/errorHandling";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);
const clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID!;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        // Handle OAuth errors
        if (error) {
            console.error('OAuth error:', error);
            return NextResponse.redirect(
                new URL(`/auth?error=${encodeURIComponent(error)}`, request.url)
            );
        }

        // Validate code is present
        if (!code) {
            console.error('No code parameter in callback');
            return NextResponse.redirect(
                new URL('/auth?error=missing_code', request.url)
            );
        }

        if (!clientId) {
            console.error('WorkOS Client ID not configured');
            return NextResponse.redirect(
                new URL('/auth?error=configuration_error', request.url)
            );
        }

        if (!process.env.WORKOS_COOKIE_PASSWORD) {
            console.error('WORKOS_COOKIE_PASSWORD not configured');
            return NextResponse.redirect(
                new URL('/auth?error=configuration_error', request.url)
            );
        }

        try {
            // Exchange the code for user profile and access token
            const { profile } = await workos.sso.getProfileAndToken({
                code,
                clientId,
            });

            // Get or create the user
            let user;
            try {
                // Try to get the user by their email
                const users = await workos.userManagement.listUsers({
                    email: profile.email,
                });

                if (users.data && users.data.length > 0) {
                    user = users.data[0];
                } else {
                    // Create a new user if they don't exist
                    user = await workos.userManagement.createUser({
                        email: profile.email,
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        emailVerified: true, // SSO users are email verified
                    });
                }
            } catch (userError) {
                console.error('Error getting/creating user:', userError);
                return NextResponse.redirect(
                    new URL('/auth?error=user_creation_failed', request.url)
                );
            }

            // Create a session for the user
            const { sealedSession } = await workos.userManagement.createSession({
                clientId,
                userId: user.id,
                session: {
                    sealSession: true,
                    cookiePassword: process.env.WORKOS_COOKIE_PASSWORD,
                },
            });

            if (!sealedSession) {
                console.error('Failed to create sealed session');
                return NextResponse.redirect(
                    new URL('/auth?error=session_creation_failed', request.url)
                );
            }

            // Create redirect response to chat page
            const redirectResponse = NextResponse.redirect(
                new URL('/chat', request.url)
            );

            // Set the session cookie
            redirectResponse.cookies.set('wos-session', sealedSession, {
                path: '/',
                httpOnly: true,
                secure: process.env.ENVIRONMENT === 'PRODUCTION',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
            });

            return redirectResponse;
        } catch (error) {
            console.error('SSO callback error:', error);
            const appError = handleWorkOSError(error);
            const errorMessage = getErrorMessage(appError);

            return NextResponse.redirect(
                new URL(`/auth?error=${encodeURIComponent(errorMessage)}`, request.url)
            );
        }
    } catch (error) {
        console.error('Callback route error:', error);
        const errorMessage = getErrorMessage(error);
        return NextResponse.redirect(
            new URL(`/auth?error=${encodeURIComponent(errorMessage)}`, request.url)
        );
    }
}

