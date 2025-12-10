import { z, ZodSchema, ZodError } from 'zod';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Type-safe JSON parsing with error handling
 */
export function safeJsonParse<T = unknown>(json: string): { success: true; data: T } | { success: false; error: string } {
    try {
        const data = JSON.parse(json) as T;
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Invalid JSON',
        };
    }
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequest<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string; status: number }> {
    try {
        const body = await request.json();
        const result = schema.safeParse(body);

        if (!result.success) {
            const errors = result.error.errors.map((err) => {
                const path = err.path.join('.');
                return `${path}: ${err.message}`;
            });
            return {
                success: false,
                error: `Validation failed: ${errors.join(', ')}`,
                status: 400,
            };
        }

        return { success: true, data: result.data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Invalid request body',
            status: 400,
        };
    }
}

/**
 * Validate response data with Zod schema
 */
export function validateResponse<T>(
    data: unknown,
    schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(data);

    if (!result.success) {
        const errors = result.error.errors.map((err) => {
            const path = err.path.join('.');
            return `${path}: ${err.message}`;
        });
        return {
            success: false,
            error: `Response validation failed: ${errors.join(', ')}`,
        };
    }

    return { success: true, data: result.data };
}

/**
 * Create a validated JSON response
 */
export function createValidatedResponse<T>(
    data: T,
    status: number = 200
): NextResponse<T> {
    return NextResponse.json(data, { status });
}

/**
 * Create an error response
 */
export function createErrorResponse(
    error: string,
    status: number = 500,
    code?: string
): NextResponse<{ error: string; code?: string }> {
    const response: { error: string; code?: string } = { error };
    if (code) {
        response.code = code;
    }
    return NextResponse.json(response, { status });
}

/**
 * Handle validation errors and return appropriate response
 */
export function handleValidationError(
    error: unknown
): NextResponse<{ error: string }> {
    if (error instanceof ZodError) {
        const errors = error.errors.map((err) => {
            const path = err.path.join('.');
            return `${path}: ${err.message}`;
        });
        return createErrorResponse(`Validation failed: ${errors.join(', ')}`, 400);
    }

    if (error instanceof Error) {
        return createErrorResponse(error.message, 400);
    }

    return createErrorResponse('Invalid request', 400);
}

/**
 * Safe async handler wrapper that catches errors and returns proper responses
 */
export async function safeApiHandler<T>(
    handler: () => Promise<NextResponse<T>>,
    defaultError: string = 'An error occurred'
): Promise<NextResponse<T | { error: string }>> {
    try {
        return await handler();
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : defaultError;
        return createErrorResponse(errorMessage, 500);
    }
}



