import {WorkOS} from "@workos-inc/node";
import {NextRequest, NextResponse} from "next/server";
import {LoginRequestSchema, LoginResponseSchema} from "@/lib/schemas/ApiSchema";
import {UserSchema} from "@/lib/schemas/AuthSchema";
import {validateRequest, createValidatedResponse, createErrorResponse} from "@/lib/utils/apiValidation";
import {handleWorkOSError, requiresEmailVerification, extractPendingAuthToken, extractEmailFromError} from "@/lib/utils/errorHandling";
import {getErrorMessage} from "@/lib/utils/errorHandling";

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID;

export async function POST(request: NextRequest) {
    try {
        // Validate request body
        const validation = await validateRequest(request, LoginRequestSchema);
        if (!validation.success) {
            return createErrorResponse(validation.error, validation.status);
        }

        const { email, password, code, pendingAuthenticationToken } = validation.data;

        if(!clientId) {
            return createErrorResponse(
                'Server configuration error: WorkOS Client ID is missing',
                500,
                'CONFIG_ERROR'
            );
        }

        // If code and token are provided, verify email (NO email/password needed)
        if (code && pendingAuthenticationToken) {
            try {
                const { user, sealedSession } = await workos.userManagement.authenticateWithEmailVerification({
                    clientId,
                    pendingAuthenticationToken,
                    code,
                    session: {
                        sealSession: true,
                        cookiePassword: process.env.WORKOS_COOKIE_PASSWORD,
                    }
                });

                if (!sealedSession) {
                    return createErrorResponse('Failed to create session', 500);
                }

                // Validate and format user response
                const userResponse: UserSchema = {
                    externalId: user.externalId || '',
                    email: user.email || '',
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    profilePicture: user.profilePictureUrl || '',
                    emailVerified: user.emailVerified || false,
                };

                const response = createValidatedResponse(userResponse);
                response.cookies.set('wos-session', sealedSession, {
                    path: '/',
                    httpOnly: true,
                    secure: process.env.ENVIRONMENT === 'PRODUCTION',
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000
                });

                return response;
            } catch (error) {
                const appError = handleWorkOSError(error);
                return createErrorResponse(
                    getErrorMessage(appError),
                    appError.statusCode,
                    appError.code
                );
            }
        }

        // Validate email and password are provided for password authentication
        if (!email || !password) {
            return createErrorResponse(
                'Email and password are required for login',
                400,
                'VALIDATION_ERROR'
            );
        }

        // Try password authentication
        try {
            const { user, sealedSession } = await workos.userManagement.authenticateWithPassword({
                clientId,
                email,
                password,
                session: {
                    sealSession: true,
                    cookiePassword: process.env.WORKOS_COOKIE_PASSWORD,
                }
            });

            if (!sealedSession) {
                return createErrorResponse('Failed to create session', 500);
            }

            // Validate and format user response
            const userResponse: UserSchema = {
                externalId: user.externalId || '',
                email: user.email || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                profilePicture: user.profilePictureUrl || '',
                emailVerified: user.emailVerified || false,
            };

            const response = createValidatedResponse(userResponse);
            response.cookies.set('wos-session', sealedSession, {
                path: '/',
                httpOnly: true,
                secure: process.env.ENVIRONMENT === 'PRODUCTION',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });

            return response;
        } catch (error) {
            // Check if error requires email verification
            if (requiresEmailVerification(error)) {
                const token = extractPendingAuthToken(error);
                const emailFromError = extractEmailFromError(error);

                if (token) {
                    return NextResponse.json(
                        {
                            requiresVerification: true,
                            pendingAuthenticationToken: token,
                            email: emailFromError || email,
                            message: 'Please check your email for a verification code'
                        },
                        { status: 200 }
                    );
                }
            }

            // Handle other WorkOS errors
            const appError = handleWorkOSError(error);
            
            // Extract user-friendly error message
            let errorMessage = getErrorMessage(appError);
            
            if (errorMessage.includes('Invalid credentials') || errorMessage.includes('incorrect')) {
                errorMessage = 'Invalid email or password. Please check your credentials.';
            } else if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
                errorMessage = 'No account found with this email address.';
            } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
                errorMessage = 'Too many login attempts. Please try again later.';
            }

            return createErrorResponse(
                errorMessage,
                appError.statusCode,
                appError.code
            );
        }
    } catch (error) {
        console.error('Login error:', error);
        const errorMessage = getErrorMessage(error);
        return createErrorResponse(
            errorMessage || 'Failed to login. Please try again.',
            500
        );
    }
}
