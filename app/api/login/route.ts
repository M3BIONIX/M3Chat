import { WorkOS } from "@workos-inc/node";
import { NextRequest, NextResponse } from "next/server";

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID; // Use server-side env var

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, code, pendingAuthenticationToken } = body;

        if(!clientId) {
            return NextResponse.json(
                { error: 'Server configuration error: WorkOS Client ID is missing' },
                { status: 500 }
            );
        }

        // If code and token are provided, verify email (NO email/password needed)
        if (code && pendingAuthenticationToken) {
            const { user } = await workos.userManagement.authenticateWithEmailVerification({
                clientId,
                pendingAuthenticationToken,
                code,
            });

            return NextResponse.json({
                externalId: user.externalId || '',
                email: user.email || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                profilePicture: user.profilePictureUrl || '',
                emailVerified: user.emailVerified || false,
            });
        }

        // Try password authentication
        const result = await workos.userManagement.authenticateWithPassword({
            clientId,
            email,
            password,
        });

        return NextResponse.json({
            externalId: result.user.externalId || '',
            email: result.user.email || '',
            firstName: result.user.firstName || '',
            lastName: result.user.lastName || '',
            profilePicture: result.user.profilePictureUrl || '',
            emailVerified: result.user.emailVerified || false,
        });
    } catch (error: any) {
        console.error('Login error:', error);
        
        // Check if error requires email verification
        if (error.code === 'email_verification_required' || 
            (error.status === 403 && error.message?.includes('Email ownership must be verified'))) {
            
            // Extract token from error - check multiple possible locations
            const pendingAuthenticationToken = error.pending_authentication_token || 
                                               error.pendingAuthenticationToken ||
                                               error.rawData?.pending_authentication_token ||
                                               (error.rawData && typeof error.rawData === 'object' && error.rawData.pending_authentication_token);
            
            const email = error.email || error.rawData?.email;
            
            if (pendingAuthenticationToken) {
                return NextResponse.json(
                    { 
                        requiresVerification: true,
                        pendingAuthenticationToken,
                        email,
                        message: 'Please check your email for a verification code'
                    },
                    { status: 200 } // Return 200 but with flag
                );
            }
        }

        // Extract user-friendly error message
        let errorMessage = 'Failed to login. Please try again.';
        
        if (error.message) {
            if (error.message.includes('Invalid credentials') || error.message.includes('incorrect')) {
                errorMessage = 'Invalid email or password. Please check your credentials.';
            } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
                errorMessage = 'No account found with this email address.';
            } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
                errorMessage = 'Too many login attempts. Please try again later.';
            } else {
                errorMessage = error.message;
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: error.status || 500 }
        );
    }
}