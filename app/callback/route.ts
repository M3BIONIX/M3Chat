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
            // Use authenticateWithCode to exchange the authorization code for user and session
            // This is the proper method for SSO/OAuth callbacks and returns a sealed session
            const { user, sealedSession } = await workos.userManagement.authenticateWithCode({
                clientId,
                code,
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

            console.log('SSO login successful for user:', user.email);
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

