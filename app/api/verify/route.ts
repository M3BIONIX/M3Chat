import { WorkOS } from "@workos-inc/node";
import { NextRequest } from "next/server";
import {VerifyCodeRequestSchema } from "@/lib/schemas/ApiSchema";
import {validateRequest, createValidatedResponse, createErrorResponse} from "@/lib/utils/apiValidation";
import {handleWorkOSError, getErrorMessage} from "@/lib/utils/errorHandling";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);
const workOsClientID = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID;

export async function POST(request: NextRequest) {
    try {
        // Validate request body
        const validation = await validateRequest(request, VerifyCodeRequestSchema);
        if (!validation.success) {
            return createErrorResponse(validation.error, validation.status);
        }

        const { code } = validation.data;

        if(!workOsClientID) {
            return createErrorResponse(
                'Server configuration error: WorkOS Client ID is missing',
                500,
                'CONFIG_ERROR'
            );
        }

        try {
            await workos.userManagement.authenticateWithCode({
                code,
                clientId: workOsClientID
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
            if (errorMessage.includes('invalid') || errorMessage.includes('incorrect')) {
                errorMessage = 'Invalid verification code. Please check and try again.';
            } else if (errorMessage.includes('expired')) {
                errorMessage = 'Verification code has expired. Please request a new one.';
            }

            return createErrorResponse(
                errorMessage,
                appError.statusCode,
                appError.code
            );
        }
    } catch (error) {
        console.error('Error verifying code:', error);
        const errorMessage = getErrorMessage(error);
        return createErrorResponse(
            errorMessage || 'Failed to verify code. Please try again.',
            500
        );
    }
}
