import { WorkOS } from "@workos-inc/node";
import {NextRequest} from "next/server";
import {CreateUserRequestSchema} from "@/lib/schemas/ApiSchema";
import {UserSchema} from "@/lib/schemas/AuthSchema";
import {validateRequest, createValidatedResponse, createErrorResponse} from "@/lib/utils/apiValidation";
import {handleWorkOSError, getErrorMessage} from "@/lib/utils/errorHandling";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        // Validate request body
        const validation = await validateRequest(request, CreateUserRequestSchema);
        if (!validation.success) {
            return createErrorResponse(validation.error, validation.status);
        }

        const { email, password, firstName, lastName } = validation.data;

        try {
            const createdUser = await workos.userManagement.createUser({
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName
            });

            // Validate and format user response
            const userResponse: UserSchema = {
                id: createdUser.id || '',
                email: createdUser.email || '',
                firstName: createdUser.firstName || '',
                lastName: createdUser.lastName || 'null',
                profilePicture: createdUser.profilePictureUrl || '',
                emailVerified: createdUser.emailVerified || false,
            };

            return createValidatedResponse(userResponse);
        } catch (error) {
            const appError = handleWorkOSError(error);
            let errorMessage = getErrorMessage(appError);
            
            // Extract user-friendly error message
            if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
                errorMessage = 'An account with this email already exists.';
            } else if (errorMessage.includes('invalid') || errorMessage.includes('format')) {
                errorMessage = 'Please check that all fields are filled correctly.';
            } else if (errorMessage.includes('password')) {
                errorMessage = 'Password does not meet requirements.';
            }

            return createErrorResponse(
                errorMessage,
                appError.statusCode,
                appError.code
            );
        }
    } catch (error) {
        console.error('Create user error:', error);
        const errorMessage = getErrorMessage(error);
        return createErrorResponse(
            errorMessage || 'Failed to create account. Please try again.',
            500
        );
    }
}
