import { WorkOS } from "@workos-inc/node";
import { NextRequest } from "next/server";
import {SendCodeRequestSchema } from "@/lib/schemas/ApiSchema";
import {validateRequest, createValidatedResponse, createErrorResponse} from "@/lib/utils/apiValidation";
import {handleWorkOSError, getErrorMessage} from "@/lib/utils/errorHandling";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        // Validate request body
        const validation = await validateRequest(request, SendCodeRequestSchema);
        if (!validation.success) {
            return createErrorResponse(validation.error, validation.status);
        }

        const { email } = validation.data;

        try {
            await workos.userManagement.createMagicAuth({
                email,
            });

            const response = {
                success: true,
                message: 'Verification code sent to your email'
            };

            return createValidatedResponse(response);
        } catch (error) {
            const appError = handleWorkOSError(error);
            let errorMessage = getErrorMessage(appError);
            
            // Extract user-friendly error message
            if (errorMessage.includes('invalid') || errorMessage.includes('format')) {
                errorMessage = 'Invalid email address. Please check and try again.';
            } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
                errorMessage = 'Too many requests. Please wait a moment before requesting another code.';
            }

            return createErrorResponse(
                errorMessage,
                appError.statusCode,
                appError.code
            );
        }
    } catch (error) {
        console.error('Error sending magic auth code:', error);
        const errorMessage = getErrorMessage(error);
        return createErrorResponse(
            errorMessage || 'Failed to send verification code. Please try again.',
            500
        );
    }
}
