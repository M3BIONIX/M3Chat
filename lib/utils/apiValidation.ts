import { ZodType} from 'zod';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';



/**
 * Validate request body with Zod schema
 */
export async function validateRequest<T>(
    request: NextRequest,
    schema: ZodType<T>
): Promise<{ success: true; data: T } | { success: false; error: string; status: number }> {
    try {
        const body = await request.json();
        const result = schema.safeParse(body);

        if (!result.success) {
            const errors = result.error.issues.map((err) => {
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
    schema: ZodType<T>
): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map((err) => {
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



