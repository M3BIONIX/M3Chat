import * as z from 'zod';


/**
 * Login request schema
 * Supports both password login and email verification
 */
export const LoginRequestSchema = z.object({
    email: z.string().email().optional(),
    password: z.string().optional(),
    code: z.string().optional(),
    pendingAuthenticationToken: z.string().optional(),
}).refine(
    (data) => {
        // Either email+password OR code+token must be provided
        const hasEmailPassword = data.email && data.password;
        const hasCodeToken = data.code && data.pendingAuthenticationToken;
        return hasEmailPassword || hasCodeToken;
    },
    {
        message: 'Either email+password or code+pendingAuthenticationToken must be provided',
    }
);

/**
 * Create user request schema
 */
export const CreateUserRequestSchema = z.object({
    email: z.email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
});


/**
 * Verify code request schema
 */
export const VerifyCodeRequestSchema = z.object({
    code: z.string().min(1, 'Verification code is required'),
});

export type VerifyCodeRequest = z.infer<typeof VerifyCodeRequestSchema>;

/**
 * Verify code response schema
 */
export const VerifyCodeResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export type VerifyCodeResponse = z.infer<typeof VerifyCodeResponseSchema>;

/**
 * Send code request schema
 */
export const SendCodeRequestSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export type SendCodeRequest = z.infer<typeof SendCodeRequestSchema>;

/**
 * Send code response schema
 */
export const SendCodeResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});




