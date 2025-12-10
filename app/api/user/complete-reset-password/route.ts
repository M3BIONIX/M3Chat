import { NextRequest } from "next/server";
import { WorkOS } from "@workos-inc/node";
import { createErrorResponse, createValidatedResponse } from "@/lib/utils/apiValidation";

const clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID;
const workos = new WorkOS(process.env.WORKOS_API_KEY, { clientId });

export async function POST(request: NextRequest) {
    try {
        const { token, newPassword } = await request.json();

        if (!token) {
            return createErrorResponse('Reset token is required', 400);
        }

        if (!newPassword || newPassword.length < 8) {
            return createErrorResponse('Password must be at least 8 characters', 400);
        }

        // Complete password reset via WorkOS
        await workos.userManagement.resetPassword({
            token,
            newPassword,
        });

        return createValidatedResponse({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.error('Complete password reset error:', error);

        // Handle specific WorkOS errors
        if (error instanceof Error) {
            if (error.message.includes('expired')) {
                return createErrorResponse('Reset link has expired. Please request a new one.', 400);
            }
            if (error.message.includes('invalid')) {
                return createErrorResponse('Invalid reset link. Please request a new one.', 400);
            }
        }

        return createErrorResponse('Failed to reset password', 500);
    }
}
