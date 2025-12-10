import { WorkOSError, WorkOSErrorSchema } from '@/lib/schemas/ErrorSchema';
import { VerificationRequiredError, isVerificationRequiredError } from '@/lib/schemas/ErrorSchema';
import { AppError } from '@/lib/schemas/ErrorSchema';

/**
 * Type guard to check if an error is a WorkOS error
 */
export function isWorkOSError(error: unknown): error is WorkOSError {
    if (typeof error !== 'object' || error === null) {
        return false;
    }

    const result = WorkOSErrorSchema.safeParse(error);
    return result.success;
}

/**
 * Safely extract WorkOS error data
 */
export function extractWorkOSError(error: unknown): WorkOSError | null {
    if (isWorkOSError(error)) {
        return error;
    }

    // Try to parse as WorkOS error
    if (typeof error === 'object' && error !== null) {
        const result = WorkOSErrorSchema.safeParse(error);
        if (result.success) {
            return result.data;
        }
    }

    return null;
}

/**
 * Extract pending authentication token from WorkOS error
 * Checks multiple possible locations in the error object
 */
export function extractPendingAuthToken(error: unknown): string | null {
    const workosError = extractWorkOSError(error);
    if (workosError) {
        return (
            workosError.pending_authentication_token ||
            workosError.pendingAuthenticationToken ||
            null
        );
    }

    // Also check raw error object
    if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>;
        
        // Check direct properties
        if (typeof err.pending_authentication_token === 'string') {
            return err.pending_authentication_token;
        }
        if (typeof err.pendingAuthenticationToken === 'string') {
            return err.pendingAuthenticationToken;
        }

        // Check rawData
        if (err.rawData && typeof err.rawData === 'object' && err.rawData !== null) {
            const rawData = err.rawData as Record<string, unknown>;
            if (typeof rawData.pending_authentication_token === 'string') {
                return rawData.pending_authentication_token;
            }
        }
    }

    return null;
}

/**
 * Extract email from WorkOS error
 */
export function extractEmailFromError(error: unknown): string | null {
    const workosError = extractWorkOSError(error);
    if (workosError?.email) {
        return workosError.email;
    }

    if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>;
        if (typeof err.email === 'string') {
            return err.email;
        }
        if (err.rawData && typeof err.rawData === 'object' && err.rawData !== null) {
            const rawData = err.rawData as Record<string, unknown>;
            if (typeof rawData.email === 'string') {
                return rawData.email;
            }
        }
    }

    return null;
}

/**
 * Check if error requires email verification
 */
export function requiresEmailVerification(error: unknown): boolean {
    // Check if it's a VerificationRequiredError
    if (isVerificationRequiredError(error)) {
        return true;
    }

    // Check WorkOS error codes
    const workosError = extractWorkOSError(error);
    if (workosError) {
        return (
            workosError.code === 'email_verification_required' ||
            (workosError.status === 403 &&
                workosError.message?.includes('Email ownership must be verified')) ||
            (workosError.error === 'email_verification_required')
        );
    }

    // Check error message
    if (error instanceof Error) {
        return error.message.includes('Email ownership must be verified');
    }

    return false;
}

/**
 * Create a standardized API error
 */
export function createApiError(
    message: string,
    statusCode: number = 500,
    code?: string,
    originalError?: unknown
): AppError {
    return new AppError(message, statusCode, code, originalError);
}

/**
 * Handle WorkOS-specific errors and convert to application errors
 */
export function handleWorkOSError(error: unknown): AppError | VerificationRequiredError {
    // Check if verification is required
    if (requiresEmailVerification(error)) {
        const token = extractPendingAuthToken(error);
        const email = extractEmailFromError(error);

        if (token) {
            return new VerificationRequiredError(token, email || undefined);
        }
    }

    // Extract WorkOS error details
    const workosError = extractWorkOSError(error);

    if (workosError) {
        const message = workosError.message || workosError.errorDescription || 'WorkOS error occurred';
        const status = workosError.status || 500;
        const code = workosError.code || workosError.error;

        return createApiError(message, status, code, error);
    }

    // Fallback for unknown errors
    if (error instanceof Error) {
        return createApiError(error.message, 500, undefined, error);
    }

    return createApiError('An unexpected error occurred', 500, undefined, error);
}

/**
 * Get user-friendly error message from any error type
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof AppError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>;
        if (typeof err.message === 'string') {
            return err.message;
        }
        if (typeof err.error === 'string') {
            return err.error;
        }
    }

    return 'An unexpected error occurred';
}

// Re-export for convenience
export { isVerificationRequiredError } from '@/lib/schemas/ErrorSchema';



