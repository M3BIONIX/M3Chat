import * as z from 'zod';

/**
 * Standard API error response schema
 */
export const ApiErrorResponseSchema = z.object({
    error: z.string(),
    message: z.string().optional(),
    status: z.number().optional(),
    code: z.string().optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

/**
 * WorkOS error structure schema
 * Based on WorkOS SDK error format
 */
export const WorkOSErrorSchema = z.object({
    message: z.string(),
    status: z.number().optional(),
    code: z.string().optional(),
    error: z.string().optional(),
    errorDescription: z.string().optional(),
    requestID: z.string().optional(),
    rawData: z.unknown().optional(),
    pending_authentication_token: z.string().optional(),
    pendingAuthenticationToken: z.string().optional(),
    email: z.string().optional(),
});

export type WorkOSError = z.infer<typeof WorkOSErrorSchema>;

/**
 * Verification required error response schema
 */
export const VerificationRequiredErrorSchema = z.object({
    requiresVerification: z.literal(true),
    pendingAuthenticationToken: z.string(),
    email: z.string().optional(),
    message: z.string().optional(),
});

export type VerificationRequiredErrorResponse = z.infer<typeof VerificationRequiredErrorSchema>;

/**
 * Base application error class
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code?: string;
    public readonly originalError?: unknown;

    constructor(
        message: string,
        statusCode: number = 500,
        code?: string,
        originalError?: unknown
    ) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.originalError = originalError;
        
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}

/**
 * Verification required error class
 * Used when email verification is required before authentication
 */
export class VerificationRequiredError extends AppError {
    public readonly pendingAuthenticationToken: string;
    public readonly email?: string;

    constructor(
        pendingAuthenticationToken: string,
        email?: string,
        message: string = 'VERIFICATION_REQUIRED'
    ) {
        super(message, 403, 'VERIFICATION_REQUIRED');
        this.name = 'VerificationRequiredError';
        this.pendingAuthenticationToken = pendingAuthenticationToken;
        this.email = email;
        
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, VerificationRequiredError);
        }
    }
}

/**
 * Type guard to check if an error is a VerificationRequiredError
 */
export function isVerificationRequiredError(
    error: unknown
): error is VerificationRequiredError {
    return (
        error instanceof VerificationRequiredError ||
        (error instanceof Error &&
            'pendingAuthenticationToken' in error &&
            typeof (error as { pendingAuthenticationToken: unknown }).pendingAuthenticationToken === 'string')
    );
}



